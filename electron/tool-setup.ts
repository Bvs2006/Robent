import { execa } from 'execa'
import { spawnPty, type IPty } from './pty.js'
import * as os from 'os'
import { execSync } from 'child_process'
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { safeStorage } from 'electron'
import { getDb, getToolSecret, getToolStatuses, upsertToolSecret, upsertToolStatus } from './db.js'

/** Active PTY handles so the renderer can send stdin during interactive auth. */
const activeToolPtySessions = new Map<string, IPty>()

export type ToolId = 'claude-code' | 'codex' | 'antigravity' | 'aider' | 'opencode'
export type ToolStatus = 'not-installed' | 'installed-not-signed-in' | 'ready'
export type ToolActionKind = 'install' | 'auth' | 'terminal'

export interface ToolDefinition {
  id: ToolId
  name: string
  binary: string
  versionFlag: string
  installCommand: string
  authCommand?: string
  authArgs?: string[]
  authProbeCommand?: string
  authProbeArgs?: string[]
  authProbeStrict?: boolean
  authSuccessPatterns: RegExp[]
  authErrorPatterns: RegExp[]
  capability: string
}

export interface ToolSnapshot {
  toolId: ToolId
  name: string
  binary: string
  version: string | null
  installed: boolean
  authStatus: ToolStatus
  available: boolean
  details?: string | null
  lastCheckedAt: string
}

export const TOOL_DEFINITIONS: Record<ToolId, ToolDefinition> = {
  'claude-code': {
    id: 'claude-code',
    name: 'Claude Code',
    binary: 'claude',
    versionFlag: '--version',
    installCommand: 'npm install -g @anthropic-ai/claude-code',
    authCommand: 'claude',
    authArgs: ['auth', 'login'],
    authProbeCommand: 'claude',
    authProbeArgs: ['auth', 'status'],
    authProbeStrict: true,
    authSuccessPatterns: [/READY/i, /authenticated/i, /login successful/i, /loggedIn"?\s*:\s*true/i],
    authErrorPatterns: [/authentication required/i, /not logged in/i, /login required/i, /no credentials/i, /unauthorized/i, /401/i],
    capability: 'large refactors and multi-file reasoning',
  },
  codex: {
    id: 'codex',
    name: 'Codex',
    binary: 'codex',
    versionFlag: '--version',
    installCommand: 'npm install -g @openai/codex',
    authCommand: 'codex',
    authArgs: ['login'],
    authProbeCommand: 'codex',
    authProbeArgs: ['login', 'status'],
    authProbeStrict: true,
    authSuccessPatterns: [/signed in/i, /logged in/i, /authenticated/i, /account/i, /user/i],
    authErrorPatterns: [/authentication required/i, /not logged in/i, /login required/i, /no credentials/i, /unauthorized/i, /401/i],
    capability: 'small well-defined functions and boilerplate',
  },
  antigravity: {
    id: 'antigravity',
    name: 'Antigravity',
    binary: 'agy',
    versionFlag: '--version',
    installCommand:
      os.platform() === 'win32'
        ? 'powershell -NoProfile -ExecutionPolicy Bypass -Command "irm https://antigravity.google/cli/install.ps1 | iex"'
        : 'curl -fsSL https://antigravity.google/cli/install.sh | bash',
    authCommand: 'agy',
    authArgs: [],
    authProbeCommand: 'agy',
    authProbeArgs: ['models'],
    authProbeStrict: false,
    authSuccessPatterns: [/gemini/i, /claude/i, /ready/i, /authenticated/i, /signed in/i, /ok/i],
    authErrorPatterns: [/authentication required/i, /not logged in/i, /login required/i, /unauthorized/i, /401/i],
    capability: 'browser and UI verification',
  },
  aider: {
    id: 'aider',
    name: 'Aider',
    binary: 'aider',
    versionFlag: '--version',
    installCommand: 'pip install aider-chat',
    authSuccessPatterns: [/ready/i, /authenticated/i, /configured/i],
    authErrorPatterns: [/api key/i, /token/i, /authentication required/i, /unauthorized/i, /401/i],
    capability: 'small precise diffs and tight scope',
  },
  opencode: {
    id: 'opencode',
    name: 'OpenCode',
    binary: 'opencode',
    versionFlag: '--version',
    installCommand: 'npm install -g opencode-ai',
    authCommand: 'opencode',
    authArgs: ['providers', 'login'],
    authProbeCommand: 'opencode',
    authProbeArgs: ['providers', 'list'],
    authProbeStrict: false,
    authSuccessPatterns: [/credentials/i, /\d+\s*credentials/i, /provider/i, /ready/i, /authenticated/i, /signed in/i, /logged in/i, /connected/i, /ok/i],
    authErrorPatterns: [/authentication required/i, /not logged in/i, /login required/i, /no credentials/i, /unauthorized/i, /401/i],
    capability: 'general-purpose planning and fallback work',
  },
}

export const TOOL_IDS = Object.keys(TOOL_DEFINITIONS) as ToolId[]

/** True when the tool has an interactive/API auth path (not "install-only ready"). */
export function toolSupportsAuth(toolId: ToolId): boolean {
  if (toolId === 'aider') return true
  const def = TOOL_DEFINITIONS[toolId]
  return Boolean(def?.authCommand)
}

export function getAuthCapableToolIds(): ToolId[] {
  return TOOL_IDS.filter(toolSupportsAuth)
}

function shellQuote(value: string): string {
  if (/^[A-Za-z0-9_\-./:@=]+$/.test(value)) return value
  return `"${value.replace(/"/g, '\\"')}"`
}

function shellCommandLine(command: string, args: string[]): string {
  return [command, ...args.map(shellQuote)].join(' ')
}

function existingDirs(paths: string[]): string[] {
  return paths.filter((candidate) => candidate && existsSync(candidate))
}

function pythonScriptDirs(root?: string): string[] {
  if (!root || !existsSync(root)) return []
  try {
    const dirs: string[] = [root, join(root, 'Scripts')]
    for (const entry of readdirSync(root, { withFileTypes: true })) {
      if (entry.isDirectory() && /^Python\d+/i.test(entry.name)) {
        dirs.push(join(root, entry.name))
        dirs.push(join(root, entry.name, 'Scripts'))
      }
    }
    return dirs.filter((candidate) => candidate && existsSync(candidate))
  } catch {
    return []
  }
}

function normalizeWindowsCommandLine(commandLine: string): string {
  if (os.platform() !== 'win32') return commandLine
  return commandLine
    .replace(/^npm(?=\s)/i, 'npm.cmd')
    .replace(/^npx(?=\s)/i, 'npx.cmd')
    .replace(/^pip(?=\s)/i, 'python -m pip')
}

/**
 * Electron apps on Windows are commonly started from the Start menu and do
 * not inherit the PATH that the user's terminal has. npm global binaries
 * then appear to be missing even though `npm` can see them. Add the usual
 * npm/node locations to every probe and action without mutating the process
 * environment globally.
 */
export function toolEnv(): Record<string, string> {
  const env = { ...(process.env as Record<string, string>) }
  if (os.platform() !== 'win32') return env
  const userProfile = process.env.USERPROFILE || os.homedir()
  const candidates = [
    process.env.APPDATA ? join(process.env.APPDATA, 'npm') : '',
    process.env.LOCALAPPDATA ? join(process.env.LOCALAPPDATA, 'pnpm') : '',
    process.env.LOCALAPPDATA ? join(process.env.LOCALAPPDATA, 'Programs', 'nodejs') : '',
    process.env.ProgramFiles ? join(process.env.ProgramFiles, 'nodejs') : '',
    process.env['ProgramFiles(x86)'] ? join(process.env['ProgramFiles(x86)'], 'nodejs') : '',
    process.env.ProgramData ? join(process.env.ProgramData, 'chocolatey', 'bin') : '',
    process.env.LOCALAPPDATA ? join(process.env.LOCALAPPDATA, 'Microsoft', 'WindowsApps') : '',
    process.env.LOCALAPPDATA ? join(process.env.LOCALAPPDATA, 'agy', 'bin') : '',
    userProfile ? join(userProfile, 'AppData', 'Local', 'agy', 'bin') : '',
    userProfile ? join(userProfile, 'scoop', 'shims') : '',
    userProfile ? join(userProfile, '.local', 'bin') : '',
    userProfile ? join(userProfile, '.gemini', 'bin') : '',
    userProfile ? join(userProfile, '.antigravity', 'bin') : '',
    userProfile ? join(userProfile, 'bin') : '',
    ...pythonScriptDirs(process.env.APPDATA ? join(process.env.APPDATA, 'Python') : undefined),
    ...pythonScriptDirs(process.env.LOCALAPPDATA ? join(process.env.LOCALAPPDATA, 'Programs', 'Python') : undefined),
    ...pythonScriptDirs(process.env.LOCALAPPDATA ? join(process.env.LOCALAPPDATA, 'Python') : undefined),
    ...pythonScriptDirs(join(userProfile, 'AppData', 'Roaming', 'Python')),
    ...pythonScriptDirs(join(userProfile, 'AppData', 'Local', 'Programs', 'Python')),
  ].filter(Boolean)
  const current = (env.PATH || env.Path || '').split(';').filter(Boolean)
  const merged = [...new Set([...current, ...existingDirs(candidates)])]
  // Remove all PATH casings to avoid duplicate keys corrupting child process env
  delete env.Path
  delete env.path
  env.PATH = merged.join(';')
  return env
}

export function resolveToolBinary(binary: string): string {
  if (os.platform() !== 'win32') return binary
  if (existsSync(binary)) return binary

  try {
    const lines = (execSync(`where.exe ${binary}`, {
      env: toolEnv(),
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    }) as string)
      .trim()
      .split(/\r?\n/)
      .map((s: string) => s.trim())
      .filter(Boolean)

    if (lines.length === 0) return binary
    // Prefer .cmd, .exe, .bat on Windows
    const executable = lines.find((l: string) =>
      /\.(cmd|exe|bat)$/i.test(l),
    )
    return executable || lines[0] || binary
  } catch {
    return binary
  }
}

async function captureShellCommand(commandLine: string, timeout: number) {
  const isWin = os.platform() === 'win32'
  const shell = isWin ? 'cmd.exe' : 'bash'
  const shellArgs = isWin
    ? ['/d', '/s', '/c', normalizeWindowsCommandLine(commandLine)]
    : ['-lc', commandLine]

  return execa(shell, shellArgs, {
    reject: false,
    timeout,
    env: toolEnv(),
    windowsHide: true,
  })
}

function runShellCommand(commandLine: string, workdir: string, onOutput: (chunk: string) => void) {
  const isWin = os.platform() === 'win32'
  const shell = isWin ? 'cmd.exe' : 'bash'
  const normalizedCommandLine = normalizeWindowsCommandLine(commandLine)
  const shellArgs = isWin
    ? ['/d', '/s', '/c', normalizedCommandLine]
    : ['-lc', normalizedCommandLine]

  const ptyProcess = spawnPty(shell, shellArgs, {
    name: 'xterm-color',
    cols: 120,
    rows: 40,
    cwd: workdir,
    env: toolEnv(),
  })

  let rawOutput = ''
  const promise = new Promise<{ exitCode: number; rawOutput: string }>((resolve) => {
    ptyProcess.onData((data) => {
      rawOutput += data
      onOutput(data)
    })
    ptyProcess.onExit(({ exitCode }) => resolve({ exitCode, rawOutput }))
  })

  return { ptyProcess, promise }
}

export async function detectTool(binary: string, versionFlag: string): Promise<{ installed: boolean; version: string | null; details?: string | null }> {
  try {
    let result = await captureShellCommand(shellCommandLine(binary, [versionFlag]), 10000)
    let version = (result.stdout || result.stderr || '').trim() || null

    if (result.exitCode !== 0 && binary === 'opencode') {
      const fallbackCmd = os.platform() === 'win32' ? 'npx.cmd opencode --version' : 'npx opencode --version'
      const fallbackResult = await captureShellCommand(fallbackCmd, 10000)
      if (fallbackResult.exitCode === 0) {
        result = fallbackResult
        version = (fallbackResult.stdout || fallbackResult.stderr || '').trim() || null
      }
    }

    if (result.exitCode === 0) {
      return { installed: true, version }
    }

    if (os.platform() === 'win32') {
      const located = await captureShellCommand(shellCommandLine('where.exe', [binary]), 5000)
      const locations = `${located.stdout || ''}\n${located.stderr || ''}`.trim()
      if (located.exitCode === 0) {
        return {
          installed: false,
          version: null,
          details: `${binary} was found but could not run.${version ? `\n${version}` : ''}${locations ? `\n${locations}` : ''}`,
        }
      }
    }

    return { installed: false, version: null, details: version || null }
  } catch {
    return { installed: false, version: null }
  }
}

function hasAnyPattern(raw: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(raw))
}

async function detectAuth(tool: ToolDefinition, installed: boolean): Promise<{ status: ToolStatus; details?: string | null }> {
  if (!installed) return { status: 'not-installed' }

  if (tool.id === 'claude-code' && process.env.ANTHROPIC_API_KEY?.trim()) {
    return { status: 'ready', details: 'Authenticated via ANTHROPIC_API_KEY environment variable.' }
  }

  if (tool.id === 'aider') {
    const secret = getToolSecret(tool.id)
    if (secret?.secret_encrypted) {
      return { status: 'ready', details: 'API key configured in Robent secrets.' }
    }

    const standardEnvKeys = [
      'OPENAI_API_KEY',
      'ANTHROPIC_API_KEY',
      'GEMINI_API_KEY',
      'GOOGLE_API_KEY',
      'AIDER_API_KEY',
      'DEEPSEEK_API_KEY',
      'OPENROUTER_API_KEY',
      'GROQ_API_KEY',
      'MISTRAL_API_KEY',
      'XAI_API_KEY',
      'COHERE_API_KEY',
    ]
    const matchedEnv = standardEnvKeys.find((key) => Boolean(process.env[key]?.trim()))
    if (matchedEnv) {
      return { status: 'ready', details: `Authenticated via environment variable (${matchedEnv}).` }
    }

    const home = process.env.USERPROFILE || os.homedir()
    const aiderConf = join(home, '.aider.conf.yml')
    if (existsSync(aiderConf)) {
      return { status: 'ready', details: 'Configured via ~/.aider.conf.yml' }
    }

    return {
      status: 'installed-not-signed-in',
      details: 'No API key detected. Set OPENAI_API_KEY/ANTHROPIC_API_KEY in environment or save in Settings -> Tool Setup.',
    }
  }

  if (!tool.authCommand || !tool.authArgs) {
    return { status: 'ready', details: 'CLI is installed.' }
  }

  if (tool.id === 'opencode') {
    const home = process.env.USERPROFILE || os.homedir()
    const configCandidates = [
      join(home, '.local', 'share', 'opencode', 'auth.json'),
      process.env.LOCALAPPDATA ? join(process.env.LOCALAPPDATA, 'opencode', 'auth.json') : '',
      process.env.APPDATA ? join(process.env.APPDATA, 'opencode', 'auth.json') : '',
    ].filter(Boolean)

    for (const file of configCandidates) {
      if (existsSync(file)) {
        try {
          const content = readFileSync(file, 'utf8')
          if (content.length > 5 && !content.includes('"credentials": {}')) {
            return { status: 'ready', details: `Authenticated via config file: ${file}` }
          }
        } catch {
          /* pass */
        }
      }
    }
  }

  try {
    const probeCommand = tool.authProbeCommand || tool.authCommand
    const probeArgs = tool.authProbeArgs || tool.authArgs
    const probe = await captureShellCommand(shellCommandLine(probeCommand, probeArgs), 15000)
    const raw = `${probe.stdout || ''}\n${probe.stderr || ''}`.trim()

    if (probe.exitCode === 0 && (!tool.authProbeStrict || hasAnyPattern(raw, tool.authSuccessPatterns) || raw.length === 0)) {
      return { status: 'ready', details: raw || 'CLI is ready.' }
    }

    if (hasAnyPattern(raw, tool.authSuccessPatterns)) {
      return { status: 'ready', details: raw || 'CLI is ready.' }
    }

    if (hasAnyPattern(raw, tool.authErrorPatterns)) {
      return { status: 'installed-not-signed-in', details: raw || null }
    }

    if (tool.authProbeStrict) {
      return { status: 'installed-not-signed-in', details: raw || 'Sign-in required.' }
    }

    // Default to ready if binary is installed and no auth error was explicitly reported
    return { status: 'ready', details: raw || 'CLI is ready.' }
  } catch (error) {
    return { status: 'installed-not-signed-in', details: error instanceof Error ? error.message : 'Unable to verify sign-in.' }
  }
}

export async function refreshToolStatuses(): Promise<ToolSnapshot[]> {
  const snapshots = await Promise.all(TOOL_IDS.map(async (tool) => {
    const def = TOOL_DEFINITIONS[tool]
    const detected = await detectTool(def.binary, def.versionFlag)
    const auth = await detectAuth(def, detected.installed)
    const snapshot: ToolSnapshot = {
      toolId: def.id,
      name: def.name,
      binary: def.binary,
      version: detected.version,
      installed: detected.installed,
      authStatus: auth.status,
      available: auth.status === 'ready',
      details: auth.details || detected.details || null,
      lastCheckedAt: new Date().toISOString(),
    }

    upsertToolStatus({
      toolId: snapshot.toolId,
      name: snapshot.name,
      binary: snapshot.binary,
      version: snapshot.version,
      installed: snapshot.installed,
      authStatus: snapshot.authStatus,
      available: snapshot.available,
      details: snapshot.details,
    })

    return snapshot
  }))

  syncAgentProfiles(snapshots)
  return snapshots
}

export function getToolStatusSnapshots(): ToolSnapshot[] {
  return getToolStatuses().map((row) => ({
    toolId: row.tool_id as ToolId,
    name: row.name,
    binary: row.binary,
    version: row.version,
    installed: row.installed === 1,
    authStatus: row.auth_status as ToolStatus,
    available: row.available === 1,
    details: row.details || null,
    lastCheckedAt: row.last_checked_at,
  }))
}

export function getSetupCompleted(): boolean {
  const value = getDb().prepare(`SELECT value FROM settings WHERE key = ?`).get('toolSetupCompleted') as { value?: string } | undefined
  return value?.value === 'true'
}

export function setSetupCompleted(completed: boolean): void {
  getDb().prepare(`INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`).run('toolSetupCompleted', completed ? 'true' : 'false')
}

export function saveToolSecret(toolId: ToolId, label: string, secret: string): void {
  const encrypted = safeStorage.isEncryptionAvailable() ? safeStorage.encryptString(secret).toString('base64') : Buffer.from(secret, 'utf8').toString('base64')
  upsertToolSecret(toolId, label, encrypted)
}

export function getToolSecretPlaintext(toolId: ToolId): string | null {
  const secret = getToolSecret(toolId)
  if (!secret) return null

  try {
    const encryptedBytes = Buffer.from(secret.secret_encrypted, 'base64')
    return safeStorage.isEncryptionAvailable() ? safeStorage.decryptString(encryptedBytes) : encryptedBytes.toString('utf8')
  } catch {
    return null
  }
}

export interface ToolActionResult {
  sessionId: string
  promise: Promise<{ exitCode: number; rawOutput: string }>
}

export function writeToolSessionInput(sessionId: string, data: string): boolean {
  const pty = activeToolPtySessions.get(sessionId)
  if (!pty) return false
  try {
    pty.write(data)
    return true
  } catch {
    return false
  }
}

export function killToolSession(sessionId: string): boolean {
  const pty = activeToolPtySessions.get(sessionId)
  if (!pty) return false
  try {
    pty.kill()
    return true
  } catch {
    return false
  }
}

export function runToolAction(
  toolId: ToolId,
  kind: ToolActionKind,
  onOutput: (chunk: string) => void,
  onSuccessSignal?: (chunk: string) => void,
  secret?: string,
  cwd?: string,
): ToolActionResult {
  const def = TOOL_DEFINITIONS[toolId]
  const sessionId = `${toolId}-${Math.random().toString(36).slice(2, 9)}`

  let commandLine = ''
  if (kind === 'install') {
    commandLine = normalizeWindowsCommandLine(def.installCommand)
  } else if (kind === 'terminal') {
    commandLine = resolveToolBinary(def.binary)
  } else if (toolId === 'aider') {
    if (secret) saveToolSecret(toolId, 'Aider API key', secret)
    commandLine = 'echo Aider API key saved.'
  } else {
    const loginCommand = def.authCommand || def.binary
    const loginArgs = def.authArgs && def.authArgs.length > 0 ? def.authArgs : []
    commandLine = shellCommandLine(loginCommand, loginArgs)
  }

  const { ptyProcess, promise } = runShellCommand(commandLine, cwd || process.cwd(), (chunk) => {
    onOutput(chunk)
    if (onSuccessSignal && hasAnyPattern(chunk, def.authSuccessPatterns)) {
      onSuccessSignal(chunk)
    }
  })

  activeToolPtySessions.set(sessionId, ptyProcess)
  const tracked = promise.finally(() => {
    activeToolPtySessions.delete(sessionId)
  })

  return { sessionId, promise: tracked }
}

export function syncAgentProfiles(statuses: ToolSnapshot[]): void {
  const profilePath = join(process.cwd(), 'agent-profiles.json')
  const profiles = TOOL_IDS.map((toolId) => {
    const def = TOOL_DEFINITIONS[toolId]
    const status = statuses.find((item) => item.toolId === toolId)

    return {
      id: def.id,
      name: def.name,
      binary: def.binary,
      capability: def.capability,
      available: status ? status.available : false,
      status: status?.authStatus || 'not-installed',
      version: status?.version || null,
    }
  })

  writeFileSync(profilePath, JSON.stringify(profiles, null, 2), 'utf8')
}

export function loadAgentProfilesFromDisk(): any[] {
  const profilePath = join(process.cwd(), 'agent-profiles.json')
  if (!existsSync(profilePath)) return []
  try {
    return JSON.parse(readFileSync(profilePath, 'utf8'))
  } catch {
    return []
  }
}

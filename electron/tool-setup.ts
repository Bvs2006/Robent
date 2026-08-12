import { execa } from 'execa'
import { spawn } from 'node-pty'
import * as os from 'os'
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { safeStorage } from 'electron'
import { getDb, getToolSecret, getToolStatuses, upsertToolSecret, upsertToolStatus } from './db.js'

export type ToolId = 'claude-code' | 'codex' | 'antigravity' | 'aider' | 'opencode'
export type ToolStatus = 'not-installed' | 'installed-not-signed-in' | 'ready'
export type ToolActionKind = 'install' | 'auth'

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
    authArgs: ['-p', 'Return READY if authenticated.', '--output-format', 'json'],
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
    installCommand: 'npm install -g @google/antigravity-cli',
    authCommand: 'agy',
    authArgs: ['status'],
    authSuccessPatterns: [/ready/i, /authenticated/i, /signed in/i, /ok/i],
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
    installCommand: 'npm install -g opencode',
    authCommand: 'opencode',
    authArgs: ['auth', 'login'],
    authProbeCommand: 'opencode',
    authProbeArgs: ['auth', 'list'],
    authProbeStrict: true,
    authSuccessPatterns: [/ready/i, /authenticated/i, /signed in/i, /logged in/i, /connected/i, /provider/i, /ok/i],
    authErrorPatterns: [/authentication required/i, /not logged in/i, /login required/i, /no credentials/i, /unauthorized/i, /401/i],
    capability: 'general-purpose planning and fallback work',
  },
}

export const TOOL_IDS = Object.keys(TOOL_DEFINITIONS) as ToolId[]

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
    return readdirSync(root, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && /^Python\d+/i.test(entry.name))
      .map((entry) => join(root, entry.name, 'Scripts'))
      .filter((candidate) => existsSync(candidate))
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
 * not inherit the PATH that the user's terminal has.  npm global binaries
 * then appear to be missing even though `npm` can see them.  Add the usual
 * npm/node locations to every probe and action without mutating the process
 * environment globally.
 */
function toolEnv(): Record<string, string> {
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
    userProfile ? join(userProfile, 'scoop', 'shims') : '',
    userProfile ? join(userProfile, '.local', 'bin') : '',
    ...pythonScriptDirs(process.env.APPDATA ? join(process.env.APPDATA, 'Python') : undefined),
    ...pythonScriptDirs(process.env.LOCALAPPDATA ? join(process.env.LOCALAPPDATA, 'Programs', 'Python') : undefined),
  ].filter(Boolean)
  const current = (env.PATH || env.Path || '').split(';').filter(Boolean)
  const merged = [...new Set([...current, ...existingDirs(candidates)])]
  env.PATH = merged.join(';')
  env.Path = env.PATH
  return env
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

  const ptyProcess = spawn(shell, shellArgs, {
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
    const result = await captureShellCommand(shellCommandLine(binary, [versionFlag]), 10000)
    const version = (result.stdout || result.stderr || '').trim() || null
    // A shell can return stderr for a failed command (for example, "not
    // recognized"), so output alone is not proof that the CLI is installed.
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

  if (tool.id === 'aider') {
    const secret = getToolSecret(tool.id)
    if (secret?.secret_encrypted) {
      return { status: 'ready' }
    }
    return { status: 'installed-not-signed-in' }
  }

  if (!tool.authCommand || !tool.authArgs) {
    return { status: 'ready', details: 'CLI is installed.' }
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

export function runToolAction(
  toolId: ToolId,
  kind: ToolActionKind,
  onOutput: (chunk: string) => void,
  onSuccessSignal?: (chunk: string) => void,
  secret?: string,
): ToolActionResult {
  const def = TOOL_DEFINITIONS[toolId]
  const sessionId = `${toolId}-${Math.random().toString(36).slice(2, 9)}`

  let commandLine = ''
  if (kind === 'install') {
    commandLine = normalizeWindowsCommandLine(def.installCommand)
  } else if (toolId === 'aider') {
    if (secret) saveToolSecret(toolId, 'Aider API key', secret)
    commandLine = 'echo Aider API key saved.'
  } else {
    const loginCommand = def.authCommand || def.binary
    const loginArgs = def.authArgs && def.authArgs.length > 0 ? def.authArgs : []
    commandLine = shellCommandLine(loginCommand, loginArgs)
  }

  const { promise } = runShellCommand(commandLine, process.cwd(), (chunk) => {
    onOutput(chunk)
    if (onSuccessSignal && hasAnyPattern(chunk, def.authSuccessPatterns)) {
      onSuccessSignal(chunk)
    }
  })

  return { sessionId, promise }
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

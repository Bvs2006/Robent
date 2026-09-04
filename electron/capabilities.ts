import * as fs from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { execa } from 'execa'
import * as os from 'node:os'
import { getHooks, getMcpServers, getPlugins, getSkills } from './db.js'
import { toolEnv } from './tool-setup.js'

export type CapabilityTransport = 'stdio' | 'http' | 'sse'

export interface CentralMcpServer {
  id: string
  name: string
  transport: CapabilityTransport
  command: string
  url: string
  args: string
  env: string
  enabled: boolean
}

export interface CentralSkill {
  id: string
  name: string
  description: string
  content: string
  tags: string
  enabled: boolean
}

export interface CentralPlugin {
  id: string
  name: string
  source: string
  version: string
  enabled: boolean
}

export interface CentralHook {
  id: string
  name: string
  event: 'pre-task' | 'post-task' | 'pre-command' | 'post-command' | 'on-failure'
  command: string
  scope: string
  enabled: boolean
}

export interface CapabilityRegistry {
  mcpServers: CentralMcpServer[]
  skills: CentralSkill[]
  plugins: CentralPlugin[]
  hooks: CentralHook[]
}

export interface SyncContext {
  skillIds?: string[]
}

export interface SyncResult {
  ok: boolean
  unavailable: boolean
  logs: string[]
  error?: string
}

const slugify = (value: string) =>
  value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'item'

function parseJsonArray(value: string | null | undefined): string[] {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch {
    return value.split(',').map((item) => item.trim()).filter(Boolean)
  }
}

function parseJsonObject(value: string | null | undefined): Record<string, string> {
  if (!value) return {}
  try {
    const parsed = JSON.parse(value)
    return typeof parsed === 'object' && parsed ? parsed : {}
  } catch {
    return {}
  }
}

function parseMcpServers(): CentralMcpServer[] {
  return getMcpServers().map((row: any) => ({
    id: row.id,
    name: row.name,
    transport: (row.transport || 'stdio') as CapabilityTransport,
    command: row.command || '',
    url: row.url || '',
    args: row.args || '[]',
    env: row.env || '{}',
    enabled: (row.enabled ?? row.is_enabled ?? 1) === 1,
  }))
}

function parseSkills(): CentralSkill[] {
  return getSkills().map((row: any) => ({
    id: row.id,
    name: row.name,
    description: row.description || '',
    content: row.content || '',
    tags: row.tags || '[]',
    enabled: (row.enabled ?? 1) === 1,
  }))
}

function parsePlugins(): CentralPlugin[] {
  return getPlugins().map((row: any) => ({
    id: row.id,
    name: row.name,
    source: row.source || row.command || '',
    version: row.version || '',
    enabled: (row.enabled ?? row.is_enabled ?? 1) === 1,
  }))
}

function parseHooks(): CentralHook[] {
  return getHooks().map((row: any) => ({
    id: row.id,
    name: row.name,
    event: row.event || 'pre-task',
    command: row.command || '',
    scope: row.scope || 'global',
    enabled: (row.enabled ?? row.is_enabled ?? 0) === 1,
  }))
}

export function getCapabilityRegistry(): CapabilityRegistry {
  return {
    mcpServers: parseMcpServers(),
    skills: parseSkills(),
    plugins: parsePlugins(),
    hooks: parseHooks(),
  }
}

export async function runHookCommand(
  commandLine: string,
  workdir: string,
  timeoutMs = 15000,
): Promise<{ ok: boolean; exitCode: number; output: string }> {
  try {
    const isWin = os.platform() === 'win32'

    const result = await execa(commandLine, {
      cwd: workdir,
      reject: false,
      timeout: timeoutMs,
      env: toolEnv(),
      windowsHide: true,
      shell: isWin ? 'cmd.exe' : 'bash',
    })

    const output = (result.stdout || result.stderr || '').trim()
    return {
      ok: result.exitCode === 0,
      exitCode: result.exitCode ?? (result.timedOut ? 124 : 1),
      output: result.timedOut ? `Timed out after ${timeoutMs / 1000}s\n${output}` : output || 'Hook executed cleanly.',
    }
  } catch (err: any) {
    return {
      ok: false,
      exitCode: 1,
      output: err?.message || 'Hook execution failed',
    }
  }
}

function clearDirectory(targetDir: string) {
  if (!fs.existsSync(targetDir)) return
  fs.rmSync(targetDir, { recursive: true, force: true })
}

function ensureDir(targetDir: string) {
  fs.mkdirSync(targetDir, { recursive: true })
}

function writeJson(targetPath: string, value: unknown) {
  ensureDir(dirname(targetPath))
  fs.writeFileSync(targetPath, JSON.stringify(value, null, 2), 'utf8')
}

function writeSkillFile(targetPath: string, skill: CentralSkill) {
  ensureDir(dirname(targetPath))
  const tags = parseJsonArray(skill.tags)
  const frontmatter = [
    '---',
    `name: ${skill.name}`,
    `description: ${skill.description || skill.name}`,
    `tags: [${tags.map((tag) => JSON.stringify(tag)).join(', ')}]`,
    '---',
    '',
    skill.content,
    '',
  ].join('\n')
  fs.writeFileSync(targetPath, frontmatter, 'utf8')
}

function formatMcpServersMap(servers: CentralMcpServer[]): Record<string, any> {
  const map: Record<string, any> = {}
  for (const server of servers) {
    if (!server.enabled) continue
    if (server.transport === 'stdio') {
      map[server.name] = {
        command: server.command,
        args: parseJsonArray(server.args),
        env: parseJsonObject(server.env),
      }
    } else {
      map[server.name] = {
        url: server.url,
        transport: server.transport,
      }
    }
  }
  return map
}

function formatCodexToml(servers: CentralMcpServer[]): string {
  const lines: string[] = ['# Codex MCP Configuration generated by Robent', '']
  for (const server of servers) {
    if (!server.enabled) continue
    const key = slugify(server.name).replace(/-/g, '_')
    lines.push(`[mcp_servers.${key}]`)
    if (server.transport === 'stdio') {
      lines.push(`command = ${JSON.stringify(server.command)}`)
      lines.push(`args = ${JSON.stringify(parseJsonArray(server.args))}`)
      const envObj = parseJsonObject(server.env)
      if (Object.keys(envObj).length > 0) {
        lines.push(`[mcp_servers.${key}.env]`)
        for (const [k, v] of Object.entries(envObj)) {
          lines.push(`${k} = ${JSON.stringify(v)}`)
        }
      }
    } else {
      lines.push(`url = ${JSON.stringify(server.url)}`)
      lines.push(`transport = ${JSON.stringify(server.transport)}`)
    }
    lines.push('')
  }
  return lines.join('\n')
}

export async function testMcpServerConnection(server: CentralMcpServer): Promise<{ ok: boolean; message: string }> {
  try {
    if (server.transport === 'stdio') {
      if (!server.command?.trim()) {
        return { ok: false, message: 'Missing executable command' }
      }
      const module = await import('@modelcontextprotocol/sdk/client/index.js') as any
      const transportModule = await import('@modelcontextprotocol/sdk/client/stdio.js') as any
      const client = new module.Client({ name: 'robent-capabilities-check', version: '1.0.0' })
      const transport = new transportModule.StdioClientTransport({
        command: server.command,
        args: parseJsonArray(server.args),
        env: { ...toolEnv(), ...parseJsonObject(server.env) },
      })

      const connectPromise = async () => {
        await client.connect(transport)
        await client.listTools()
      }

      const timeoutPromise = new Promise<{ ok: boolean; message: string }>((_, reject) =>
        setTimeout(() => reject(new Error('Connection timed out after 8s')), 8000),
      )

      try {
        await Promise.race([connectPromise(), timeoutPromise])
        return { ok: true, message: 'Connection successful' }
      } finally {
        await client.close().catch(() => undefined)
      }
    }

    if (!server.url?.trim()) {
      return { ok: false, message: 'Missing server URL' }
    }

    const response = await fetch(server.url, {
      headers: { Accept: 'text/event-stream, application/json, text/plain, */*' },
      signal: AbortSignal.timeout(8000),
    })
    if (!response.ok && response.status !== 405) {
      return { ok: false, message: `HTTP ${response.status}` }
    }
    return { ok: true, message: 'Connection successful' }
  } catch (error: any) {
    return { ok: false, message: error?.message || 'Connection failed' }
  }
}

export function syncClaudeCodeConfig(workdir: string, context: SyncContext = {}): SyncResult {
  const logs: string[] = []
  try {
    const registry = getCapabilityRegistry()
    const root = resolve(workdir)
    const mcpPath = join(root, '.mcp.json')
    const skillRoot = join(root, '.claude', 'skills')
    clearDirectory(skillRoot)

    const mcpServers = formatMcpServersMap(registry.mcpServers)
    writeJson(mcpPath, { mcpServers })
    logs.push(`Wrote ${mcpPath}`)

    const selectedSkills = selectSkills(registry.skills, context.skillIds)
    for (const skill of selectedSkills) {
      const skillPath = join(skillRoot, slugify(skill.name), 'SKILL.md')
      writeSkillFile(skillPath, skill)
    }

    const enabledHooks = registry.hooks.filter(
      (h) => h.enabled && (h.scope === 'global' || h.scope === 'claude-code' || h.scope === 'claude'),
    )
    if (enabledHooks.length > 0) {
      const hooksPath = join(root, '.claude', 'hooks.json')
      const hooksObj: Record<string, string[]> = {}
      for (const hook of enabledHooks) {
        hooksObj[hook.event] = [...(hooksObj[hook.event] || []), hook.command]
      }
      writeJson(hooksPath, hooksObj)
      logs.push(`Wrote ${hooksPath}`)
    }

    return { ok: true, unavailable: false, logs }
  } catch (error: any) {
    return { ok: false, unavailable: false, logs, error: error?.message || 'Claude sync failed' }
  }
}

export function syncCodexConfig(workdir: string, context: SyncContext = {}): SyncResult {
  const logs: string[] = []
  try {
    const registry = getCapabilityRegistry()
    const root = resolve(workdir)
    const codexRoot = join(root, '.codex')
    const configPath = join(codexRoot, 'config.toml')
    const skillRoot = join(codexRoot, 'skills')
    clearDirectory(skillRoot)
    ensureDir(codexRoot)

    const toml = formatCodexToml(registry.mcpServers)
    fs.writeFileSync(configPath, toml, 'utf8')
    logs.push(`Wrote ${configPath}`)

    const selectedSkills = selectSkills(registry.skills, context.skillIds)
    for (const skill of selectedSkills) {
      const skillPath = join(skillRoot, `${slugify(skill.name)}.md`)
      writeSkillFile(skillPath, skill)
    }

    return { ok: true, unavailable: false, logs }
  } catch (error: any) {
    return { ok: false, unavailable: false, logs, error: error?.message || 'Codex sync failed' }
  }
}

export function syncAntigravityConfig(workdir: string, context: SyncContext = {}): SyncResult {
  const logs: string[] = []
  try {
    const registry = getCapabilityRegistry()
    const root = resolve(workdir)
    const settingsPath = join(root, '.antigravity', 'settings.json')
    const skillRoot = join(root, '.agents', 'skills')
    const pluginRoot = join(root, '.antigravity', 'plugins')
    clearDirectory(skillRoot)
    ensureDir(pluginRoot)

    const settings = {
      mcpServers: formatMcpServersMap(registry.mcpServers),
    }
    writeJson(settingsPath, settings)
    logs.push(`Wrote ${settingsPath}`)

    const selectedSkills = selectSkills(registry.skills, context.skillIds)
    for (const skill of selectedSkills) {
      const skillPath = join(skillRoot, slugify(skill.name), 'SKILL.md')
      writeSkillFile(skillPath, skill)
    }

    const enabledPlugins = registry.plugins.filter((plugin) => plugin.enabled)
    for (const plugin of enabledPlugins) {
      const pluginPath = join(pluginRoot, `${slugify(plugin.name)}.json`)
      writeJson(pluginPath, plugin)
    }

    return { ok: true, unavailable: false, logs }
  } catch (error: any) {
    return { ok: false, unavailable: false, logs, error: error?.message || 'Antigravity sync failed' }
  }
}

export function syncAiderConfig(_workdir: string, _context: SyncContext = {}): SyncResult {
  return {
    ok: true,
    unavailable: false,
    logs: ['Aider capabilities are injected directly into the task prompt.'],
  }
}

export function syncOpenCodeConfig(workdir: string, context: SyncContext = {}): SyncResult {
  const logs: string[] = []
  try {
    const registry = getCapabilityRegistry()
    const root = resolve(workdir)
    const configPath = join(root, 'opencode.json')
    const skillRoot = join(root, '.opencode', 'skills')
    clearDirectory(skillRoot)

    const config = {
      tools: {
        '*': true,
      },
      mcpServers: formatMcpServersMap(registry.mcpServers),
    }
    writeJson(configPath, config)
    logs.push(`Wrote ${configPath}`)

    const selectedSkills = selectSkills(registry.skills, context.skillIds)
    for (const skill of selectedSkills) {
      const skillPath = join(skillRoot, slugify(skill.name), 'SKILL.md')
      writeSkillFile(skillPath, skill)
    }

    return { ok: true, unavailable: false, logs }
  } catch (error: any) {
    return { ok: false, unavailable: false, logs, error: error?.message || 'OpenCode sync failed' }
  }
}

export function syncCapabilitiesForDriver(driverName: string, workdir: string, context: SyncContext = {}): SyncResult {
  switch (driverName.toLowerCase().replace(/\s+/g, '-')) {
    case 'claude-code':
    case 'claude':
      return syncClaudeCodeConfig(workdir, context)
    case 'codex':
      return syncCodexConfig(workdir, context)
    case 'antigravity':
    case 'agy':
      return syncAntigravityConfig(workdir, context)
    case 'aider':
      return syncAiderConfig(workdir, context)
    case 'opencode':
      return syncOpenCodeConfig(workdir, context)
    default:
      return { ok: true, unavailable: true, logs: [`No capability sync adapter for ${driverName}`] }
  }
}

export function composePromptForDriver(driverName: string, prompt: string, context: SyncContext = {}): string {
  const normalized = driverName.toLowerCase().replace(/\s+/g, '-')
  const registry = getCapabilityRegistry()
  const sections: string[] = []

  // If driver does not natively discover file-based skills (like Aider), inject them into prompt text
  if (normalized.includes('aider')) {
    const selectedSkills = selectSkills(registry.skills, context.skillIds)
    if (selectedSkills.length > 0) {
      sections.push(selectedSkills.map((skill) => `## Skill: ${skill.name}\n${skill.description ? `> ${skill.description}\n\n` : ''}${skill.content}`).join('\n\n'))
    }
    const enabledServers = registry.mcpServers.filter((s) => s.enabled)
    if (enabledServers.length > 0) {
      sections.push(`## Available Tools & MCP Servers\n` + enabledServers.map((s) => `- **${s.name}** (${s.transport}): ${s.command || s.url}`).join('\n'))
    }
  }

  if (sections.length === 0) return prompt
  return `${sections.join('\n\n')}\n\n## Task\n${prompt}`
}

function selectSkills(skills: CentralSkill[], skillIds?: string[]): CentralSkill[] {
  const selected = skillIds && skillIds.length > 0
    ? skills.filter((skill) => skill.enabled && skillIds.includes(skill.id))
    : skills.filter((skill) => skill.enabled)
  return selected
}

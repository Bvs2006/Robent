import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs'
import { dirname, join, resolve } from 'path'
import { execa } from 'execa'
import { getDb, getMcpServers, getPlugins, getSkills } from './db.js'

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

export interface CapabilityRegistry {
  mcpServers: CentralMcpServer[]
  skills: CentralSkill[]
  plugins: CentralPlugin[]
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

const AGENT_ROOT = process.cwd()

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

export function getCapabilityRegistry(): CapabilityRegistry {
  return {
    mcpServers: parseMcpServers(),
    skills: parseSkills(),
    plugins: parsePlugins(),
  }
}

function clearDirectory(targetDir: string) {
  if (!existsSync(targetDir)) return
  rmSync(targetDir, { recursive: true, force: true })
}

function ensureDir(targetDir: string) {
  mkdirSync(targetDir, { recursive: true })
}

function writeJson(targetPath: string, value: unknown) {
  ensureDir(dirname(targetPath))
  writeFileSync(targetPath, JSON.stringify(value, null, 2), 'utf8')
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
  writeFileSync(targetPath, frontmatter, 'utf8')
}

export async function testMcpServerConnection(server: CentralMcpServer): Promise<{ ok: boolean; message: string }> {
  try {
    if (!server.enabled) return { ok: false, message: 'Server is disabled' }

    if (server.transport === 'stdio') {
      const module = await import('@modelcontextprotocol/sdk/client/index.js') as any
      const transportModule = await import('@modelcontextprotocol/sdk/client/stdio.js') as any
      const client = new module.Client({ name: 'robent-capabilities-check', version: '1.0.0' })
      const transport = new transportModule.StdioClientTransport({
        command: server.command,
        args: parseJsonArray(server.args),
        env: parseJsonObject(server.env),
      })
      await client.connect(transport)
      await client.listTools()
      await client.close()
      return { ok: true, message: 'Connection successful' }
    }

    const response = await fetch(server.url)
    if (!response.ok) {
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

    const mcpServers = registry.mcpServers.filter((server) => server.enabled).map((server) => ({
      name: server.name,
      transport: server.transport,
      command: server.command,
      url: server.url,
      args: parseJsonArray(server.args),
      env: parseJsonObject(server.env),
    }))
    writeJson(mcpPath, { mcpServers })
    logs.push(`Wrote ${mcpPath}`)

    const selectedSkills = selectSkills(registry.skills, context.skillIds)
    for (const skill of selectedSkills) {
      const skillPath = join(skillRoot, slugify(skill.name), 'SKILL.md')
      writeSkillFile(skillPath, skill)
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

    const enabledMcpServers = registry.mcpServers.filter((server) => server.enabled)
    const toml = [
      '[mcp_servers]',
      ...enabledMcpServers.map((server) => `[[mcp_servers.${slugify(server.name)}]]\nname = ${JSON.stringify(server.name)}\ntransport = ${JSON.stringify(server.transport)}\ncommand = ${JSON.stringify(server.command)}\nurl = ${JSON.stringify(server.url)}\nargs = ${JSON.stringify(parseJsonArray(server.args))}\nenv = ${JSON.stringify(parseJsonObject(server.env))}`),
      '',
    ].join('\n')
    writeFileSync(configPath, toml, 'utf8')
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
      mcpServers: registry.mcpServers.filter((server) => server.enabled).map((server) => ({
        name: server.name,
        transport: server.transport,
        command: server.command,
        url: server.url,
        args: parseJsonArray(server.args),
        env: parseJsonObject(server.env),
      })),
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
    unavailable: true,
    logs: ['Aider has no native MCP or skill config; capabilities are prepended into the task prompt.'],
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

    const enabledMcpServers = registry.mcpServers.filter((server) => server.enabled)
    const config = {
      mcpServers: enabledMcpServers.map((server) => ({
        name: server.name,
        transport: server.transport,
        command: server.command,
        url: server.url,
        args: parseJsonArray(server.args),
        env: parseJsonObject(server.env),
      })),
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
  if (normalized !== 'aider') return prompt

  const registry = getCapabilityRegistry()
  const selectedSkills = selectSkills(registry.skills, context.skillIds)
  if (selectedSkills.length === 0) return prompt

  const prefix = selectedSkills.map((skill) => `## ${skill.name}\n${skill.content}`).join('\n\n')
  return `${prefix}\n\n${prompt}`
}

function selectSkills(skills: CentralSkill[], skillIds?: string[]): CentralSkill[] {
  const selected = skillIds && skillIds.length > 0
    ? skills.filter((skill) => skill.enabled && skillIds.includes(skill.id))
    : skills.filter((skill) => skill.enabled)
  return selected
}

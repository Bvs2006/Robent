/**
 * electron/mcp.ts — Shared MCP Server Connection Layer
 * 
 * Loads MCP server configs from SQLite, generates per-agent configuration files,
 * and exposes utilities to connect agents to MCP tools.
 */
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'
import { getMcpServers } from './db.js'

export interface McpServerConfig {
  id: string
  name: string
  command: string
  args: string[]
  env: Record<string, string>
  isEnabled: boolean
}

/** Map agent names to their config file location and format */
const AGENT_CONFIG_PATHS: Record<string, { path: (workdir: string) => string; format: 'json' | 'yaml' }> = {
  'Claude Code': {
    path: (workdir) => join(workdir, '.mcp.json'),
    format: 'json',
  },
  'Cursor': {
    path: (workdir) => join(workdir, '.cursor', 'mcp.json'),
    format: 'json',
  },
  'OpenCode': {
    path: (workdir) => join(workdir, 'opencode.json'),
    format: 'json',
  },
  'Codex': {
    path: (workdir) => join(workdir, 'codex-mcp.json'),
    format: 'json',
  },
  'Aider': {
    path: (workdir) => join(workdir, '.aider-mcp.json'),
    format: 'json',
  },
}

/** Get active MCP server configs from DB */
export function getActiveMcpServers(): McpServerConfig[] {
  const rows = getMcpServers()
  return rows
    .filter((r: any) => r.is_enabled === 1)
    .map((r: any) => ({
      id: r.id,
      name: r.name,
      command: r.command,
      args: JSON.parse(r.args || '[]'),
      env: JSON.parse(r.env || '{}'),
      isEnabled: r.is_enabled === 1,
    }))
}

/** Generate per-agent MCP config file before task runs */
export function writeAgentMcpConfig(agent: string, workdir: string): string | null {
  const servers = getActiveMcpServers()
  if (servers.length === 0) return null

  const agentKey = agent.toLowerCase().replace(/\s+/g, '-')
  const config = AGENT_CONFIG_PATHS[agent] || AGENT_CONFIG_PATHS[agentKey]
  if (!config) return null

  const configPath = config.path(workdir)
  const configDir = join(...configPath.split(/[/\\]/).slice(0, -1))

  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true })
  }

  let fileContent: string
  if (config.format === 'json') {
    fileContent = JSON.stringify({ mcpServers: servers.map(s => ({
      name: s.name,
      command: s.command,
      args: s.args,
      env: s.env,
    })) }, null, 2)
  } else {
    fileContent = ''
  }

  writeFileSync(configPath, fileContent)
  return configPath
}

/** Get MCP server connection info for a specific agent */
export function getAgentMcpConfig(agent: string, workdir: string): { path: string; servers: McpServerConfig[] } | null {
  const servers = getActiveMcpServers()
  const agentKey = agent.toLowerCase().replace(/\s+/g, '-')
  const config = AGENT_CONFIG_PATHS[agent] || AGENT_CONFIG_PATHS[agentKey]
  if (!config) return null

  return {
    path: config.path(workdir),
    servers,
  }
}
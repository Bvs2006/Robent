/**
 * electron/db.ts — SQLite Job Store
 * All persistent state: jobs, agents, credentials, activities, MCP servers, skills
 */
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const Database = require('better-sqlite3') as typeof import('better-sqlite3')

import { join } from 'path'
import { app } from 'electron'
import { mkdirSync } from 'fs'

type SqliteDatabase = InstanceType<typeof Database>

let db: SqliteDatabase

export function getDb(): SqliteDatabase {
  if (!db) {
    const userDataPath = app.getPath('userData')
    mkdirSync(userDataPath, { recursive: true })
    db = new Database(join(userDataPath, 'robent.db'))
    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = ON')
    initSchema()
  }
  return db
}

function ensureColumn(table: string, column: string, ddl: string) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[]
  if (!columns.some((item) => item.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${ddl}`)
  }
}

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'planned',
      priority TEXT NOT NULL DEFAULT 'normal',
      agent TEXT NOT NULL DEFAULT 'Aider',
      branch TEXT,
      worktree TEXT,
      pr_number INTEGER,
      ci_status TEXT DEFAULT 'none',
      runtime INTEGER DEFAULT 0,
      started_at TEXT,
      completed_at TEXT,
      failed_tests TEXT,
      sub_status TEXT,
      token_count INTEGER DEFAULT 0,
      estimated_cost REAL DEFAULT 0,
      diff TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      job_id TEXT,
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      timestamp TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS terminal_lines (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL,
      type TEXT NOT NULL,
      content TEXT NOT NULL,
      timestamp TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS workers (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL,
      agent TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'running',
      runtime INTEGER DEFAULT 0,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS credentials (
      id TEXT PRIMARY KEY,
      agent TEXT NOT NULL,
      label TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS mcp_servers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      command TEXT NOT NULL,
      args TEXT DEFAULT '[]',
      env TEXT DEFAULT '{}',
      is_enabled INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS skills (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS plugins (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      command TEXT,
      args TEXT DEFAULT '[]',
      env TEXT DEFAULT '{}',
      is_enabled INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      path TEXT NOT NULL UNIQUE,
      git_remote TEXT DEFAULT '',
      is_active INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tool_statuses (
      tool_id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      binary TEXT NOT NULL,
      version TEXT,
      installed INTEGER NOT NULL DEFAULT 0,
      auth_status TEXT NOT NULL DEFAULT 'not-installed',
      available INTEGER NOT NULL DEFAULT 0,
      details TEXT,
      last_checked_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tool_secrets (
      tool_id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      secret_encrypted TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS driver_quota (
      driver_id TEXT PRIMARY KEY,
      error_count INTEGER DEFAULT 0,
      last_error_at TEXT,
      reset_at TEXT
    );

    CREATE TABLE IF NOT EXISTS task_outcomes (
      id TEXT PRIMARY KEY,
      driver_id TEXT NOT NULL,
      task_type TEXT NOT NULL,
      success INTEGER NOT NULL,
      timestamp TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS hooks (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      event TEXT NOT NULL,
      command TEXT NOT NULL,
      scope TEXT NOT NULL DEFAULT 'global',
      enabled INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `)

  ensureColumn('mcp_servers', 'transport', "transport TEXT DEFAULT 'stdio'")
  ensureColumn('mcp_servers', 'url', "url TEXT DEFAULT ''")
  ensureColumn('mcp_servers', 'enabled', 'enabled INTEGER DEFAULT 1')
  ensureColumn('mcp_servers', 'is_enabled', 'is_enabled INTEGER DEFAULT 1')

  ensureColumn('skills', 'description', "description TEXT DEFAULT ''")
  ensureColumn('skills', 'tags', "tags TEXT DEFAULT '[]'")
  ensureColumn('skills', 'enabled', 'enabled INTEGER DEFAULT 1')

  ensureColumn('plugins', 'source', "source TEXT DEFAULT ''")
  ensureColumn('plugins', 'version', "version TEXT DEFAULT ''")
  ensureColumn('plugins', 'enabled', 'enabled INTEGER DEFAULT 1')
  ensureColumn('plugins', 'is_enabled', 'is_enabled INTEGER DEFAULT 1')

  ensureColumn('credentials', 'secret_encrypted', "secret_encrypted TEXT DEFAULT ''")
  ensureColumn('jobs', 'skill_ids', "skill_ids TEXT DEFAULT '[]'")
  ensureColumn('jobs', 'changes', 'changes INTEGER DEFAULT 0')
  ensureColumn('jobs', 'execution_mode', "execution_mode TEXT DEFAULT 'auto'")
  ensureColumn('jobs', 'custom_agent_pool', "custom_agent_pool TEXT DEFAULT '[]'")
  ensureColumn('jobs', 'subtasks', "subtasks TEXT DEFAULT '[]'")
  ensureColumn('jobs', 'is_blocked', 'is_blocked INTEGER DEFAULT 0')
  ensureColumn('jobs', 'blocked_reason', "blocked_reason TEXT DEFAULT ''")
  ensureColumn('jobs', 'plan_approved', 'plan_approved INTEGER DEFAULT 0')
  ensureColumn('jobs', 'model', "model TEXT DEFAULT ''")
  ensureColumn('terminal_lines', 'subtask_id', "subtask_id TEXT DEFAULT ''")
  ensureColumn('terminal_lines', 'agent', "agent TEXT DEFAULT ''")
}

const JOB_COLUMNS = new Set([
  'title', 'description', 'status', 'priority', 'agent', 'model', 'branch', 'worktree',
  'pr_number', 'ci_status', 'runtime', 'started_at', 'completed_at', 'failed_tests',
  'sub_status', 'token_count', 'estimated_cost', 'diff', 'skill_ids', 'changes',
  'execution_mode', 'custom_agent_pool', 'subtasks', 'is_blocked', 'blocked_reason',
  'plan_approved',
])

function sanitizeFields(fields: Record<string, any>, allowed: Set<string>): Record<string, any> {
  const next: Record<string, any> = {}
  for (const [key, value] of Object.entries(fields)) {
    if (allowed.has(key)) next[key] = value
  }
  return next
}

// ─── Driver Quota & Task Outcome Tracking ────────────────────────────────
export function recordDriverQuotaError(driverId: string): void {
  const now = new Date().toISOString()
  const db = getDb()
  const existing = db.prepare('SELECT error_count FROM driver_quota WHERE driver_id = ?').get(driverId) as { error_count: number } | undefined
  if (existing) {
    db.prepare('UPDATE driver_quota SET error_count = error_count + 1, last_error_at = ? WHERE driver_id = ?').run(now, driverId)
  } else {
    db.prepare('INSERT INTO driver_quota (driver_id, error_count, last_error_at) VALUES (?, 1, ?)').run(driverId, now)
  }
}

export function getDriverQuotaErrors(driverId: string): number {
  const db = getDb()
  const row = db.prepare('SELECT error_count FROM driver_quota WHERE driver_id = ?').get(driverId) as { error_count: number } | undefined
  return row ? row.error_count : 0
}

export function recordTaskOutcome(driverId: string, taskType: string, success: boolean): void {
  const db = getDb()
  const id = Math.random().toString(36).substring(2, 9)
  db.prepare('INSERT INTO task_outcomes (id, driver_id, task_type, success, timestamp) VALUES (?, ?, ?, ?, ?)').run(
    id, driverId, taskType, success ? 1 : 0, new Date().toISOString()
  )
}

export function getDriverSuccessRate(driverId: string, taskType: string): number {
  const db = getDb()
  const row = db.prepare('SELECT COUNT(*) as total, SUM(success) as succeeded FROM task_outcomes WHERE driver_id = ? AND task_type = ?').get(driverId, taskType) as { total: number; succeeded: number } | undefined
  if (!row || row.total === 0) return 0.8 // default baseline score
  return row.succeeded / row.total
}

// ─── Job CRUD ──────────────────────────────────────────────────────────
export function createJob(job: {
  id: string
  title: string
  description: string
  agent: string
  priority: string
  model?: string
  execution_mode?: string
  custom_agent_pool?: string
}): void {
  getDb()
    .prepare(`INSERT INTO jobs (id, title, description, agent, priority, model, status, execution_mode, custom_agent_pool) VALUES (?, ?, ?, ?, ?, ?, 'planned', ?, ?)`)
    .run(job.id, job.title, job.description, job.agent, job.priority, job.model || '', job.execution_mode || 'auto', job.custom_agent_pool || '[]')
}

export function getJobs(): any[] {
  return getDb().prepare(`SELECT * FROM jobs ORDER BY created_at DESC`).all()
}

export function getJob(id: string): any {
  return getDb().prepare(`SELECT * FROM jobs WHERE id = ?`).get(id)
}

export function updateJob(id: string, fields: Record<string, any>): void {
  const safe = sanitizeFields(fields, JOB_COLUMNS)
  const keys = Object.keys(safe)
  if (keys.length === 0) return
  const setClause = keys.map((k) => `${k} = ?`).join(', ')
  const values = Object.values(safe)
  getDb()
    .prepare(`UPDATE jobs SET ${setClause} WHERE id = ?`)
    .run(...values, id)
}

export function nextReviewNumber(): number {
  const row = getDb().prepare(`SELECT MAX(pr_number) as m FROM jobs`).get() as { m: number | null }
  return (row?.m || 0) + 1
}

export function deleteJob(id: string): void {
  getDb().prepare(`DELETE FROM jobs WHERE id = ?`).run(id)
}

// ─── Activities ──────────────────────────────────────────────────────
export function addActivity(activity: {
  id: string
  jobId?: string
  type: string
  message: string
}): void {
  getDb()
    .prepare(`INSERT INTO activities (id, job_id, type, message) VALUES (?, ?, ?, ?)`)
    .run(activity.id, activity.jobId || null, activity.type, activity.message)
}

export function getActivities(limit = 50): any[] {
  return getDb().prepare(`SELECT * FROM activities ORDER BY timestamp DESC LIMIT ?`).all(limit)
}

// ─── Terminal Lines ───────────────────────────────────────────────────
export function addTerminalLine(line: {
  id: string
  jobId: string
  type: string
  content: string
  subtaskId?: string
  agent?: string
}): void {
  getDb()
    .prepare(`INSERT INTO terminal_lines (id, job_id, type, content, subtask_id, agent) VALUES (?, ?, ?, ?, ?, ?)`)
    .run(line.id, line.jobId, line.type, line.content, line.subtaskId || '', line.agent || '')
}

export function getTerminalLines(jobId: string): any[] {
  return getDb().prepare(`SELECT * FROM terminal_lines WHERE job_id = ? ORDER BY timestamp ASC`).all(jobId)
}

// ─── Workers ──────────────────────────────────────────────────────────
export function upsertWorker(worker: { id: string; jobId: string; agent: string; status: string; runtime: number }): void {
  getDb()
    .prepare(`INSERT OR REPLACE INTO workers (id, job_id, agent, status, runtime) VALUES (?, ?, ?, ?, ?)`)
    .run(worker.id, worker.jobId, worker.agent, worker.status, worker.runtime)
}

export function removeWorker(jobId: string): void {
  getDb().prepare(`DELETE FROM workers WHERE job_id = ?`).run(jobId)
}

export function getWorkers(): any[] {
  return getDb().prepare(`SELECT w.*, j.title as task_title FROM workers w JOIN jobs j ON j.id = w.job_id`).all()
}

// ─── MCP Servers ──────────────────────────────────────────────────────
export function getMcpServers(): any[] {
  return getDb().prepare(`SELECT * FROM mcp_servers ORDER BY name`).all()
}

export function addMcpServer(server: { id: string; name: string; transport?: string; command?: string; url?: string; args?: string; env?: string; enabled?: boolean }): void {
  getDb()
    .prepare(`INSERT INTO mcp_servers (id, name, transport, command, url, args, env, enabled, is_enabled) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(
      server.id,
      server.name,
      server.transport || 'stdio',
      server.command || '',
      server.url || '',
      server.args || '[]',
      server.env || '{}',
      server.enabled === false ? 0 : 1,
      server.enabled === false ? 0 : 1,
    )
}

export function updateMcpServer(id: string, fields: Record<string, any>): void {
  const keys = Object.keys(fields)
  if (keys.length === 0) return
  const setClause = keys.map((k) => `${k} = ?`).join(', ')
  const values = Object.values(fields)
  getDb().prepare(`UPDATE mcp_servers SET ${setClause} WHERE id = ?`).run(...values, id)
}

export function deleteMcpServer(id: string): void {
  getDb().prepare(`DELETE FROM mcp_servers WHERE id = ?`).run(id)
}

// ─── Credentials ──────────────────────────────────────────────────────
export function getCredentials(): any[] {
  return getDb().prepare(`SELECT id, agent, label, is_active, created_at FROM credentials`).all()
}

export function addCredential(cred: { id: string; agent: string; label: string; secretEncrypted?: string }): void {
  getDb()
    .prepare(`INSERT INTO credentials (id, agent, label, secret_encrypted) VALUES (?, ?, ?, ?)`)
    .run(cred.id, cred.agent, cred.label, cred.secretEncrypted || '')
}

export function getCredentialSecrets(): { id: string; agent: string; label: string; secret_encrypted: string }[] {
  return getDb()
    .prepare(`SELECT id, agent, label, secret_encrypted FROM credentials WHERE secret_encrypted IS NOT NULL AND secret_encrypted != ''`)
    .all() as { id: string; agent: string; label: string; secret_encrypted: string }[]
}

export function deleteCredential(id: string): void {
  getDb().prepare(`DELETE FROM credentials WHERE id = ?`).run(id)
}

// ─── Skills ───────────────────────────────────────────────────────────
export function getSkills(): any[] {
  return getDb().prepare(`SELECT * FROM skills ORDER BY created_at DESC`).all()
}

export function addSkill(skill: { id: string; name: string; description?: string; content: string; tags?: string; enabled?: boolean }): void {
  getDb()
    .prepare(`INSERT INTO skills (id, name, description, content, tags, enabled) VALUES (?, ?, ?, ?, ?, ?)`)
    .run(skill.id, skill.name, skill.description || '', skill.content, skill.tags || '[]', skill.enabled === false ? 0 : 1)
}

export function updateSkill(id: string, fields: Record<string, any>): void {
  const keys = Object.keys(fields)
  if (keys.length === 0) return
  const setClause = keys.map((k) => `${k} = ?`).join(', ')
  const values = Object.values(fields)
  getDb().prepare(`UPDATE skills SET ${setClause} WHERE id = ?`).run(...values, id)
}

export function deleteSkill(id: string): void {
  getDb().prepare(`DELETE FROM skills WHERE id = ?`).run(id)
}

// ─── Plugins ───────────────────────────────────────────────────────────
export function getPlugins(): any[] {
  return getDb().prepare(`SELECT * FROM plugins ORDER BY created_at DESC`).all()
}

export function addPlugin(plugin: { id: string; name: string; source?: string; version?: string; type?: string; command?: string; args?: string; env?: string; enabled?: boolean }): void {
  getDb()
    .prepare(`INSERT INTO plugins (id, name, source, version, type, command, args, env, enabled, is_enabled) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(
      plugin.id,
      plugin.name,
      plugin.source || '',
      plugin.version || '',
      plugin.type || '',
      plugin.command || null,
      plugin.args || '[]',
      plugin.env || '{}',
      plugin.enabled === false ? 0 : 1,
      plugin.enabled === false ? 0 : 1,
    )
}

export function updatePlugin(id: string, fields: Record<string, any>): void {
  const keys = Object.keys(fields)
  if (keys.length === 0) return
  const setClause = keys.map((k) => `${k} = ?`).join(', ')
  const values = Object.values(fields)
  getDb().prepare(`UPDATE plugins SET ${setClause} WHERE id = ?`).run(...values, id)
}

export function deletePlugin(id: string): void {
  getDb().prepare(`DELETE FROM plugins WHERE id = ?`).run(id)
}

export function togglePlugin(id: string, enabled: boolean): void {
  getDb().prepare(`UPDATE plugins SET is_enabled = ?, enabled = ? WHERE id = ?`).run(enabled ? 1 : 0, enabled ? 1 : 0, id)
}

// ─── Projects ───────────────────────────────────────────────────────────
export function getProjects(): any[] {
  return getDb().prepare(`SELECT * FROM projects ORDER BY is_active DESC, created_at DESC`).all()
}

export function getProject(id: string): any {
  return getDb().prepare(`SELECT * FROM projects WHERE id = ?`).get(id)
}

export function addProject(project: { id: string; name: string; path: string; gitRemote?: string }): void {
  const db = getDb()
  const count = (db.prepare(`SELECT COUNT(*) as count FROM projects`).get() as { count: number }).count
  db.prepare(`INSERT INTO projects (id, name, path, git_remote, is_active) VALUES (?, ?, ?, ?, ?)`)
    .run(project.id, project.name, project.path, project.gitRemote || '', count === 0 ? 1 : 0)
}

export function deleteProject(id: string): void {
  getDb().prepare(`DELETE FROM projects WHERE id = ?`).run(id)
}

export function setActiveProject(id: string): void {
  getDb().prepare(`UPDATE projects SET is_active = 0`).run()
  getDb().prepare(`UPDATE projects SET is_active = 1 WHERE id = ?`).run(id)
}

export function updateProjectGitRemote(id: string, remote: string): void {
  getDb().prepare(`UPDATE projects SET git_remote = ? WHERE id = ?`).run(remote, id)
}

// ─── Tool Setup ───────────────────────────────────────────────────────────
export interface ToolStatusRow {
  tool_id: string
  name: string
  binary: string
  version: string | null
  installed: number
  auth_status: string
  available: number
  details: string | null
  last_checked_at: string
}

export function getToolStatuses(): ToolStatusRow[] {
  return getDb().prepare(`SELECT * FROM tool_statuses ORDER BY tool_id`).all() as ToolStatusRow[]
}

export function upsertToolStatus(status: {
  toolId: string
  name: string
  binary: string
  version: string | null
  installed: boolean
  authStatus: string
  available: boolean
  details?: string | null
}): void {
  getDb().prepare(
    `INSERT OR REPLACE INTO tool_statuses (tool_id, name, binary, version, installed, auth_status, available, details, last_checked_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
  ).run(
    status.toolId,
    status.name,
    status.binary,
    status.version,
    status.installed ? 1 : 0,
    status.authStatus,
    status.available ? 1 : 0,
    status.details || null,
  )
}

export function getToolSecret(toolId: string): { tool_id: string; label: string; secret_encrypted: string } | undefined {
  return getDb().prepare(`SELECT tool_id, label, secret_encrypted FROM tool_secrets WHERE tool_id = ?`).get(toolId) as any
}

export function upsertToolSecret(toolId: string, label: string, secretEncrypted: string): void {
  getDb().prepare(
    `INSERT OR REPLACE INTO tool_secrets (tool_id, label, secret_encrypted, created_at) VALUES (?, ?, ?, datetime('now'))`
  ).run(toolId, label, secretEncrypted)
}

// ─── Settings ───────────────────────────────────────────────────────────
export function getSettings(): Record<string, string> {
  const rows = getDb().prepare(`SELECT key, value FROM settings`).all() as { key: string; value: string }[]
  const result: Record<string, string> = {}
  for (const row of rows) {
    result[row.key] = row.value
  }
  return result
}

export function setSetting(key: string, value: string): void {
  getDb()
    .prepare(`INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`)
    .run(key, value)
}

/** Remove demo jobs created by older versions of the app. */
export function purgeDemoData(): void {
  getDb().prepare(`DELETE FROM jobs WHERE id LIKE 'AUTH-%'`).run()
}

// ─── Seed Default Data ────────────────────────────────────────────────
export function seedDefaultData(): void {
  // Seed default MCP servers
  const insertMcp = getDb().prepare(`INSERT OR IGNORE INTO mcp_servers (id, name, transport, command, url, args, env, enabled, is_enabled) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
  insertMcp.run('mcp-github', 'GitHub MCP', 'stdio', 'npx', '', JSON.stringify(['-y', '@modelcontextprotocol/server-github']), '{}', 1, 1)
  insertMcp.run('mcp-fs', 'Filesystem MCP', 'stdio', 'npx', '', JSON.stringify(['-y', '@modelcontextprotocol/server-filesystem', '.']), '{}', 1, 1)
  insertMcp.run('mcp-sequential', 'Sequential Thinking MCP', 'stdio', 'npx', '', JSON.stringify(['-y', '@modelcontextprotocol/server-sequential-thinking']), '{}', 1, 1)

  // Seed open-source skills
  const insertSkill = getDb().prepare(`INSERT OR IGNORE INTO skills (id, name, description, content, tags, enabled) VALUES (?, ?, ?, ?, ?, ?)`)
  insertSkill.run('skill-react', 'React Hook Patterns', 'Reusable React hook patterns and guardrails',
    `## React Hooks Best Practices\n\n- Use useCallback for functions passed as props\n- Use useMemo for expensive calculations\n- Use useLayoutEffect for DOM mutations\n- Destructure hooks at the top of the component\n\n## Common Patterns\n\`\`\`tsx\nconst [state, setState] = useState(initial);\nconst debounced = useMemo(() => debounce(value, 300), [value]);\n\`\`\``,
    '["react","hooks"]', 1)

  insertSkill.run('skill-node', 'Node.js Security', 'Security checklist for Node.js services',
    `## Security Best Practices\n\n- Never trust user input - validate with Zod\n- Use parameterized queries (better-sqlite3)\n- Sanitize output to prevent XSS\n- Use Helmet.js for Express apps\n- Rate-limit API endpoints\n- Implement proper error boundaries`,
    '["security","node"]', 1)

  insertSkill.run('skill-git', 'Git Worktree Strategy', 'Git workflow guidance for isolated worktrees',
    `## Git Worktree Workflow\n\n- Always create a branch per task: git worktree add -b agent/<jobId>\n- Keep main branch clean - merge with --no-ff\n- Clean up worktrees: git worktree remove --force path\n- Delete merged branches: git branch -d agent/<jobId>\n\n## Best Practices\n- Never commit directly to main\n- Run tests before merging\n- Capture diff before merge: git diff HEAD~1`,
    '["git","workflow"]', 1)

  insertSkill.run('skill-md', 'Markdown PR Summaries', 'Template for concise pull request summaries',
    `## Pull Request Summary Template\n\n- What changed\n- Why it changed\n- How to verify\n- Known risks\n- Follow-up items`,
    '["docs","writing"]', 1)

  insertSkill.run('skill-electron', 'Electron Security', 'Electron security guidelines for renderer/main boundaries',
    `## Electron Security Guidelines\n\n- Enable contextIsolation (contextIsolation: true)\n- Disable nodeIntegration in renderer (nodeIntegration: false)\n- Use contextBridge for safe IPC\n- Validate all IPC input with Zod\n- Never expose remote module\n- Use safeStorage for secrets\n- Avoid eval() and new Function()\n- Sanitize URLs before loading`,
    '["electron","security"]', 1)

  // Seed default plugins (disabled until the user opts in)
  const insertPlugin = getDb().prepare(`INSERT OR IGNORE INTO plugins (id, name, type, command, args, env, enabled, is_enabled) VALUES (?, ?, ?, ?, ?, ?, 0, 0)`)
  insertPlugin.run('plugin-ruff', 'Ruff Linter', 'linter', 'uv', JSON.stringify(['run', 'ruff', 'check']), '{}')
  insertPlugin.run('plugin-eslint', 'ESLint', 'linter', 'npx', JSON.stringify(['eslint', '.']), '{}')
  insertPlugin.run('plugin-tsc', 'TypeScript Check', 'checker', 'npx', JSON.stringify(['tsc', '--noEmit']), '{}')
  insertPlugin.run('plugin-prettier', 'Prettier Formatter', 'formatter', 'npx', JSON.stringify(['prettier', '--write', '.']), '{}')
  insertPlugin.run('plugin-tests', 'Test Runner', 'tester', 'npm', JSON.stringify(['test']), '{}')
  insertPlugin.run('plugin-vitest', 'Vitest UI', 'tester', 'npx', JSON.stringify(['vitest', 'run']), '{}')
  insertPlugin.run('plugin-semgrep', 'Semgrep SAST', 'analyzer', 'semgrep', JSON.stringify(['--config=auto', '--json']), '{}')
  insertPlugin.run('plugin-codespell', 'Codespell Spellcheck', 'analyzer', 'codespell', JSON.stringify(['--skip=.git,node_modules,dist']), '{}')
  insertPlugin.run('plugin-oxc', 'Oxc Linter', 'linter', 'npx', JSON.stringify(['oxlint']), '{}')

  // One-time migration: older builds seeded every plugin as enabled, which
  // made every task fail CI on machines without those tools installed.
  const migrated = getDb().prepare(`SELECT value FROM settings WHERE key = ?`).get('pluginsDefaultDisabled') as { value?: string } | undefined
  if (migrated?.value !== 'true') {
    getDb().prepare(`UPDATE plugins SET enabled = 0, is_enabled = 0 WHERE id LIKE 'plugin-%'`).run()
    getDb().prepare(`INSERT OR REPLACE INTO settings (key, value) VALUES ('pluginsDefaultDisabled', 'true')`).run()
  }
}

// ─── Hooks ────────────────────────────────────────────────────────────
export function getHooks(): any[] {
  return getDb().prepare(`SELECT * FROM hooks ORDER BY created_at ASC`).all()
}

export function addHook(hook: { id: string; name: string; event: string; command: string; scope: string; enabled: number }): any[] {
  getDb()
    .prepare(`INSERT INTO hooks (id, name, event, command, scope, enabled) VALUES (?, ?, ?, ?, ?, ?)`)
    .run(hook.id, hook.name, hook.event, hook.command, hook.scope || 'global', hook.enabled ?? 0)
  return getHooks()
}

export function updateHook(id: string, fields: Record<string, any>): any[] {
  const allowed = new Set(['name', 'event', 'command', 'scope', 'enabled'])
  const clean = sanitizeFields(fields, allowed)
  if (Object.keys(clean).length > 0) {
    const setClause = Object.keys(clean).map((k) => `${k} = ?`).join(', ')
    const values = [...Object.values(clean), id]
    getDb().prepare(`UPDATE hooks SET ${setClause} WHERE id = ?`).run(...values)
  }
  return getHooks()
}

export function deleteHook(id: string): any[] {
  getDb().prepare(`DELETE FROM hooks WHERE id = ?`).run(id)
  return getHooks()
}

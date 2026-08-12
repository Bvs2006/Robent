// ─── Robent Type Definitions ──────────────────────────────────────────────────

export type TaskStatus = 'planned' | 'assigned' | 'working' | 'review' | 'done'
export type CIStatus = 'passing' | 'failed' | 'pending' | 'none'
export type AgentName = 'Claude Code' | 'Cursor' | 'Codex' | 'OpenCode' | 'Antigravity' | 'Aider' | 'GitHub Copilot'
export type Priority = 'low' | 'normal' | 'high' | 'critical'
export type ToolId = 'claude-code' | 'codex' | 'antigravity' | 'aider' | 'opencode'
export type ToolStatus = 'not-installed' | 'installed-not-signed-in' | 'ready'

export interface ToolStatusRecord {
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

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  agent: AgentName
  priority: Priority
  branch?: string
  worktree?: string
  prNumber?: number
  ciStatus?: CIStatus
  runtime?: number
  startedAt?: string
  completedAt?: string
  failedTests?: string[]
  subStatus?: string
  tokenCount?: number
  estimatedCost?: number
  diff?: string
}

export interface Worker {
  id: string
  taskId: string
  taskTitle: string
  agent: AgentName
  status: 'running' | 'fixing' | 'waiting' | 'stopped'
  runtime?: number
}

export interface ActivityItem {
  id: string
  timestamp: string
  type: string
  message: string
  taskId?: string
}

export interface PullRequest {
  id: string
  number: number
  title: string
  branch: string
  status: 'open' | 'merged'
  ciStatus: CIStatus
  reviewCount: number
  ciFailureDetails?: {
    taskTitle: string
    failedTestsCount: number
    failedFiles: string[]
  }
}

export interface Worktree {
  id: string
  workerId: string
  branch: string
  path: string
  status: 'active' | 'clean' | 'removed'
  changes: number
}

export interface McpServer {
  id: string
  name: string
  command: string
  args: string
  env: string
  isEnabled: boolean
}

export interface Credential {
  id: string
  agent: string
  label: string
  isActive: boolean
  createdAt: string
}

export interface Skill {
  id: string
  name: string
  content: string
  createdAt: string
}

export interface Project {
  id: string
  name: string
  path: string
  gitRemote: string
  isActive: boolean
  createdAt: string
}

export interface Plugin {
  id: string
  name: string
  type: 'linter' | 'formatter' | 'checker' | 'tester' | 'analyzer'
  command?: string
  args?: string
  env?: string
  isEnabled: boolean
  createdAt: string
}

export interface Settings {
  projectDirectory: string
  defaultAgent: string
  theme: 'dark' | 'light'
  agentCommand: string
  defaultTimeout: number
  approvalMode: boolean
  toolSetupCompleted?: boolean
}

export interface Notification {
  id: string
  type: 'success' | 'info' | 'warning' | 'error'
  message: string
  timestamp: number
}

export type PageId = 'dashboard' | 'sessions' | 'settings' | 'worktrees' | 'pullRequests' | 'projects'

export interface RaceEntry {
  agent: AgentName
  status: 'running' | 'done' | 'failed'
  output: string
  summary?: string
  tokenCount?: number
  cost?: number
}

// ─── Agent config ─────────────────────────────────────────────────────────────
export const AGENT_CONFIGS: Record<AgentName, { color: string; dot: string; bg: string; border: string; label: string }> = {
  'Claude Code':    { color: 'text-purple-400',  dot: '🟣', bg: 'bg-purple-950/40',  border: 'border-purple-800/50',  label: 'Claude Code' },
  'Cursor':         { color: 'text-emerald-400', dot: '🟢', bg: 'bg-emerald-950/40', border: 'border-emerald-800/50', label: 'Cursor' },
  'Codex':          { color: 'text-blue-400',    dot: '🔵', bg: 'bg-blue-950/40',    border: 'border-blue-800/50',    label: 'Codex' },
  'OpenCode':       { color: 'text-zinc-300',    dot: '⚫', bg: 'bg-zinc-800/40',    border: 'border-zinc-700/50',    label: 'OpenCode' },
  'Antigravity':    { color: 'text-amber-400',   dot: '🟠', bg: 'bg-amber-950/40',   border: 'border-amber-800/50',   label: 'Antigravity' },
  'Aider':          { color: 'text-sky-400',     dot: '🩵', bg: 'bg-sky-950/40',     border: 'border-sky-800/50',     label: 'Aider' },
  'GitHub Copilot': { color: 'text-slate-300',   dot: '🤖', bg: 'bg-slate-900/40',   border: 'border-slate-700/50',   label: 'Copilot' },
}

export const ALL_AGENTS: AgentName[] = ['Claude Code', 'Cursor', 'Codex', 'OpenCode', 'Antigravity', 'Aider', 'GitHub Copilot']

// ─── Electron API ─────────────────────────────────────────────────────────────
declare global {
  interface Window {
    electronAPI?: {
      getJobs: () => Promise<any[]>
      getJob: (id: string) => Promise<any>
      createJob: (job: any) => Promise<any>
      updateJob: (id: string, fields: any) => Promise<any>
      getActivities: () => Promise<any[]>
      getWorkers: () => Promise<any[]>
      getTerminalLines: (jobId: string) => Promise<any[]>
      getToolStatuses: () => Promise<ToolStatusRecord[]>
      refreshToolStatuses: () => Promise<ToolStatusRecord[]>
      getToolSetupCompleted: () => Promise<{ completed: boolean }>
      setToolSetupCompleted: (completed: boolean) => Promise<{ completed: boolean }>
      saveToolSecret: (payload: { toolId: ToolId; label: string; secret: string }) => Promise<any>
      runToolAction: (payload: { toolId: ToolId; kind: 'install' | 'auth'; secret?: string }) => Promise<any>
      openExternal: (url: string) => Promise<any>
      runTask: (taskId: string, agent: string, workdir: string) => Promise<any>
      cancelTask: (taskId: string) => Promise<any>
      killAll: () => Promise<any>
      runRace: (taskId: string, agents: string[], workdir: string) => Promise<any>
      mergeTask: (taskId: string) => Promise<any>
      discardTask: (taskId: string) => Promise<any>
      getMcpServers: () => Promise<any[]>
      getCapabilityRegistry: () => Promise<any>
      testMcpServerConnection: (server: any) => Promise<{ ok: boolean; message: string }>
      addMcpServer: (server: any) => Promise<any[]>
      updateMcpServer: (id: string, fields: any) => Promise<any[]>
      deleteMcpServer: (id: string) => Promise<any[]>
      getCredentials: () => Promise<any[]>
      addCredential: (cred: any) => Promise<any[]>
      deleteCredential: (id: string) => Promise<any[]>
      getSkills: () => Promise<any[]>
      addSkill: (skill: any) => Promise<any[]>
      updateSkill: (id: string, fields: any) => Promise<any[]>
      deleteSkill: (id: string) => Promise<any[]>
      getPlugins: () => Promise<any[]>
      addPlugin: (plugin: any) => Promise<any[]>
      updatePlugin: (id: string, fields: any) => Promise<any[]>
      deletePlugin: (id: string) => Promise<any[]>
      togglePlugin: (id: string, enabled: boolean) => Promise<any[]>
      getProjects: () => Promise<any[]>
      getProject: (id: string) => Promise<any>
      addProject: (project: any) => Promise<any>
      deleteProject: (id: string) => Promise<any[]>
      setActiveProject: (id: string) => Promise<any[]>
      getSettings: () => Promise<any>
      setSetting: (key: string, value: string) => Promise<any>
      showOpenDialog: () => Promise<any>
      startPreviewServer: (taskId: string) => Promise<any>
      stopPreviewServer: (taskId: string) => Promise<any>
      onTaskOutput: (cb: (taskId: string, chunk: string) => void) => void
      onTaskDone: (cb: (taskId: string, result: any) => void) => void
      onStateChanged: (cb: () => void) => void
      onRuntimeTick: (cb: (runtimes: Record<string, number>) => void) => void
      onRaceOutput: (cb: (taskId: string, agent: string, chunk: string) => void) => void
      onRaceResult: (cb: (taskId: string, agent: string, result: any) => void) => void
      onPreviewReady: (cb: (taskId: string, port: number, output: string) => void) => void
      onToolOutput: (cb: (toolId: ToolId, sessionId: string, chunk: string) => void) => void
      onToolActionStarted: (cb: (toolId: ToolId, sessionId: string, kind: 'install' | 'auth') => void) => void
      onToolActionEnded: (cb: (toolId: ToolId, sessionId: string, exitCode: number, output: string) => void) => void
      onToolStatusesChanged: (cb: (statuses: ToolStatusRecord[]) => void) => void
      removeAllListeners: (channel: string) => void
    }
  }
}

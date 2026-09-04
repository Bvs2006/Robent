/**
 * src/store/fleetStore.ts — Zustand store
 * 
 * All state comes from the Electron main process via IPC.
 * No mock fallbacks — this runs only in Electron context.
 */
import { create } from 'zustand'
import type { Task, Worker, ActivityItem, Notification, PageId, McpServer, Credential, Skill, AgentName, Settings, Plugin, Project, ToolStatusRecord, ExecutionMode, Hook } from '../types'

// ─── Helpers ─────────────────────────────────────────────────────────────────
const ipc = window.electronAPI
let commandApprovalListenerBound = false

function dbRowToTask(row: any): Task {
  let failedTests: string[] | undefined
  if (row.failed_tests) {
    try {
      const parsed = JSON.parse(row.failed_tests)
      failedTests = Array.isArray(parsed) ? parsed.map(String) : [String(row.failed_tests)]
    } catch {
      failedTests = [String(row.failed_tests)]
    }
  }

  let customAgentPool: AgentName[] | undefined
  if (row.custom_agent_pool) {
    try {
      const parsed = JSON.parse(row.custom_agent_pool)
      if (Array.isArray(parsed)) customAgentPool = parsed
    } catch {
      /* pass */
    }
  }

  let subtasks: any[] | undefined
  if (row.subtasks) {
    try {
      const parsed = JSON.parse(row.subtasks)
      if (Array.isArray(parsed)) subtasks = parsed
    } catch {
      /* pass */
    }
  }

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    agent: row.agent,
    model: row.model || undefined,
    branch: row.branch || undefined,
    worktree: row.worktree || undefined,
    prNumber: row.pr_number || undefined,
    ciStatus: row.ci_status || 'none',
    runtime: row.runtime || 0,
    startedAt: row.started_at || undefined,
    completedAt: row.completed_at || undefined,
    tokenCount: row.token_count || 0,
    estimatedCost: row.estimated_cost || 0,
    diff: row.diff || undefined,
    changes: row.changes || 0,
    failedTests,
    subStatus: row.sub_status || undefined,
    executionMode: (row.execution_mode as any) || 'auto',
    customAgentPool,
    subtasks,
    isBlocked: row.is_blocked === 1,
    blockedReason: row.blocked_reason || undefined,
    planApproved: row.plan_approved === 1,
  }
}

function dbRowToWorker(row: any): Worker {
  return {
    id: row.id,
    taskId: row.job_id,
    taskTitle: row.task_title || '',
    agent: row.agent,
    status: row.status,
    runtime: row.runtime || 0,
  }
}

function dbRowToProject(row: any): Project {
  return {
    id: row.id,
    name: row.name,
    path: row.path,
    gitRemote: row.git_remote || '',
    isActive: row.is_active === 1,
    createdAt: row.created_at,
  }
}

function taskToPullRequest(task: Task) {
  if (!task.prNumber) return null
  return {
    id: `pr-${task.id}`,
    number: task.prNumber,
    title: task.title,
    branch: task.branch || `agent/${task.id.toLowerCase()}`,
    status: task.status === 'done' ? 'merged' : 'open' as const,
    ciStatus: task.ciStatus || 'none',
    reviewCount: 0,
    ciFailureDetails: task.failedTests ? {
      taskTitle: task.title,
      failedTestsCount: task.failedTests.length,
      failedFiles: task.failedTests,
    } : undefined,
  }
}

function taskToWorktree(task: Task) {
  if (!task.worktree || !task.branch) return null
  return {
    id: `wt-${task.id}`,
    workerId: task.id,
    branch: task.branch,
    path: task.worktree,
    status: task.status === 'done' ? 'clean' : 'active' as const,
    changes: task.changes || 0,
  }
}

// ─── State Interface ──────────────────────────────────────────────────────────
interface FleetState {
  // Nav
  currentPage: PageId
  setCurrentPage: (p: PageId) => void

  // Tasks
  tasks: Task[]
  selectedTaskId: string | null
  selectTask: (id: string | null) => void
  loadTasks: () => Promise<void>
  createTask: (title: string, desc: string, agent: AgentName, priority: Task['priority'], model?: string) => Promise<Task>
  deleteTask: (taskId: string) => Promise<void>
  clearPlannedTasks: () => Promise<void>
  startTask: (taskId: string, workdir?: string) => Promise<void>
  stopTask: (taskId: string) => Promise<void>
  mergeTask: (taskId: string) => Promise<void>
  discardTask: (taskId: string) => Promise<void>
  planTasks: (description: string) => Promise<Task[]>
  addPlannedTasks: (tasks: Task[]) => Promise<void>
  startAllTasks: (taskIds: string[]) => Promise<void>
  sendAgentFeedback: (taskId: string, customFeedback?: string) => Promise<void>
  createWorktree: (branchName: string, baseBranch?: string) => Promise<void>
  setTaskExecutionMode: (taskId: string, mode: ExecutionMode) => Promise<void>
  setTaskCustomPool: (taskId: string, pool: AgentName[]) => Promise<void>

   // Preview server
  startPreviewServer: (taskId: string) => Promise<{ port: number; starting?: boolean } | { error: string }>
  stopPreviewServer: (taskId: string) => Promise<void>
  previewPorts: Record<string, number>

  // Plugins
  plugins: Plugin[]
  loadPlugins: () => Promise<void>
  addPlugin: (p: { name: string; type: string; command?: string; args?: string; env?: string }) => Promise<void>
  deletePlugin: (id: string) => Promise<void>
  togglePlugin: (id: string, enabled: boolean) => Promise<void>

  // Workers
  workers: Worker[]
  loadWorkers: () => Promise<void>
  showWorkerPanel: boolean
  setShowWorkerPanel: (v: boolean) => void

  // Activities
  activities: ActivityItem[]
  loadActivities: () => Promise<void>

  // Terminal
  terminalTaskId: string | null
  openTerminal: (taskId: string) => void
  closeTerminal: () => void

  // Diff viewer
  diffTaskId: string | null
  openDiff: (taskId: string) => void
  closeDiff: () => void

  // Derived: Pull Requests
  pullRequests: ReturnType<typeof taskToPullRequest>[]

  // Derived: Worktrees
  worktrees: ReturnType<typeof taskToWorktree>[]

  // MCP
  mcpServers: McpServer[]
  loadMcpServers: () => Promise<void>
  addMcpServer: (s: { name: string; command: string; args: string; env: string }) => Promise<void>
  updateMcpServer: (id: string, fields: Partial<McpServer>) => Promise<void>
  deleteMcpServer: (id: string) => Promise<void>

  // Credentials
  credentials: Credential[]
  loadCredentials: () => Promise<void>
  addCredential: (c: { agent: string; label: string; secret: string }) => Promise<void>
  deleteCredential: (id: string) => Promise<void>

  // Hooks
  hooks: Hook[]
  loadHooks: () => Promise<void>
  addHook: (hook: Omit<Hook, 'id'>) => Promise<void>
  updateHook: (id: string, fields: Partial<Hook>) => Promise<void>
  deleteHook: (id: string) => Promise<void>
  toggleHook: (id: string, enabled: boolean) => Promise<void>
  testHookCommand: (command: string) => Promise<{ ok: boolean; exitCode: number; output: string }>

  // Plan & Command Approval
  approvePlan: (taskId: string) => Promise<void>
  updateSubtaskAgent: (taskId: string, subtaskId: string, agent: AgentName) => Promise<void>
  respondCommandApproval: (taskId: string, promptId: string, approve: boolean) => Promise<void>
  pendingCommandApprovals: Record<string, { promptId: string; command: string }>

  // Skills
  skills: Skill[]
  loadSkills: () => Promise<void>
  addSkill: (s: { name: string; content: string }) => Promise<void>
  updateSkill: (id: string, fields: Partial<Skill>) => Promise<void>
  deleteSkill: (id: string) => Promise<void>

   // Settings
  settings: Settings
  loadSettings: () => Promise<void>
  updateSettings: (partial: Partial<Settings>) => Promise<void>
  projectDirectory: string
  setProjectDirectory: (d: string) => void
  approvalMode: boolean
  setApprovalMode: (v: boolean) => void

  // Tool setup
  toolStatuses: ToolStatusRecord[]
  loadToolStatuses: () => Promise<void>
  refreshToolStatuses: () => Promise<void>
  toolSetupCompleted: boolean
  loadToolSetupState: () => Promise<void>
  setToolSetupCompleted: (completed: boolean) => Promise<void>

  // Projects
  projects: Project[]
  currentProject: Project | null
  loadProjects: () => Promise<void>
  addProject: (p: {
    name: string
    path: string
    gitRemote?: string
    createIfMissing?: boolean
    gitInit?: boolean
    setActive?: boolean
  }) => Promise<boolean>
  deleteProject: (id: string) => Promise<void>
  setActiveProject: (id: string) => Promise<void>

  // Notifications
  notifications: Notification[]
  addNotification: (type: Notification['type'], message: string) => void
  removeNotification: (id: string) => void

  // Modals
  showNewTaskModal: boolean
  setShowNewTaskModal: (v: boolean) => void
  showCommandPalette: boolean
  setShowCommandPalette: (v: boolean) => void
  showProjectSetupModal: boolean
  setShowProjectSetupModal: (v: boolean, pendingTaskIds?: string[] | null) => void
  pendingStartAfterProject: string[] | null
  showOrchestrator: boolean
  setShowOrchestrator: (v: boolean) => void
  showToolSetupModal: boolean
  setShowToolSetupModal: (v: boolean) => void
  showShortcutsModal: boolean
  setShowShortcutsModal: (v: boolean) => void

  // Bulk
  loadAll: () => Promise<void>
  refreshAll: () => Promise<void>
  killAll: () => Promise<void>
}

function newTaskId(prefix = 'TASK'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`.toUpperCase()
}

// ─── Store ────────────────────────────────────────────────────────────────────
export const useFleetStore = create<FleetState>((set, get) => ({
  // Nav
  currentPage: 'dashboard',
  setCurrentPage: (p) => set({
    currentPage: p,
    terminalTaskId: null,
    diffTaskId: null,
  }),

  // Tasks
  tasks: [],
  selectedTaskId: null,
  selectTask: (id) => set({ selectedTaskId: id }),

  loadTasks: async () => {
    if (!ipc) return
    const rows = await ipc.getJobs()
    const tasks = rows.map(dbRowToTask)
    set({
      tasks,
      pullRequests: tasks.map(taskToPullRequest).filter(Boolean) as any,
      worktrees: tasks.map(taskToWorktree).filter(Boolean) as any,
    })
  },

  createTask: async (title, desc, agent, priority, model) => {
    if (!ipc) throw new Error('IPC not available')
    const id = newTaskId()
    const row = await ipc.createJob({ id, title, description: desc, agent, priority, model: model || undefined })
    const t = dbRowToTask(row)
    set((s) => ({ tasks: [t, ...s.tasks] }))
    get().addNotification('success', `Task created: ${title}`)
    return t
  },

  deleteTask: async (taskId) => {
    if (!ipc) return
    const result = await ipc.deleteJob(taskId)
    if (result?.success === false) {
      get().addNotification('error', result.error || 'Failed to delete task')
      return
    }
    set((s) => ({
      tasks: s.tasks.filter((t) => t.id !== taskId),
      selectedTaskId: s.selectedTaskId === taskId ? null : s.selectedTaskId,
      terminalTaskId: s.terminalTaskId === taskId ? null : s.terminalTaskId,
      pullRequests: s.pullRequests.filter((pr) => pr && pr.id !== `pr-${taskId}`),
      worktrees: s.worktrees.filter((wt) => wt && wt.workerId !== taskId),
      workers: s.workers.filter((w) => w.taskId !== taskId),
    }))
    get().addNotification('info', 'Task deleted')
    await get().loadActivities()
  },

  clearPlannedTasks: async () => {
    if (!ipc) return
    const planned = get().tasks.filter((t) => t.status === 'planned')
    if (planned.length === 0) return
    for (const t of planned) {
      await ipc.deleteJob(t.id)
    }
    await get().refreshAll()
    get().addNotification('info', `Deleted ${planned.length} planned task${planned.length > 1 ? 's' : ''}`)
  },

  startTask: async (taskId, workdir) => {
    const task = get().tasks.find(t => t.id === taskId)
    if (!task || !ipc) return

    const activeProject = get().currentProject
    const effectiveWorkdir = workdir || activeProject?.path || get().projectDirectory || '.'

    if (!activeProject && (!workdir || workdir === '.')) {
      get().addNotification('info', 'Choose a project folder to run this task')
      get().setShowProjectSetupModal(true, [taskId])
      return
    }

    if (get().approvalMode) {
      const ok = window.confirm(`Start ${task.agent} on "${task.title}"?\n\nWorking directory:\n${effectiveWorkdir}`)
      if (!ok) return
    }

    const readyStatuses = get().toolStatuses.filter(t => t.available)
    const agentToolIdMap: Record<string, string> = {
      'Claude Code': 'claude-code',
      'Codex': 'codex',
      'OpenCode': 'opencode',
      'Antigravity': 'antigravity',
      'Aider': 'aider',
    }
    const agentIsReady = readyStatuses.some(t => t.toolId === agentToolIdMap[task.agent])
    let effectiveAgent = task.agent
    if (!agentIsReady && readyStatuses.length > 0) {
      const fallbackToolId = readyStatuses[0].toolId
      const toolIdToAgent: Record<string, string> = {
        'claude-code': 'Claude Code',
        'codex': 'Codex',
        'opencode': 'OpenCode',
        'antigravity': 'Antigravity',
        'aider': 'Aider',
      }
      effectiveAgent = (toolIdToAgent[fallbackToolId] || task.agent) as typeof task.agent
      get().addNotification('info', `${task.agent} not available — routing to ${effectiveAgent}`)
      await ipc.updateJob(taskId, { agent: effectiveAgent })
      set(s => ({ tasks: s.tasks.map(t => t.id === taskId ? { ...t, agent: effectiveAgent as typeof t.agent } : t) }))
    } else if (!agentIsReady && readyStatuses.length === 0) {
      get().addNotification('error', 'No coding agents are ready. Open Tool Setup first.')
      get().setShowToolSetupModal(true)
      return
    }

    const result = await ipc.runTask(taskId, effectiveAgent, effectiveWorkdir)
    if (result?.error) {
      get().addNotification('error', result.error)
      return
    }
    get().addNotification('info', `${effectiveAgent} started on "${task.title}"`)
    get().openTerminal(taskId)
    await get().refreshAll()
  },

  stopTask: async (taskId) => {
    if (!ipc) return
    await ipc.cancelTask(taskId)
    get().addNotification('info', 'Agent stopped')
    await get().refreshAll()
  },

  mergeTask: async (taskId) => {
    if (!ipc) return
    const result = await ipc.mergeTask(taskId)
    if (result?.success === false) {
      get().addNotification('error', `Merge failed: ${result.error || 'resolve conflicts and retry'}`)
      await get().refreshAll()
      return
    }
    get().addNotification('success', 'PR merged ✓')
    await get().refreshAll()
  },

  discardTask: async (taskId) => {
    if (!ipc) return
    await ipc.discardTask(taskId)
    get().addNotification('warning', 'Worktree discarded')
    await get().refreshAll()
  },

  planTasks: async (description) => {
    if (!ipc) return []
    const settings = get().settings
    const mode = settings.defaultExecutionMode || 'auto'
    const customPool: AgentName[] = [] // Can be updated if a global pool is implemented
    const subtasks = await ipc.planTask({ description, mode, customPool })
    return (subtasks || []).map((st: any) => ({
      id: st.id,
      title: st.title,
      description: st.description,
      status: st.status || 'planned',
      priority: 'normal',
      agent: st.assignedAgent || 'Claude Code',
      rationale: st.rationale,
      dependencyMode: st.dependencyMode || 'parallel',
    })) as Task[]
  },

  addPlannedTasks: async (tasks) => {
    if (!ipc) return
    for (const t of tasks) {
      await ipc.createJob({ id: t.id, title: t.title, description: t.description, agent: t.agent, priority: t.priority })
    }
    await get().loadTasks()
  },

  startAllTasks: async (taskIds) => {
    // Each task gets its own Git worktree, so independent plan phases can run
    // concurrently on different ready CLIs instead of blocking one another.
    await Promise.all(taskIds.map((id) => get().startTask(id)))
    get().addNotification('info', `${taskIds.length} agents started`)
  },

  sendAgentFeedback: async (taskId, customFeedback) => {
    if (!ipc) return
    const task = get().tasks.find(t => t.id === taskId)
    if (!task) return
    const feedback = customFeedback?.trim() || [
      task.subStatus,
      ...(task.failedTests || []),
      'Please fix the review issues and complete the original task.',
    ].filter(Boolean).join('\n')
    const result = await ipc.retryTask(taskId, feedback)
    if (result?.error) {
      get().addNotification('error', result.error)
      return
    }
    get().addNotification('info', 'Directive sent — agent retrying')
    await get().refreshAll()
  },

  createWorktree: async (branchName, baseBranch) => {
    if (!ipc) return
    const result = await ipc.createWorktree({ branchName, baseBranch })
    if (result?.error) {
      get().addNotification('error', result.error)
      return
    }
    get().addNotification('success', `Worktree created: ${branchName}`)
    await get().refreshAll()
  },

  setTaskExecutionMode: async (taskId, mode) => {
    if (!ipc) return
    await ipc.setTaskExecutionMode(taskId, mode)
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, executionMode: mode } : t)),
    }))
  },

  setTaskCustomPool: async (taskId, pool) => {
    if (!ipc) return
    await ipc.setTaskCustomPool(taskId, pool)
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, customAgentPool: pool } : t)),
    }))
  },

  // Preview server
  previewPorts: {},
  startPreviewServer: async (taskId) => {
    if (!ipc) return { error: 'IPC not available' }
    const result = await ipc.startPreviewServer(taskId)
    if (result && result.port) {
      set((s) => ({ previewPorts: { ...s.previewPorts, [taskId]: result.port } }))
      get().addNotification('info', `Preview server running on port ${result.port}`)
    } else if (result?.error) {
      get().addNotification('error', `Preview server failed: ${result.error}`)
    }
    return result
  },
  stopPreviewServer: async (taskId) => {
    if (!ipc) return
    await ipc.stopPreviewServer(taskId)
    set((s) => ({ previewPorts: Object.fromEntries(Object.entries(s.previewPorts).filter(([k]) => k !== taskId)) }))
  },

  // Plugins
  plugins: [] as Plugin[],
  loadPlugins: async () => {
    if (!ipc) return
    const rows = await ipc.getPlugins()
    set({ plugins: rows.map((r: any) => ({ 
      id: r.id, name: r.name, type: r.type, command: r.command, 
      args: r.args, env: r.env, isEnabled: r.is_enabled === 1, createdAt: r.created_at 
    })) })
  },
  addPlugin: async (p) => {
    if (!ipc) return
    await ipc.addPlugin(p)
    await get().loadPlugins()
    get().addNotification('success', `Plugin "${p.name}" added`)
  },
  deletePlugin: async (id) => {
    if (!ipc) return
    await ipc.deletePlugin(id)
    await get().loadPlugins()
  },
  togglePlugin: async (id, enabled) => {
    if (!ipc) return
    await ipc.togglePlugin(id, enabled)
    await get().loadPlugins()
  },

  // Hooks
  hooks: [] as Hook[],
  loadHooks: async () => {
    if (!ipc) return
    const rows = await ipc.getHooks()
    set({ hooks: (rows || []).map((r: any) => ({
      id: r.id,
      name: r.name,
      event: r.event,
      command: r.command,
      scope: r.scope || 'global',
      enabled: (r.enabled ?? r.is_enabled ?? 0) === 1,
      createdAt: r.created_at || r.createdAt,
    })) })
  },
  addHook: async (hook) => {
    if (!ipc) return
    await ipc.addHook(hook)
    await get().loadHooks()
    get().addNotification('success', `Hook "${hook.name}" created`)
  },
  updateHook: async (id, fields) => {
    if (!ipc) return
    await ipc.updateHook(id, fields)
    await get().loadHooks()
  },
  deleteHook: async (id) => {
    if (!ipc) return
    await ipc.deleteHook(id)
    await get().loadHooks()
    get().addNotification('info', 'Hook deleted')
  },
  toggleHook: async (id, enabled) => {
    if (!ipc) return
    await ipc.toggleHook(id, enabled)
    await get().loadHooks()
  },
  testHookCommand: async (command) => {
    if (!ipc) return { ok: false, exitCode: 1, output: 'IPC unavailable' }
    return ipc.testHookCommand(command)
  },

  // Plan & Command Approval
  approvePlan: async (taskId) => {
    if (!ipc) return
    await ipc.approvePlan(taskId)
    get().addNotification('success', 'Plan approved! Starting agent execution...')
    await get().startTask(taskId)
  },
  updateSubtaskAgent: async (taskId, subtaskId, agent) => {
    if (!ipc) return
    await ipc.updateSubtaskAgent(taskId, subtaskId, agent)
    await get().refreshAll()
  },
  respondCommandApproval: async (taskId, promptId, approve) => {
    if (!ipc) return
    await ipc.respondCommandApproval(taskId, promptId, approve)
    set((s) => {
      const next = { ...s.pendingCommandApprovals }
      delete next[taskId]
      return { pendingCommandApprovals: next }
    })
    get().addNotification(approve ? 'success' : 'warning', approve ? 'Command approved ✓' : 'Command denied ✗')
  },
  pendingCommandApprovals: {},

  // Workers
  workers: [],
  loadWorkers: async () => {
    if (!ipc) return
    const rows = await ipc.getWorkers()
    set({ workers: rows.map(dbRowToWorker) })
  },
  showWorkerPanel: false,
  setShowWorkerPanel: (v) => set({ showWorkerPanel: v }),

  // Activities
  activities: [],
  loadActivities: async () => {
    if (!ipc) return
    const rows = await ipc.getActivities()
    set({ activities: rows.map((r: any) => ({ id: r.id, timestamp: r.timestamp, type: r.type, message: r.message, taskId: r.job_id })) })
  },

  // Terminal
  terminalTaskId: null,
  openTerminal: (taskId) => set({ terminalTaskId: taskId, diffTaskId: null }),
  closeTerminal: () => set({ terminalTaskId: null }),

  // Diff
  diffTaskId: null,
  openDiff: (taskId) => set({ diffTaskId: taskId, terminalTaskId: null }),
  closeDiff: () => set({ diffTaskId: null }),

  // Derived: Pull Requests
  pullRequests: [],

  // Derived: Worktrees
  worktrees: [],

  // MCP
  mcpServers: [],
  loadMcpServers: async () => {
    if (!ipc) return
    const rows = await ipc.getMcpServers()
    set({ mcpServers: rows.map((r: any) => ({ id: r.id, name: r.name, command: r.command, args: r.args, env: r.env, isEnabled: r.is_enabled === 1 })) })
  },
  addMcpServer: async (s) => {
    if (!ipc) return
    const rows = await ipc.addMcpServer(s)
    set({ mcpServers: rows.map((r: any) => ({ id: r.id, name: r.name, command: r.command, args: r.args, env: r.env, isEnabled: r.is_enabled === 1 })) })
  },
  deleteMcpServer: async (id) => {
    if (!ipc) return
    const rows = await ipc.deleteMcpServer(id)
    set({ mcpServers: rows.map((r: any) => ({ id: r.id, name: r.name, command: r.command, args: r.args, env: r.env, isEnabled: r.is_enabled === 1 })) })
  },
  updateMcpServer: async (id, fields) => {
    if (!ipc) return
    const rows = await ipc.updateMcpServer(id, fields)
    set({ mcpServers: rows.map((r: any) => ({ id: r.id, name: r.name, command: r.command, args: r.args, env: r.env, isEnabled: r.is_enabled === 1 })) })
  },

  // Credentials
  credentials: [],
  loadCredentials: async () => {
    if (!ipc) return
    const rows = await ipc.getCredentials()
    set({ credentials: rows.map((r: any) => ({ id: r.id, agent: r.agent, label: r.label, isActive: r.is_active === 1, createdAt: r.created_at })) })
  },
  addCredential: async (c) => {
    if (!ipc) return
    await ipc.addCredential(c)
    await get().loadCredentials()
    get().addNotification('success', `Credential saved for ${c.agent}`)
  },
  deleteCredential: async (id) => {
    if (!ipc) return
    await ipc.deleteCredential(id)
    await get().loadCredentials()
  },

  // Skills
  skills: [],
  loadSkills: async () => {
    if (!ipc) return
    const rows = await ipc.getSkills()
    set({ skills: rows.map((r: any) => ({ id: r.id, name: r.name, content: r.content, createdAt: r.created_at })) })
  },
  addSkill: async (s) => {
    if (!ipc) return
    await ipc.addSkill(s)
    await get().loadSkills()
    get().addNotification('success', `Skill "${s.name}" saved`)
  },
  deleteSkill: async (id) => {
    if (!ipc) return
    await ipc.deleteSkill(id)
    await get().loadSkills()
  },

  // Settings
  settings: {
    projectDirectory: './my-project',
    defaultAgent: 'claude-code',
    theme: 'dark',
    agentCommand: 'claude',
    defaultTimeout: 30,
    approvalMode: false,
    toolSetupCompleted: false,
  },
  projectDirectory: './my-project',
  setProjectDirectory: (d) => {
    set((s) => ({ projectDirectory: d, settings: { ...s.settings, projectDirectory: d } }))
    if (ipc) ipc.setSetting('projectDirectory', d)
  },
  approvalMode: false,
  setApprovalMode: (v) => {
    set((s) => ({ approvalMode: v, settings: { ...s.settings, approvalMode: v } }))
    if (ipc) ipc.setSetting('approvalMode', String(v))
  },
  updateSkill: async (id, fields) => {
    if (!ipc) return
    await ipc.updateSkill(id, fields)
    await get().loadSkills()
    get().addNotification('success', 'Skill updated')
  },
  toolStatuses: [],
  toolSetupCompleted: false,
  loadToolStatuses: async () => {
    if (!ipc) return
    const rows = await ipc.getToolStatuses()
    set({ toolStatuses: rows })
  },
  refreshToolStatuses: async () => {
    if (!ipc) return
    const rows = await ipc.refreshToolStatuses()
    set({ toolStatuses: rows })
  },
  loadToolSetupState: async () => {
    if (!ipc) return
    const result = await ipc.getToolSetupCompleted()
    set((s) => ({ toolSetupCompleted: result.completed, settings: { ...s.settings, toolSetupCompleted: result.completed } }))
  },
  setToolSetupCompleted: async (completed) => {
    set((s) => ({ toolSetupCompleted: completed, settings: { ...s.settings, toolSetupCompleted: completed } }))
    if (ipc) {
      await ipc.setToolSetupCompleted(completed)
    }
  },
  loadSettings: async () => {
    if (!ipc) return
    const rows = await ipc.getSettings()
    const approvalMode = rows.approvalMode === 'true' || rows.approvalMode === true
    const hasToolSetupCompleted = Object.prototype.hasOwnProperty.call(rows, 'toolSetupCompleted')
    set((s) => ({
      settings: {
        ...s.settings,
        ...rows,
        toolSetupCompleted: hasToolSetupCompleted
          ? rows.toolSetupCompleted === 'true' || rows.toolSetupCompleted === true
          : s.toolSetupCompleted,
        approvalMode,
      },
      toolSetupCompleted: hasToolSetupCompleted
        ? rows.toolSetupCompleted === 'true' || rows.toolSetupCompleted === true
        : s.toolSetupCompleted,
      approvalMode,
    }))
  },
  updateSettings: async (partial) => {
    set((s) => ({ settings: { ...s.settings, ...partial } }))
    if (ipc) {
      for (const [key, value] of Object.entries(partial)) {
        await ipc.setSetting(key, String(value))
      }
    }
  },

  // Projects
  projects: [],
  currentProject: null,
  loadProjects: async () => {
    if (!ipc) return
    const rows = await ipc.getProjects()
    const projects = rows.map(dbRowToProject)
    const active = projects.find(p => p.isActive) || null
    set({
      projects,
      currentProject: active,
      ...(active ? { projectDirectory: active.path } : {}),
    })
  },
  addProject: async (p) => {
    if (!ipc) return false
    const result = await ipc.addProject({
      name: p.name,
      path: p.path,
      gitRemote: p.gitRemote,
      createIfMissing: p.createIfMissing,
      gitInit: p.gitInit,
      setActive: p.setActive !== false,
    })
    if (result?.error) {
      get().addNotification('error', result.error)
      return false
    }
    await get().loadProjects()
    get().addNotification('success', `Project "${p.name}" ready`)
    return true
  },
  deleteProject: async (id) => {
    if (!ipc) return
    await ipc.deleteProject(id)
    await get().loadProjects()
  },
  setActiveProject: async (id) => {
    if (!ipc) return
    await ipc.setActiveProject(id)
    await get().loadProjects()
    const proj = get().projects.find(p => p.id === id)
    if (proj) {
      set((s) => ({ projectDirectory: proj.path, settings: { ...s.settings, projectDirectory: proj.path } }))
      await ipc.setSetting('projectDirectory', proj.path)
    }
  },

  // Notifications
  notifications: [],
  addNotification: (type, message) => {
    const id = Math.random().toString(36).substring(2, 9)
    set((s) => ({ notifications: [...s.notifications, { id, type, message, timestamp: Date.now() }] }))
    setTimeout(() => set((s) => ({ notifications: s.notifications.filter(n => n.id !== id) })), 4000)
  },
  removeNotification: (id) => set((s) => ({ notifications: s.notifications.filter(n => n.id !== id) })),

  // Modals
  showNewTaskModal: false,
  setShowNewTaskModal: (v) => set({ showNewTaskModal: v }),
  showCommandPalette: false,
  setShowCommandPalette: (v) => set({ showCommandPalette: v }),
  showProjectSetupModal: false,
  pendingStartAfterProject: null,
  setShowProjectSetupModal: (v, pendingTaskIds = null) => set({
    showProjectSetupModal: v,
    pendingStartAfterProject: v ? (pendingTaskIds ?? null) : null,
  }),
  showOrchestrator: false,
  setShowOrchestrator: (v) => set({ showOrchestrator: v }),
  showToolSetupModal: false,
  setShowToolSetupModal: (v) => set({ showToolSetupModal: v }),
  showShortcutsModal: false,
  setShowShortcutsModal: (v) => set({ showShortcutsModal: v }),

  // Bulk load
  loadAll: async () => {
    if (ipc && !commandApprovalListenerBound) {
      commandApprovalListenerBound = true
      ipc.onCommandApprovalRequested(({ taskId, promptId, command }) => {
        set((s) => ({
          pendingCommandApprovals: {
            ...s.pendingCommandApprovals,
            [taskId]: { promptId, command },
          },
        }))
      })
    }
    await Promise.all([get().loadTasks(), get().loadWorkers(), get().loadActivities(), get().loadMcpServers(), get().loadCredentials(), get().loadSkills(), get().loadSettings(), get().loadPlugins(), get().loadProjects(), get().loadToolStatuses(), get().loadToolSetupState(), get().loadHooks()])
  },
  refreshAll: async () => {
    if (!ipc) return
    const [taskRows, workerRows, activityRows, projectRows] = await Promise.all([
      ipc.getJobs(), ipc.getWorkers(), ipc.getActivities(), ipc.getProjects(),
    ])
    const tasks = taskRows.map(dbRowToTask)
    const projects = projectRows.map(dbRowToProject)
    const active = projects.find((p: any) => p.isActive) || null
    set({
      tasks,
      pullRequests: tasks.map(taskToPullRequest).filter(Boolean) as any,
      worktrees: tasks.map(taskToWorktree).filter(Boolean) as any,
      workers: workerRows.map(dbRowToWorker),
      activities: activityRows.map((r: any) => ({ id: r.id, timestamp: r.timestamp, type: r.type, message: r.message, taskId: r.job_id })),
      projects,
      currentProject: active,
      ...(active ? { projectDirectory: active.path } : {}),
    })
  },
  killAll: async () => {
    if (ipc) await ipc.killAll()
    get().addNotification('warning', 'All agents killed')
    await get().refreshAll()
  },
}))

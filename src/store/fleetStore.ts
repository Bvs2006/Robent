/**
 * src/store/fleetStore.ts — Zustand store
 * 
 * All state comes from the Electron main process via IPC.
 * No mock fallbacks — this runs only in Electron context.
 */
import { create } from 'zustand'
import type { Task, Worker, ActivityItem, Notification, PageId, McpServer, Credential, Skill, RaceEntry, AgentName, Settings, Plugin, Project, ToolStatusRecord } from '../types'

// ─── Helpers ─────────────────────────────────────────────────────────────────
const ipc = window.electronAPI

function dbRowToTask(row: any): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    agent: row.agent,
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
    changes: 0,
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
  createTask: (title: string, desc: string, agent: AgentName, priority: Task['priority']) => Promise<Task>
  startTask: (taskId: string, workdir?: string) => Promise<void>
  stopTask: (taskId: string) => Promise<void>
  mergeTask: (taskId: string) => Promise<void>
  discardTask: (taskId: string) => Promise<void>
  planTasks: (description: string) => Promise<Task[]>
  addPlannedTasks: (tasks: Task[]) => Promise<void>
  startAllTasks: (taskIds: string[]) => Promise<void>
  sendAgentFeedback: (taskId: string) => Promise<void>

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

  // Race Mode
  raceTaskId: string | null
  raceEntries: Record<string, RaceEntry>
  startRace: (taskId: string, agents: AgentName[], workdir?: string) => Promise<void>
  closeRace: () => void

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
  deleteMcpServer: (id: string) => Promise<void>

  // Credentials
  credentials: Credential[]
  loadCredentials: () => Promise<void>
  addCredential: (c: { agent: string; label: string; secret: string }) => Promise<void>
  deleteCredential: (id: string) => Promise<void>

  // Skills
  skills: Skill[]
  loadSkills: () => Promise<void>
  addSkill: (s: { name: string; content: string }) => Promise<void>
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
  addProject: (p: { name: string; path: string; gitRemote?: string }) => Promise<void>
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
  setCurrentPage: (p) => set({ currentPage: p }),

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

  createTask: async (title, desc, agent, priority) => {
    if (!ipc) throw new Error('IPC not available')
    const id = newTaskId()
    const row = await ipc.createJob({ id, title, description: desc, agent, priority })
    const t = dbRowToTask(row)
    set((s) => ({ tasks: [t, ...s.tasks] }))
    get().addNotification('success', `Task created: ${title}`)
    return t
  },

  startTask: async (taskId, workdir) => {
    const task = get().tasks.find(t => t.id === taskId)
    if (!task || !ipc) return

    // Use active project directory if available
    const activeProject = get().currentProject
    const effectiveWorkdir = workdir || activeProject?.path || get().projectDirectory || '.'

    // If the task's assigned agent is not installed/ready, reroute to a ready one
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
      // Update task agent in DB
      await ipc.updateJob(taskId, { agent: effectiveAgent })
      set(s => ({ tasks: s.tasks.map(t => t.id === taskId ? { ...t, agent: effectiveAgent as typeof t.agent } : t) }))
    }

    await ipc.runTask(taskId, effectiveAgent, effectiveWorkdir)
    get().addNotification('info', `${effectiveAgent} started on "${task.title}"`)
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
    const readyStatuses = get().toolStatuses.filter(t => t.available)
    const availableAgents: AgentName[] = readyStatuses.map(t => {
      if (t.toolId === 'claude-code') return 'Claude Code'
      if (t.toolId === 'codex') return 'Codex'
      if (t.toolId === 'opencode') return 'OpenCode'
      if (t.toolId === 'antigravity') return 'Antigravity'
      if (t.toolId === 'aider') return 'Aider'
      return 'Claude Code'
    })
    const agentsList: AgentName[] = availableAgents.length > 0 ? availableAgents : ['Claude Code', 'OpenCode']
    const pickAgent = (idx: number) => agentsList[idx % agentsList.length]

    const words = description.split(' ').slice(0, 4).join(' ')
    const subtasks: Task[] = [
      { id: newTaskId('PHASE'), title: `${words} — Core`, description: `Phase 1 — Core implementation: ${description}`, status: 'planned', priority: 'normal', agent: pickAgent(0) },
      { id: newTaskId('PHASE'), title: `${words} — UI`, description: `Phase 2 — User interface: ${description}`, status: 'planned', priority: 'normal', agent: pickAgent(1) },
      { id: newTaskId('PHASE'), title: `${words} — Tests`, description: `Phase 3 — Test suite: ${description}`, status: 'planned', priority: 'low', agent: pickAgent(2) },
    ]
    return subtasks
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

  sendAgentFeedback: async (taskId) => {
    if (!ipc) return
    await ipc.updateJob(taskId, { status: 'working', ci_status: 'pending' })
    get().addNotification('info', 'Feedback sent to agent')
    await get().refreshAll()
  },

  // Preview server
  previewPorts: {},
  startPreviewServer: async (taskId) => {
    if (!ipc) return { error: 'IPC not available' }
    const result = await ipc.startPreviewServer(taskId)
    if (result && result.port) {
      set((s) => ({ previewPorts: { ...s.previewPorts, [taskId]: result.port } }))
      get().addNotification('info', `Preview server running on port ${result.port}`)
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
  openTerminal: (taskId) => set({ terminalTaskId: taskId, raceTaskId: null, diffTaskId: null }),
  closeTerminal: () => set({ terminalTaskId: null }),

  // Race Mode
  raceTaskId: null,
  raceEntries: {},
  startRace: async (taskId, agents, workdir = '.') => {
    const entries: Record<string, RaceEntry> = {}
    for (const agent of agents) {
      entries[agent] = { agent, status: 'running', output: '' }
    }
    set({ raceTaskId: taskId, raceEntries: entries, terminalTaskId: null, diffTaskId: null })

    if (ipc) {
      ipc.onRaceOutput((tid, agent, chunk) => {
        if (tid !== taskId) return
        set((s) => ({
          raceEntries: { ...s.raceEntries, [agent]: { ...s.raceEntries[agent], output: (s.raceEntries[agent]?.output || '') + chunk } }
        }))
      })
      ipc.onRaceResult((tid, agent, result) => {
        if (tid !== taskId) return
        set((s) => ({
          raceEntries: {
            ...s.raceEntries,
            [agent]: { ...s.raceEntries[agent], status: result.status === 'success' ? 'done' : 'failed', summary: result.summary, tokenCount: result.tokenCount, cost: result.cost }
          }
        }))
      })
      await ipc.runRace(taskId, agents, workdir)
    }
    get().addNotification('info', `Race started: ${agents.join(' vs ')}`)
  },
  closeRace: () => set({ raceTaskId: null, raceEntries: {} }),

  // Diff
  diffTaskId: null,
  openDiff: (taskId) => set({ diffTaskId: taskId, terminalTaskId: null, raceTaskId: null }),
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
  setProjectDirectory: (d) => set((s) => ({ projectDirectory: d, settings: { ...s.settings, projectDirectory: d } })),
  approvalMode: false,
  setApprovalMode: (v) => set((s) => ({ approvalMode: v, settings: { ...s.settings, approvalMode: v } })),
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
    const active = projects.find(p => p.isActive)
    set({
      projects,
      ...(active ? { currentProject: active, projectDirectory: active.path } : {}),
    })
  },
  addProject: async (p) => {
    if (!ipc) return
    const result = await ipc.addProject(p)
    if (result?.error) {
      get().addNotification('error', result.error)
      return
    }
    await get().loadProjects()
    get().addNotification('success', `Project "${p.name}" added`)
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

  // Bulk load
  loadAll: async () => {
    await Promise.all([get().loadTasks(), get().loadWorkers(), get().loadActivities(), get().loadMcpServers(), get().loadCredentials(), get().loadSkills(), get().loadSettings(), get().loadPlugins(), get().loadProjects(), get().loadToolStatuses(), get().loadToolSetupState()])
  },
  refreshAll: async () => {
    if (!ipc) return
    const [taskRows, workerRows, activityRows, projectRows] = await Promise.all([
      ipc.getJobs(), ipc.getWorkers(), ipc.getActivities(), ipc.getProjects(),
    ])
    const tasks = taskRows.map(dbRowToTask)
    const projects = projectRows.map(dbRowToProject)
    const active = projects.find((p: any) => p.isActive)
    set({
      tasks,
      pullRequests: tasks.map(taskToPullRequest).filter(Boolean) as any,
      worktrees: tasks.map(taskToWorktree).filter(Boolean) as any,
      workers: workerRows.map(dbRowToWorker),
      activities: activityRows.map((r: any) => ({ id: r.id, timestamp: r.timestamp, type: r.type, message: r.message, taskId: r.job_id })),
      projects,
      ...(active ? { currentProject: active, projectDirectory: active.path } : {}),
    })
  },
  killAll: async () => {
    if (ipc) await ipc.killAll()
    get().addNotification('warning', 'All agents killed')
    await get().refreshAll()
  },
}))

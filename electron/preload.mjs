import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  // Jobs
  getJobs: () => ipcRenderer.invoke('get-jobs'),
  getJob: (id) => ipcRenderer.invoke('get-job', id),
  createJob: (job) => ipcRenderer.invoke('create-job', job),
  updateJob: (id, fields) => ipcRenderer.invoke('update-job', id, fields),
  deleteJob: (id) => ipcRenderer.invoke('delete-job', id),
  getActivities: () => ipcRenderer.invoke('get-activities'),
  getWorkers: () => ipcRenderer.invoke('get-workers'),
  getTerminalLines: (jobId) => ipcRenderer.invoke('get-terminal-lines', jobId),
  sendTaskInput: (taskId, data) => ipcRenderer.invoke('send-task-input', { taskId, data }),

  // Tool setup
  getToolStatuses: () => ipcRenderer.invoke('get-tool-statuses'),
  refreshToolStatuses: () => ipcRenderer.invoke('refresh-tool-statuses'),
  getToolSetupCompleted: () => ipcRenderer.invoke('get-tool-setup-completed'),
  setToolSetupCompleted: (completed) => ipcRenderer.invoke('set-tool-setup-completed', completed),
  saveToolSecret: (payload) => ipcRenderer.invoke('save-tool-secret', payload),
  runToolAction: (payload) => ipcRenderer.invoke('run-tool-action', payload),
  writeToolInput: (payload) => ipcRenderer.invoke('write-tool-input', payload),
  killToolSession: (sessionId) => ipcRenderer.invoke('kill-tool-session', sessionId),
  getToolAuthCapabilities: () => ipcRenderer.invoke('get-tool-auth-capabilities'),

  // Task execution
  planTask: (payload) => ipcRenderer.invoke('plan-task', payload),
  runTask: (taskId, agent, workdir) => ipcRenderer.invoke('run-task', { taskId, agent, workdir }),
  retryTask: (taskId, feedback) => ipcRenderer.invoke('retry-task', { taskId, feedback }),
  cancelTask: (taskId) => ipcRenderer.invoke('cancel-task', taskId),
  setTaskExecutionMode: (taskId, mode) => ipcRenderer.invoke('set-task-execution-mode', { taskId, mode }),
  setTaskCustomPool: (taskId, pool) => ipcRenderer.invoke('set-task-custom-pool', { taskId, pool }),
  killAll: () => ipcRenderer.invoke('kill-all'),
  mergeTask: (taskId) => ipcRenderer.invoke('merge-task', taskId),
  discardTask: (taskId) => ipcRenderer.invoke('discard-task', taskId),
  createWorktree: (payload) => ipcRenderer.invoke('create-worktree', payload),
  listBranches: (workdir) => ipcRenderer.invoke('list-branches', workdir),
  getWorktreeFiles: (taskId) => ipcRenderer.invoke('get-worktree-files', taskId),
  getTaskPreview: (taskId) => ipcRenderer.invoke('get-task-preview', taskId),

  // MCP Servers
  getMcpServers: () => ipcRenderer.invoke('get-mcp-servers'),
  getCapabilityRegistry: () => ipcRenderer.invoke('get-capability-registry'),
  testMcpServerConnection: (server) => ipcRenderer.invoke('test-mcp-server-connection', server),
  addMcpServer: (server) => ipcRenderer.invoke('add-mcp-server', server),
  updateMcpServer: (id, fields) => ipcRenderer.invoke('update-mcp-server', id, fields),
  deleteMcpServer: (id) => ipcRenderer.invoke('delete-mcp-server', id),

  // Credentials
  getCredentials: () => ipcRenderer.invoke('get-credentials'),
  addCredential: (cred) => ipcRenderer.invoke('add-credential', cred),
  deleteCredential: (id) => ipcRenderer.invoke('delete-credential', id),

  // Skills
  getSkills: () => ipcRenderer.invoke('get-skills'),
  addSkill: (skill) => ipcRenderer.invoke('add-skill', skill),
  updateSkill: (id, fields) => ipcRenderer.invoke('update-skill', id, fields),
  deleteSkill: (id) => ipcRenderer.invoke('delete-skill', id),

  // Plugins
  getPlugins: () => ipcRenderer.invoke('get-plugins'),
  addPlugin: (plugin) => ipcRenderer.invoke('add-plugin', plugin),
  updatePlugin: (id, fields) => ipcRenderer.invoke('update-plugin', id, fields),
  deletePlugin: (id) => ipcRenderer.invoke('delete-plugin', id),
  togglePlugin: (id, enabled) => ipcRenderer.invoke('toggle-plugin', id, enabled),

  // Projects
  getProjects: () => ipcRenderer.invoke('get-projects'),
  getProject: (id) => ipcRenderer.invoke('get-project', id),
  addProject: (project) => ipcRenderer.invoke('add-project', project),
  deleteProject: (id) => ipcRenderer.invoke('delete-project', id),
  setActiveProject: (id) => ipcRenderer.invoke('set-active-project', id),

  // Settings
  getSettings: () => ipcRenderer.invoke('get-settings'),
  setSetting: (key, value) => ipcRenderer.invoke('set-setting', key, value),
  showOpenDialog: () => ipcRenderer.invoke('show-open-dialog'),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  openNativeTerminal: () => ipcRenderer.invoke('open-native-terminal'),

  // Preview server (Phase I)
  startPreviewServer: (taskId) => ipcRenderer.invoke('start-preview-server', taskId),
  stopPreviewServer: (taskId) => ipcRenderer.invoke('stop-preview-server', taskId),

  // Hooks
  getHooks: () => ipcRenderer.invoke('get-hooks'),
  addHook: (hook) => ipcRenderer.invoke('add-hook', hook),
  updateHook: (id, fields) => ipcRenderer.invoke('update-hook', id, fields),
  deleteHook: (id) => ipcRenderer.invoke('delete-hook', id),
  toggleHook: (id, enabled) => ipcRenderer.invoke('toggle-hook', id, enabled),
  testHookCommand: (command) => ipcRenderer.invoke('test-hook-command', command),

  // Plan Approval & Command Approval
  approvePlan: (taskId) => ipcRenderer.invoke('approve-plan', taskId),
  updateSubtaskAgent: (taskId, subtaskId, agent) => ipcRenderer.invoke('update-subtask-agent', { taskId, subtaskId, agent }),
  respondCommandApproval: (taskId, promptId, approve) => ipcRenderer.invoke('respond-command-approval', { taskId, promptId, approve }),

  // Event listeners
  onCommandApprovalRequested: (cb) => {
    const listener = (_e, payload) => cb(payload)
    ipcRenderer.on('command-approval-requested', listener)
    return () => ipcRenderer.removeListener('command-approval-requested', listener)
  },
  onTaskOutput: (cb) => {
    const listener = (_e, taskId, chunk, agent) => cb(taskId, chunk, agent)
    ipcRenderer.on('task-output', listener)
    return () => ipcRenderer.removeListener('task-output', listener)
  },
  onTaskDone: (cb) => {
    const listener = (_e, taskId, result) => cb(taskId, result)
    ipcRenderer.on('task-done', listener)
    return () => ipcRenderer.removeListener('task-done', listener)
  },
  onStateChanged: (cb) => {
    const listener = () => cb()
    ipcRenderer.on('state-changed', listener)
    return () => ipcRenderer.removeListener('state-changed', listener)
  },
  onRuntimeTick: (cb) => {
    const listener = (_e, runtimes) => cb(runtimes)
    ipcRenderer.on('runtime-tick', listener)
    return () => ipcRenderer.removeListener('runtime-tick', listener)
  },
  onPreviewReady: (cb) => {
    const listener = (_e, taskId, port, output) => cb(taskId, port, output)
    ipcRenderer.on('preview-ready', listener)
    return () => ipcRenderer.removeListener('preview-ready', listener)
  },
  onToolOutput: (cb) => {
    const listener = (_e, toolId, sessionId, chunk) => cb(toolId, sessionId, chunk)
    ipcRenderer.on('tool-output', listener)
    return () => ipcRenderer.removeListener('tool-output', listener)
  },
  onToolActionStarted: (cb) => {
    const listener = (_e, toolId, sessionId, kind) => cb(toolId, sessionId, kind)
    ipcRenderer.on('tool-action-started', listener)
    return () => ipcRenderer.removeListener('tool-action-started', listener)
  },
  onToolActionEnded: (cb) => {
    const listener = (_e, toolId, sessionId, exitCode, output) => cb(toolId, sessionId, exitCode, output)
    ipcRenderer.on('tool-action-ended', listener)
    return () => ipcRenderer.removeListener('tool-action-ended', listener)
  },
  onToolStatusesChanged: (cb) => {
    const listener = (_e, statuses) => cb(statuses)
    ipcRenderer.on('tool-statuses-changed', listener)
    return () => ipcRenderer.removeListener('tool-statuses-changed', listener)
  },

  // Auto Updater
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  restartAndUpdate: () => ipcRenderer.invoke('restart-and-update'),
  onUpdateStatus: (cb) => {
    const listener = (_e, status) => cb(status)
    ipcRenderer.on('update-status', listener)
    return () => ipcRenderer.removeListener('update-status', listener)
  },

  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
})
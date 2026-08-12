import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  // Jobs
  getJobs: () => ipcRenderer.invoke('get-jobs'),
  getJob: (id) => ipcRenderer.invoke('get-job', id),
  createJob: (job) => ipcRenderer.invoke('create-job', job),
  updateJob: (id, fields) => ipcRenderer.invoke('update-job', id, fields),
  getActivities: () => ipcRenderer.invoke('get-activities'),
  getWorkers: () => ipcRenderer.invoke('get-workers'),
  getTerminalLines: (jobId) => ipcRenderer.invoke('get-terminal-lines', jobId),

  // Tool setup
  getToolStatuses: () => ipcRenderer.invoke('get-tool-statuses'),
  refreshToolStatuses: () => ipcRenderer.invoke('refresh-tool-statuses'),
  getToolSetupCompleted: () => ipcRenderer.invoke('get-tool-setup-completed'),
  setToolSetupCompleted: (completed) => ipcRenderer.invoke('set-tool-setup-completed', completed),
  saveToolSecret: (payload) => ipcRenderer.invoke('save-tool-secret', payload),
  runToolAction: (payload) => ipcRenderer.invoke('run-tool-action', payload),

  // Task execution
  runTask: (taskId, agent, workdir) => ipcRenderer.invoke('run-task', { taskId, agent, workdir }),
  cancelTask: (taskId) => ipcRenderer.invoke('cancel-task', taskId),
  killAll: () => ipcRenderer.invoke('kill-all'),
  runRace: (taskId, agents, workdir) => ipcRenderer.invoke('run-race', { taskId, agents, workdir }),
  mergeTask: (taskId) => ipcRenderer.invoke('merge-task', taskId),
  discardTask: (taskId) => ipcRenderer.invoke('discard-task', taskId),

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

  // Preview server (Phase I)
  startPreviewServer: (taskId) => ipcRenderer.invoke('start-preview-server', taskId),
  stopPreviewServer: (taskId) => ipcRenderer.invoke('stop-preview-server', taskId),

  // Event listeners
  onTaskOutput: (cb) => ipcRenderer.on('task-output', (_e, taskId, chunk) => cb(taskId, chunk)),
  onTaskDone: (cb) => ipcRenderer.on('task-done', (_e, taskId, result) => cb(taskId, result)),
  onStateChanged: (cb) => ipcRenderer.on('state-changed', () => cb()),
  onRuntimeTick: (cb) => ipcRenderer.on('runtime-tick', (_e, runtimes) => cb(runtimes)),
  onRaceOutput: (cb) => ipcRenderer.on('race-output', (_e, taskId, agent, chunk) => cb(taskId, agent, chunk)),
  onRaceResult: (cb) => ipcRenderer.on('race-result', (_e, taskId, agent, result) => cb(taskId, agent, result)),
  onPreviewReady: (cb) => ipcRenderer.on('preview-ready', (_e, taskId, port, output) => cb(taskId, port, output)),
  onToolOutput: (cb) => ipcRenderer.on('tool-output', (_e, toolId, sessionId, chunk) => cb(toolId, sessionId, chunk)),
  onToolActionStarted: (cb) => ipcRenderer.on('tool-action-started', (_e, toolId, sessionId, kind) => cb(toolId, sessionId, kind)),
  onToolActionEnded: (cb) => ipcRenderer.on('tool-action-ended', (_e, toolId, sessionId, exitCode, output) => cb(toolId, sessionId, exitCode, output)),
  onToolStatusesChanged: (cb) => ipcRenderer.on('tool-statuses-changed', (_e, statuses) => cb(statuses)),
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
})
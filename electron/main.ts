/**
 * electron/main.ts — Electron Main Process
 * 
 * Owns: all IPC handlers, driver instances, SQLite DB, git operations.
 * Renderer communicates ONLY via IPC — never directly touches the file system.
 */
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const _filename = fileURLToPath(import.meta.url)
const _dirname = dirname(_filename)
if (typeof (globalThis as any).__dirname === 'undefined') {
  ;(globalThis as any).__dirname = _dirname
}
if (typeof (globalThis as any).__filename === 'undefined') {
  ;(globalThis as any).__filename = _filename
}

import { app, BrowserWindow, ipcMain, safeStorage, dialog, shell } from 'electron'
import type { ChildProcess } from 'child_process'
import { existsSync, mkdirSync, readdirSync, statSync } from 'fs'
import { simpleGit } from 'simple-git'
import type { SimpleGit } from 'simple-git'
import { spawn as childSpawn } from 'child_process'

import { createDriver } from './drivers.js'
import type { BaseDriver } from './drivers.js'
import { writeAgentMcpConfig } from './mcp.js'
import { getSetupCompleted, refreshToolStatuses, runToolAction, saveToolSecret, setSetupCompleted } from './tool-setup.js'
import { composePromptForDriver, syncCapabilitiesForDriver } from './capabilities.js'
import { getCapabilityRegistry, testMcpServerConnection } from './capabilities.js'
import {
  getDb, seedDefaultData, purgeDemoData,
  createJob, getJobs, getJob, updateJob,
  addActivity, getActivities,
  addTerminalLine, getTerminalLines,
  upsertWorker, removeWorker, getWorkers,
  getMcpServers, addMcpServer, updateMcpServer, deleteMcpServer,
  getCredentials, addCredential, deleteCredential,
  getSkills, addSkill, updateSkill, deleteSkill,
  getSettings, setSetting,
  getPlugins, addPlugin, updatePlugin, deletePlugin, togglePlugin,
  getProjects, getProject, addProject, deleteProject, setActiveProject, updateProjectGitRemote,
} from './db.js'

const __dirname = _dirname
process.env.APP_ROOT = join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = join(process.env.APP_ROOT, 'dist')
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

let win: BrowserWindow | null = null

// ─── Active Jobs Map ─────────────────────────────────────────────────────────
interface ActiveJob {
  driver: BaseDriver
  jobId: string
  raceJobId?: string
}
const activeJobs = new Map<string, ActiveJob>()
const activeToolSessions = new Map<string, { toolId: string; kind: 'install' | 'auth'; sessionId: string }>()

/** Preview server tracking (Phase I: Review Loop) */
const previewServers = new Map<string, { proc: ChildProcess; port: number; taskId: string }>()

// ─── Window ──────────────────────────────────────────────────────────────────
function createWindow() {
  win = new BrowserWindow({
    width: 1440,
    height: 900,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#09090b',
      symbolColor: '#a1a1aa',
      height: 40,
    },
    webPreferences: {
      preload: join(__dirname, 'preload.mjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
    // win.webContents.openDevTools()
  } else {
    win.loadFile(join(RENDERER_DIST, 'index.html'))
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') { app.quit(); win = null }
})
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })

app.whenReady().then(() => {
  // Initialize DB and seed
  try {
    const db = getDb()
    purgeDemoData()
    seedDefaultData()
    // Reset any orphaned working tasks and workers from previous app sessions
    db.prepare(`DELETE FROM workers`).run()
    db.prepare(`UPDATE jobs SET status = 'planned' WHERE status = 'working'`).run()
    refreshToolStatuses().catch((error) => console.error('Tool status refresh failed:', error))
  } catch (e) {
    console.error('DB init error:', e)
  }
  createWindow()
})

// ─── Helper ───────────────────────────────────────────────────────────────────
function genId(): string { return Math.random().toString(36).substring(2, 9) }

function emit(channel: string, ...args: any[]) {
  win?.webContents.send(channel, ...args)
}

function toolSetupCompleted(): boolean {
  return getSetupCompleted()
}

// ─── IPC: Jobs ────────────────────────────────────────────────────────────────
ipcMain.handle('get-jobs', () => getJobs())
ipcMain.handle('get-job', (_e, id: string) => getJob(id))

ipcMain.handle('create-job', (_e, job: { id: string; title: string; description: string; agent: string; priority: string }) => {
  createJob(job)
  addActivity({ id: genId(), jobId: job.id, type: 'task_created', message: `Task created — ${job.title}` })
  return getJob(job.id)
})

ipcMain.handle('update-job', (_e, id: string, fields: Record<string, any>) => {
  updateJob(id, fields)
  return getJob(id)
})

ipcMain.handle('get-activities', () => getActivities(100))
ipcMain.handle('get-workers', () => getWorkers())

ipcMain.handle('get-terminal-lines', (_e, jobId: string) => getTerminalLines(jobId))

// ─── IPC: Tool Setup ──────────────────────────────────────────────────────────
// get-tool-statuses: returns CACHED rows from DB instantly (no CLI probes, no blink)
ipcMain.handle('get-tool-statuses', () => getToolStatusSnapshots())
// refresh-tool-statuses: runs CLI probes then emits tool-statuses-changed ONLY
// It never emits state-changed so it cannot cause page navigation
ipcMain.handle('refresh-tool-statuses', async () => {
  const statuses = await refreshToolStatuses()
  emit('tool-statuses-changed', statuses)
  return statuses
})
ipcMain.handle('get-tool-setup-completed', () => ({ completed: toolSetupCompleted() }))
ipcMain.handle('set-tool-setup-completed', (_e, completed: boolean) => {
  setSetupCompleted(completed)
  return { completed: toolSetupCompleted() }
})
ipcMain.handle('save-tool-secret', (_e, payload: { toolId: string; label: string; secret: string }) => {
  saveToolSecret(payload.toolId as any, payload.label, payload.secret)
  return { success: true }
})
ipcMain.handle('run-tool-action', async (event, payload: { toolId: string; kind: 'install' | 'auth'; secret?: string }) => {
  const { sessionId, promise } = runToolAction(
    payload.toolId as any,
    payload.kind,
    (chunk) => {
      event.sender.send('tool-output', payload.toolId, sessionId, chunk)
    },
    () => {
      refreshToolStatuses()
        .then((statuses) => emit('tool-statuses-changed', statuses))
        .catch((error) => console.error('Tool status refresh failed:', error))
    },
    payload.secret,
  )

  activeToolSessions.set(sessionId, { toolId: payload.toolId, kind: payload.kind, sessionId })
  event.sender.send('tool-action-started', payload.toolId, sessionId, payload.kind)

  const result = await promise
  activeToolSessions.delete(sessionId)
  const statuses = await refreshToolStatuses().catch((error) => {
    console.error('Tool status refresh failed:', error)
    return null
  })
  if (statuses) emit('tool-statuses-changed', statuses)
  event.sender.send('tool-action-ended', payload.toolId, sessionId, result.exitCode, result.rawOutput)
  return { sessionId, exitCode: result.exitCode }
})

// ─── IPC: Run Task ────────────────────────────────────────────────────────────
ipcMain.handle('run-task', async (event, { taskId, agent, workdir }: { taskId: string; agent: string; workdir: string }) => {
  const job = getJob(taskId)
  if (!job) return { error: 'Job not found' }

  // Worktree isolation
  const jobRunId = genId()
  const branchName = `agent/${taskId.toLowerCase()}-${jobRunId}`
  let actualWorkdir = workdir

  try {
    const git: SimpleGit = simpleGit(workdir)
    const wtPath = join(workdir, '.agent-worktrees', jobRunId)
    mkdirSync(join(workdir, '.agent-worktrees'), { recursive: true })
    await git.raw(['worktree', 'add', '-b', branchName, wtPath])
    actualWorkdir = wtPath
  } catch (e) {
    console.warn('Worktree creation failed, using original workdir:', e)
  }

  // Write MCP server config file for this agent in the worktree
  const mcpConfigPath = writeAgentMcpConfig(agent, actualWorkdir)
  if (mcpConfigPath) {
    addActivity({ id: genId(), jobId: taskId, type: 'mcp_configured', message: `MCP config written: ${mcpConfigPath}` })
  }

  const capabilitySync = syncCapabilitiesForDriver(agent, actualWorkdir, {
    skillIds: Array.isArray((job as any).skill_ids) ? (job as any).skill_ids : undefined,
  })
  if (!capabilitySync.ok) {
    updateJob(taskId, { sub_status: `Capability sync failed for ${agent}` })
    addActivity({ id: genId(), jobId: taskId, type: 'capability_sync_failed', message: capabilitySync.error || `Capability sync failed for ${agent}` })
  } else {
    for (const log of capabilitySync.logs) {
      addActivity({ id: genId(), jobId: taskId, type: 'capability_sync', message: log })
    }
  }

  // Update job state
  updateJob(taskId, {
    status: 'working',
    branch: branchName,
    worktree: actualWorkdir,
    started_at: new Date().toLocaleTimeString(),
    runtime: 0,
  })
  upsertWorker({ id: `worker-${taskId}`, jobId: taskId, agent, status: 'running', runtime: 0 })
  addActivity({ id: genId(), jobId: taskId, type: 'agent_started', message: `${agent} started on ${job.title}` })
  addActivity({ id: genId(), jobId: taskId, type: 'worktree_created', message: `Worktree: ${actualWorkdir}` })
  emit('state-changed')

  // Create and run driver
  const driver = createDriver(agent)
  const prompt = composePromptForDriver(agent, job.description, {
    skillIds: Array.isArray((job as any).skill_ids) ? (job as any).skill_ids : undefined,
  })
  const { jobId: runId, promise } = driver.run(prompt, actualWorkdir, (chunk) => {
    event.sender.send('task-output', taskId, chunk)
    // Store chunk as terminal line
    addTerminalLine({ id: genId(), jobId: taskId, type: 'output', content: chunk })
  })

  activeJobs.set(taskId, { driver, jobId: runId })

  // Don't await — let it resolve in background
  promise.then(async (result) => {
    activeJobs.delete(taskId)

    // Stage & commit worktree changes automatically
    let diffText = ''
    try {
      const git: SimpleGit = simpleGit(actualWorkdir)
      await git.add('.')
      const status = await git.status()
      if (status.staged.length > 0 || status.created.length > 0 || status.modified.length > 0) {
        await git.commit(`feat(${taskId}): ${job.title}`)
        addActivity({ id: genId(), jobId: taskId, type: 'git_committed', message: `Committed worktree changes to ${branchName}` })
        diffText = await git.diff(['HEAD~1'])
      } else {
        diffText = await git.diff(['HEAD'])
      }
    } catch (e) {
      console.warn('Git commit/diff failed:', e)
    }

    // Estimate token cost
    const tokenCount = result.tokenCount || 0
    const estimatedCost = result.cost || 0

    updateJob(taskId, {
      status: 'review',
      diff: diffText,
      token_count: tokenCount,
      estimated_cost: estimatedCost,
      // A pull request number is only assigned by a real Git provider.
      // Do not fabricate PRs for local task runs.
      pr_number: null,
      ci_status: result.status === 'success' ? 'passing' : 'failed',
      completed_at: new Date().toLocaleTimeString(),
    })
    removeWorker(taskId)
    addActivity({ id: genId(), jobId: taskId, type: result.status === 'success' ? 'ci_passed' : 'ci_failed', message: `${agent} finished: ${result.summary}` })
    emit('state-changed')
    emit('task-done', taskId, result)
  })

  return { success: true, runId }
})

// ─── IPC: Cancel Task ─────────────────────────────────────────────────────────
ipcMain.handle('cancel-task', (_e, taskId: string) => {
  const job = activeJobs.get(taskId)
  if (job) {
    job.driver.cancel(job.jobId)
    activeJobs.delete(taskId)
    updateJob(taskId, { status: 'planned' })
    removeWorker(taskId)
    addActivity({ id: genId(), jobId: taskId, type: 'agent_stopped', message: 'Agent cancelled by user' })
    emit('state-changed')
  }
  return { success: true }
})

// ─── IPC: Kill All ────────────────────────────────────────────────────────────
ipcMain.handle('kill-all', () => {
  for (const [taskId, job] of activeJobs.entries()) {
    job.driver.cancel(job.jobId)
    updateJob(taskId, { status: 'planned' })
    removeWorker(taskId)
    addActivity({ id: genId(), jobId: taskId, type: 'agent_stopped', message: 'Killed by global stop' })
  }
  activeJobs.clear()
  emit('state-changed')
  return { success: true }
})

// ─── IPC: Race Mode ───────────────────────────────────────────────────────────
ipcMain.handle('run-race', async (event, { taskId, agents, workdir }: { taskId: string; agents: string[]; workdir: string }) => {
  const job = getJob(taskId)
  if (!job || agents.length < 2) return { error: 'Invalid race params' }

  const raceResults: Record<string, any> = {}
  const runners = agents.map(async (agent) => {
    const driver = createDriver(agent)
    const capabilitySync = syncCapabilitiesForDriver(agent, workdir, {
      skillIds: Array.isArray((job as any).skill_ids) ? (job as any).skill_ids : undefined,
    })
    if (!capabilitySync.ok) {
      addActivity({ id: genId(), jobId: taskId, type: 'capability_sync_failed', message: capabilitySync.error || `Capability sync failed for ${agent}` })
    }
    const prompt = composePromptForDriver(agent, job.description, {
      skillIds: Array.isArray((job as any).skill_ids) ? (job as any).skill_ids : undefined,
    })
    const { jobId, promise } = driver.run(prompt, workdir, (chunk) => {
      event.sender.send('race-output', taskId, agent, chunk)
    })
    const result = await promise
    raceResults[agent] = { ...result, jobId }
    emit('race-result', taskId, agent, result)
    return result
  })

  await Promise.all(runners)
  return raceResults
})

// ─── IPC: Merge Task ──────────────────────────────────────────────────────────
ipcMain.handle('merge-task', async (_e, taskId: string) => {
  const job = getJob(taskId)
  if (!job) return { error: 'Not found' }

  try {
    if (job.worktree && job.branch) {
      // Resolve the actual repository root and current branch instead of
      // assuming the worktree is always two directories below `main`.
      const worktreeGit = simpleGit(job.worktree)
      const repoRoot = (await worktreeGit.revparse(['--show-toplevel'])).trim()
      const git: SimpleGit = simpleGit(repoRoot)
      const targetBranch = (await git.revparse(['--abbrev-ref', 'HEAD'])).trim()
      if (!targetBranch || targetBranch === 'HEAD') throw new Error('Repository is in detached HEAD state')
      await git.checkout(targetBranch)
      try {
        await git.merge([job.branch, '--no-ff', '-m', `Merge ${job.branch} into ${targetBranch}`])
      } catch (mergeError) {
        await git.merge(['--abort']).catch(() => undefined)
        throw mergeError
      }
      // Clean up worktree
      try {
        await git.raw(['worktree', 'remove', '--force', job.worktree])
        await git.deleteLocalBranch(job.branch, true)
      } catch { /* ignore cleanup failures */ }
    }
  } catch (e: any) {
    const message = e?.message || 'Git merge failed'
    console.warn('Merge failed:', message)
    addActivity({ id: genId(), jobId: taskId, type: 'merge_failed', message })
    emit('state-changed')
    return { success: false, error: message }
  }

  updateJob(taskId, { status: 'done', branch: null, worktree: null, completed_at: new Date().toLocaleTimeString() })
  addActivity({ id: genId(), jobId: taskId, type: 'pr_merged', message: `PR #${job.pr_number} merged into main` })
  emit('state-changed')
  return { success: true }
})

// ─── IPC: Discard Task ───────────────────────────────────────────────────────
ipcMain.handle('discard-task', async (_e, taskId: string) => {
  const job = getJob(taskId)
  if (!job) return { error: 'Not found' }

  try {
    if (job.worktree && job.branch) {
      const repoRoot = (await simpleGit(job.worktree).revparse(['--show-toplevel'])).trim()
      const git: SimpleGit = simpleGit(repoRoot)
      await git.raw(['worktree', 'remove', '--force', job.worktree])
      await git.deleteLocalBranch(job.branch, true)
    }
  } catch (e) {
    console.warn('Discard cleanup failed:', e)
  }

  updateJob(taskId, { status: 'planned', branch: null, worktree: null, diff: null, pr_number: null })
  addActivity({ id: genId(), jobId: taskId, type: 'agent_stopped', message: 'Worktree discarded' })
  emit('state-changed')
  return { success: true }
})

// ─── IPC: Preview Server (Phase I: Review Loop) ────────────────────────────────
ipcMain.handle('start-preview-server', (_e, taskId: string) => {
  const job = getJob(taskId)
  if (!job || !job.worktree) return { error: 'No worktree found' }

  // Check if already running
  if (previewServers.has(taskId)) {
    return { port: previewServers.get(taskId)!.port, alreadyRunning: true }
  }

  // Kill any existing preview server for this task
  const existing = previewServers.get(taskId)
  if (existing) {
    existing.proc.kill()
    previewServers.delete(taskId)
  }

  // Find an available port starting from 3000
  let port = 3000
  const proc = childSpawn('npm', ['run', 'dev'], {
    cwd: job.worktree,
    stdio: 'pipe',
    shell: true,
    env: { ...(process.env as Record<string, string>), PORT: String(port) },
  })

  let output = ''
  proc.stdout?.on('data', (data) => {
    const str = data.toString()
    output += str
    // Look for "Listening on" or port info
    const portMatch = str.match(/port\s+(\d+)/i) || str.match(/Listening on\s+.*:(\d+)/i)
    if (portMatch && !previewServers.has(taskId)) {
      port = parseInt(portMatch[1])
      previewServers.set(taskId, { proc, port, taskId })
      emit('preview-ready', taskId, port, output)
    }
  })

  proc.stderr?.on('data', (data) => {
    output += data.toString()
  })

  // Timeout if no port found after 10s
  setTimeout(() => {
    if (!previewServers.has(taskId)) {
      previewServers.set(taskId, { proc, port, taskId })
      emit('preview-ready', taskId, port, output)
    }
  }, 10000)

  return { port, starting: true }
})

ipcMain.handle('stop-preview-server', (_e, taskId: string) => {
  const existing = previewServers.get(taskId)
  if (existing) {
    existing.proc.kill()
    previewServers.delete(taskId)
  }
  return { success: true }
})

// ─── IPC: MCP Servers ─────────────────────────────────────────────────────────
ipcMain.handle('get-mcp-servers', () => getMcpServers())
ipcMain.handle('get-capability-registry', () => getCapabilityRegistry())
ipcMain.handle('test-mcp-server-connection', async (_e, server: any) => testMcpServerConnection(server))
ipcMain.handle('add-mcp-server', (_e, server: any) => {
  const id = genId()
  addMcpServer({ ...server, id })
  return getMcpServers()
})
ipcMain.handle('update-mcp-server', (_e, id: string, fields: Record<string, any>) => {
  updateMcpServer(id, fields)
  return getMcpServers()
})
ipcMain.handle('delete-mcp-server', (_e, id: string) => {
  deleteMcpServer(id)
  return getMcpServers()
})

// ─── IPC: Credentials ─────────────────────────────────────────────────────────
ipcMain.handle('get-credentials', () => getCredentials())
ipcMain.handle('add-credential', (_e, cred: { agent: string; label: string; secret: string }) => {
  const id = genId()
  // Store secret encrypted
  if (safeStorage.isEncryptionAvailable()) {
    const encrypted = safeStorage.encryptString(cred.secret)
    // In production: write to a secure store keyed by id
    console.log(`Stored encrypted credential for ${cred.agent}:${cred.label} (${encrypted.length} bytes)`)
  }
  addCredential({ id, agent: cred.agent, label: cred.label })
  return getCredentials()
})
ipcMain.handle('delete-credential', (_e, id: string) => {
  deleteCredential(id)
  return getCredentials()
})

// ─── IPC: Skills ─────────────────────────────────────────────────────────────
ipcMain.handle('get-skills', () => getSkills())
ipcMain.handle('add-skill', (_e, skill: { name: string; content: string }) => {
  const id = genId()
  addSkill({ id, ...skill })
  return getSkills()
})
ipcMain.handle('update-skill', (_e, id: string, fields: Record<string, any>) => {
  updateSkill(id, fields)
  return getSkills()
})
ipcMain.handle('delete-skill', (_e, id: string) => {
  deleteSkill(id)
  return getSkills()
})

// ─── IPC: Plugins ──────────────────────────────────────────────────────────────
ipcMain.handle('get-plugins', () => getPlugins())
ipcMain.handle('add-plugin', (_e, plugin: any) => {
  const id = genId()
  addPlugin({ ...plugin, id })
  return getPlugins()
})
ipcMain.handle('update-plugin', (_e, id: string, fields: Record<string, any>) => {
  updatePlugin(id, fields)
  return getPlugins()
})
ipcMain.handle('delete-plugin', (_e, id: string) => {
  deletePlugin(id)
  return getPlugins()
})
ipcMain.handle('toggle-plugin', (_e, id: string, enabled: boolean) => {
  togglePlugin(id, enabled)
  return getPlugins()
})

ipcMain.handle('open-external', (_e, url: string) => {
  if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
    shell.openExternal(url)
  }
  return { success: true }
})

// ─── IPC: Settings ─────────────────────────────────────────────────────────────
ipcMain.handle('get-settings', () => getSettings())
ipcMain.handle('set-setting', (_e, key: string, value: string) => {
  setSetting(key, value)
  return getSettings()
})

// ─── IPC: Projects ───────────────────────────────────────────────────────────────
ipcMain.handle('show-open-dialog', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(win!, {
    properties: ['openDirectory'],
  })
  return { canceled, filePaths }
})
ipcMain.handle('get-projects', () => getProjects())
ipcMain.handle('get-project', (_e, id: string) => getProject(id))
ipcMain.handle('add-project', async (_e, project: { name: string; path: string; gitRemote?: string }) => {
  const projectPath = project.path.trim()
  const remote = project.gitRemote?.trim() || ''
  if (!project.name.trim() || !projectPath) return { error: 'Project name and folder are required' }
  try {
    if (remote && !existsSync(projectPath)) {
      await simpleGit().clone(remote, projectPath)
    } else if (remote && existsSync(projectPath) && statSync(projectPath).isDirectory()) {
      const entries = readdirSync(projectPath)
      if (entries.length === 0) await simpleGit().clone(remote, projectPath)
      else if (!existsSync(join(projectPath, '.git'))) return { error: 'Destination folder is not empty and is not a Git repository' }
    }
  } catch (error: any) {
    return { error: `Git clone failed: ${error?.message || 'check the URL and access rights'}` }
  }
  if (!existsSync(projectPath) || !statSync(projectPath).isDirectory()) {
    return { error: 'Project folder does not exist' }
  }
  const id = genId()
  addProject({ ...project, id, path: projectPath, gitRemote: remote })
  return getProjects()
})
ipcMain.handle('delete-project', (_e, id: string) => {
  deleteProject(id)
  return getProjects()
})
ipcMain.handle('set-active-project', (_e, id: string) => {
  setActiveProject(id)
  return getProjects()
})

// ─── IPC: Runtime ticker ─────────────────────────────────────────────────────────
// Sends lightweight runtime-tick instead of full state-changed to prevent full re-renders every second
setInterval(() => {
  if (activeJobs.size === 0) return
  const runtimes: Record<string, number> = {}
  for (const [taskId] of activeJobs.entries()) {
    const job = getJob(taskId)
    if (job && job.status === 'working') {
      const newRuntime = (job.runtime || 0) + 1
      updateJob(taskId, { runtime: newRuntime })
      runtimes[taskId] = newRuntime
    }
  }
  if (Object.keys(runtimes).length > 0) {
    // Send a targeted tick — renderer patches in-place, no full reload
    emit('runtime-tick', runtimes)
  }
}, 1000)

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
import { spawn as childSpawn, execSync } from 'child_process'

import { createDriver } from './drivers.js'
import type { BaseDriver } from './drivers.js'
import { writeAgentMcpConfig } from './mcp.js'
import { getSetupCompleted, refreshToolStatuses, runToolAction, saveToolSecret, setSetupCompleted, getToolStatusSnapshots, getToolSecretPlaintext, writeToolSessionInput, killToolSession, toolSupportsAuth, TOOL_IDS, TOOL_DEFINITIONS } from './tool-setup.js'
import { composePromptForDriver, syncCapabilitiesForDriver } from './capabilities.js'
import { getCapabilityRegistry, testMcpServerConnection } from './capabilities.js'
import {
  commitAndDiff,
  createIsolatedWorktree,
  genId,
  isGitRepo,
  listLocalBranches,
  mergeWorktreeIntoHead,
  removeWorktree,
} from './workspace.js'
import {
  getDb, seedDefaultData, purgeDemoData,
  createJob, getJobs, getJob, updateJob, deleteJob, nextReviewNumber,
  addActivity, getActivities,
  addTerminalLine, getTerminalLines,
  upsertWorker, removeWorker, getWorkers,
  getMcpServers, addMcpServer, updateMcpServer, deleteMcpServer,
  getCredentials, addCredential, deleteCredential, getCredentialSecrets,
  getSkills, addSkill, updateSkill, deleteSkill,
  getSettings, setSetting,
  getPlugins, addPlugin, updatePlugin, deletePlugin, togglePlugin,
  getProjects, getProject, addProject, deleteProject, setActiveProject,
  recordDriverQuotaError, getDriverQuotaErrors, recordTaskOutcome, getDriverSuccessRate,
  getHooks, addHook, updateHook, deleteHook,
} from './db.js'
import { runHookCommand } from './capabilities.js'

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
  worktree?: string
  branch?: string
}
const activeJobs = new Map<string, ActiveJob>()
const activeToolSessions = new Map<string, { toolId: string; kind: 'install' | 'auth' | 'terminal'; sessionId: string }>()

/** Preview server tracking (Phase I: Review Loop) */
const previewServers = new Map<string, { proc: ChildProcess; port: number; taskId: string }>()

// ─── Window ──────────────────────────────────────────────────────────────────
function createWindow() {
  const publicDir = process.env.VITE_PUBLIC || join(process.env.APP_ROOT || '', 'public')
  const buildDir = join(process.env.APP_ROOT || '', 'build')
  const iconCandidate = existsSync(join(publicDir, 'icon.png'))
    ? join(publicDir, 'icon.png')
    : existsSync(join(buildDir, 'icon.png'))
    ? join(buildDir, 'icon.png')
    : undefined

  win = new BrowserWindow({
    title: 'Robent — Agent Orchestration',
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 700,
    icon: iconCandidate,
    show: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, 'preload.mjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  win.show()
  win.focus()

  win.once('ready-to-show', () => {
    win?.show()
    win?.focus()
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
    // win.webContents.openDevTools()
  } else {
    win.loadFile(join(RENDERER_DIST, 'index.html'))
  }
}

const gotSingleInstanceLock = app.requestSingleInstanceLock()
if (!gotSingleInstanceLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (win) {
      if (win.isMinimized()) win.restore()
      win.focus()
    }
  })

  const cleanupPreviewServers = () => {
    for (const [, server] of previewServers.entries()) {
      if (process.platform === 'win32' && server.proc.pid) {
        try {
          execSync(`taskkill /PID ${server.proc.pid} /T /F`, { stdio: 'ignore' })
        } catch {
          /* ignore */
        }
      }
      try {
        server.proc.kill()
      } catch {
        /* ignore */
      }
    }
    previewServers.clear()
  }

  app.on('before-quit', cleanupPreviewServers)
  app.on('window-all-closed', () => {
    cleanupPreviewServers()
    if (process.platform !== 'darwin') { app.quit(); win = null }
  })
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })

  app.whenReady().then(() => {
    // Initialize DB and seed
    try {
      const db = getDb()
      purgeDemoData()
      seedDefaultData()
      // Reset any orphaned working tasks, workers, and stuck blocked states from previous app sessions
      db.prepare(`DELETE FROM workers`).run()
      db.prepare(`UPDATE jobs SET status = 'planned' WHERE status = 'working'`).run()
      db.prepare(`UPDATE jobs SET is_blocked = 0, blocked_reason = NULL, sub_status = NULL WHERE is_blocked = 1`).run()
      refreshToolStatuses().catch((error) => console.error('Tool status refresh failed:', error))
    } catch (e) {
      console.error('DB init error:', e)
    }
    createWindow()
  })
}

// ─── Helper ───────────────────────────────────────────────────────────────────
function emit(channel: string, ...args: any[]) {
  win?.webContents.send(channel, ...args)
}

function toolSetupCompleted(): boolean {
  return getSetupCompleted()
}

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

function parseSkillIds(job: any): string[] | undefined {
  if (!job?.skill_ids) return undefined
  const ids = parseJsonArray(job.skill_ids)
  return ids.length > 0 ? ids : undefined
}

function buildAgentEnv(agent: string): Record<string, string> {
  const env: Record<string, string> = {}
  const normalized = agent.toLowerCase().replace(/\s+/g, '-')

  for (const cred of getCredentialSecrets()) {
    try {
      const encryptedBytes = Buffer.from(cred.secret_encrypted, 'base64')
      const secret = safeStorage.isEncryptionAvailable()
        ? safeStorage.decryptString(encryptedBytes)
        : encryptedBytes.toString('utf8')
      if (!secret) continue
      const label = cred.label.toUpperCase().replace(/[^A-Z0-9]+/g, '_')
      env[label] = secret
      if (label.includes('OPENAI') || label.includes('CODEX')) env.OPENAI_API_KEY = secret
      if (label.includes('ANTHROPIC') || label.includes('CLAUDE')) env.ANTHROPIC_API_KEY = secret
      if (label.includes('AIDER')) env.AIDER_API_KEY = secret
      if (label.includes('GITHUB')) env.GITHUB_TOKEN = secret
      if (label.includes('GEMINI') || label.includes('GOOGLE')) {
        env.GEMINI_API_KEY = secret
        env.GOOGLE_API_KEY = env.GOOGLE_API_KEY || secret
      }
      if (label.includes('DEEPSEEK')) env.DEEPSEEK_API_KEY = secret
      if (label.includes('OPENROUTER')) env.OPENROUTER_API_KEY = secret
      if (label.includes('GROQ')) env.GROQ_API_KEY = secret
      if (label.includes('MISTRAL')) env.MISTRAL_API_KEY = secret
      if (label.includes('XAI')) env.XAI_API_KEY = secret
      if (label.includes('COHERE')) env.COHERE_API_KEY = secret
    } catch (error) {
      console.warn('Failed to decrypt credential:', error)
    }
  }

  if (normalized.includes('aider')) {
    const aiderSecret = getToolSecretPlaintext('aider')
    if (aiderSecret) {
      env.AIDER_API_KEY = aiderSecret
      env.OPENAI_API_KEY = env.OPENAI_API_KEY || aiderSecret
      env.ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY || aiderSecret
    }
  }

  return env
}

async function runEnabledPlugins(workdir: string, taskId: string): Promise<{ ok: boolean; failedTests: string[]; summary: string }> {
  const plugins = getPlugins().filter((row: any) => (row.enabled ?? row.is_enabled ?? 1) === 1 && row.command)
  if (plugins.length === 0) {
    return { ok: true, failedTests: [], summary: 'No enabled plugins' }
  }

  const failedTests: string[] = []
  for (const plugin of plugins) {
    const args = parseJsonArray(plugin.args)
    const env = parseJsonObject(plugin.env)
    try {
      const result = await new Promise<{ code: number; output: string }>((resolve) => {
        const proc = childSpawn(plugin.command, args, {
          cwd: workdir,
          shell: true,
          env: { ...(process.env as Record<string, string>), ...env },
        })
        let output = ''
        proc.stdout?.on('data', (data) => { output += data.toString() })
        proc.stderr?.on('data', (data) => { output += data.toString() })
        proc.on('close', (code) => resolve({ code: code ?? 1, output }))
        proc.on('error', (error) => resolve({ code: 1, output: error.message }))
      })
      const missing = /not recognized|command not found|ENOENT/i.test(result.output)
      if (missing) {
        addActivity({ id: genId(), jobId: taskId, type: 'plugin_skipped', message: `${plugin.name} skipped (command unavailable)` })
        continue
      }
      if (result.code !== 0) {
        failedTests.push(`${plugin.name}: ${result.output.trim().slice(0, 160) || 'failed'}`)
      }
      addActivity({
        id: genId(),
        jobId: taskId,
        type: result.code === 0 ? 'plugin_passed' : 'plugin_failed',
        message: `${plugin.name} ${result.code === 0 ? 'passed' : 'failed'}`,
      })
    } catch (error: any) {
      failedTests.push(`${plugin.name}: ${error?.message || 'failed'}`)
    }
  }

  return {
    ok: failedTests.length === 0,
    failedTests,
    summary: failedTests.length === 0 ? 'All enabled plugins passed' : `${failedTests.length} plugin(s) failed`,
  }
}

async function finalizeTaskRun(
  taskId: string,
  agent: string,
  actualWorkdir: string,
  branchName: string,
  result: { status: 'success' | 'failed'; summary: string; tokenCount?: number; cost?: number },
) {
  const job = getJob(taskId)
  if (!job) return

  let diffText = ''
  let changes = 0
  const shouldCommit = Boolean(job.worktree || branchName)
  if (shouldCommit) {
    try {
      const commit = await commitAndDiff(actualWorkdir, `feat(${taskId}): ${job.title}`)
      diffText = commit.diff
      changes = commit.changes
      if (changes > 0) {
        addActivity({ id: genId(), jobId: taskId, type: 'git_committed', message: `Committed worktree changes to ${branchName}` })
      }
    } catch (error) {
      console.warn('Git commit/diff failed:', error)
    }
  }

  const pluginResult = await runEnabledPlugins(actualWorkdir, taskId)
  const ciStatus = result.status === 'success' && pluginResult.ok ? 'passing' : 'failed'
  const reviewNumber = nextReviewNumber()

  recordTaskOutcome(agent, job.title, ciStatus === 'passing')
  if (result.status === 'failed' && /rate limit|quota|429|exceeded|too many requests/i.test(result.summary)) {
    recordDriverQuotaError(agent)
  }

  updateJob(taskId, {
    status: 'review',
    diff: diffText,
    changes,
    token_count: result.tokenCount || 0,
    estimated_cost: result.cost || 0,
    pr_number: reviewNumber,
    ci_status: ciStatus,
    failed_tests: pluginResult.failedTests.length > 0 ? JSON.stringify(pluginResult.failedTests) : null,
    sub_status: ciStatus === 'failed' ? pluginResult.summary : null,
    completed_at: new Date().toLocaleTimeString(),
  })
  removeWorker(taskId)
  addActivity({
    id: genId(),
    jobId: taskId,
    type: ciStatus === 'passing' ? 'ci_passed' : 'ci_failed',
    message: `${agent} finished: ${result.summary}${pluginResult.ok ? '' : ` — ${pluginResult.summary}`}`,
  })
  emit('state-changed')
  emit('task-done', taskId, { ...result, ciStatus, reviewNumber })
}

async function startAgentRun(
  event: Electron.IpcMainInvokeEvent,
  taskId: string,
  agent: string,
  workdir: string,
  options: { feedback?: string; reuseWorktree?: boolean } = {},
) {
  const job = getJob(taskId)
  if (!job) return { error: 'Job not found' }

  const jobRunId = genId()
  const branchName = options.reuseWorktree && job.branch
    ? job.branch
    : `agent/${taskId.toLowerCase()}-${jobRunId}`
  let actualWorkdir = workdir
  let usedWorktree = false

  if (options.reuseWorktree && job.worktree) {
    actualWorkdir = job.worktree
    usedWorktree = true
  } else if (await isGitRepo(workdir)) {
    try {
      const created = await createIsolatedWorktree(workdir, branchName, jobRunId)
      actualWorkdir = created.workdir
      usedWorktree = true
    } catch (error) {
      console.warn('Worktree creation failed, using original workdir:', error)
    }
  }

  const mcpConfigPath = writeAgentMcpConfig(agent, actualWorkdir)
  if (mcpConfigPath) {
    addActivity({ id: genId(), jobId: taskId, type: 'mcp_configured', message: `MCP config written: ${mcpConfigPath}` })
  }

  const skillIds = parseSkillIds(job)
  const capabilitySync = syncCapabilitiesForDriver(agent, actualWorkdir, { skillIds })
  if (!capabilitySync.ok) {
    updateJob(taskId, { sub_status: `Capability sync failed for ${agent}` })
    addActivity({ id: genId(), jobId: taskId, type: 'capability_sync_failed', message: capabilitySync.error || `Capability sync failed for ${agent}` })
  } else {
    for (const log of capabilitySync.logs) {
      addActivity({ id: genId(), jobId: taskId, type: 'capability_sync', message: log })
    }
  }

  updateJob(taskId, {
    status: 'working',
    branch: usedWorktree ? branchName : null,
    worktree: usedWorktree ? actualWorkdir : null,
    started_at: new Date().toLocaleTimeString(),
    runtime: 0,
    ci_status: 'pending',
    pr_number: null,
    failed_tests: null,
    sub_status: options.feedback ? 'Retry requested' : null,
  })
  upsertWorker({ id: `worker-${taskId}`, jobId: taskId, agent, status: 'running', runtime: 0 })
  addActivity({ id: genId(), jobId: taskId, type: 'agent_started', message: `${agent} started on ${job.title}` })
  if (usedWorktree) {
    addActivity({ id: genId(), jobId: taskId, type: 'worktree_created', message: `Worktree: ${actualWorkdir}` })
  }
  emit('state-changed')

  // Run Coordinator Pre-Task Hooks
  const enabledHooks = (getHooks() || []).filter(
    (h: any) => h.enabled === 1 && (h.scope === 'global' || h.scope.toLowerCase() === agent.toLowerCase().replace(/\s+/g, '-')),
  )
  const preTaskHooks = enabledHooks.filter((h: any) => h.event === 'pre-task')
  for (const hook of preTaskHooks) {
    addActivity({ id: genId(), jobId: taskId, type: 'hook_started', message: `Running pre-task hook: ${hook.name}` })
    addTerminalLine({ id: genId(), jobId: taskId, type: 'output', content: `\r\n[Hook] Running pre-task hook "${hook.name}": $ ${hook.command}\r\n`, agent })
    const hookResult = await runHookCommand(hook.command, actualWorkdir)
    addTerminalLine({ id: genId(), jobId: taskId, type: 'output', content: `${hookResult.output}\r\n`, agent })
  }

  const driver = createDriver(agent)
  const basePrompt = composePromptForDriver(agent, job.description, { skillIds })
  const prompt = options.feedback
    ? `${basePrompt}\n\n## Review Feedback\nThe previous attempt failed checks or review. Fix the issues below and complete the task.\n\n${options.feedback}`
    : basePrompt

  const settings = getSettings()
  const timeoutMinutes = Number.parseInt(settings.defaultTimeout || '30', 10)
  const timeoutMs = Number.isFinite(timeoutMinutes) && timeoutMinutes > 0 ? timeoutMinutes * 60_000 : 30 * 60_000

  // Model selection override based on task size / complexity
  const selectedModel = job.description.toLowerCase().includes('unit-test') || job.description.toLowerCase().includes('small')
    ? 'gpt-4o-mini'
    : 'claude-3-7-sonnet'

  if (agent === 'OpenCode' || agent === 'Aider') {
    addActivity({ id: genId(), jobId: taskId, type: 'model_selected', message: `${agent} model selected: ${selectedModel}` })
  }

  const { jobId: runId, promise } = driver.run(
    prompt,
    actualWorkdir,
    (chunk) => {
      try {
        event.sender.send('task-output', taskId, chunk)
      } catch {
        /* sender may have been closed/navigated */
      }
      emit('task-output', taskId, chunk)
      addTerminalLine({ id: genId(), jobId: taskId, type: 'output', content: chunk, agent })

      // Per-command approval pattern detection
      if (/\[y\/n\]|Approve\s*command:|Run\s*shell\s*command\?|Allow\s*execution\?/i.test(chunk)) {
        const promptId = genId()
        const cmdMatch = chunk.match(/(?:`|\$|command:)\s*([^\r\n`]+)/i)
        const command = cmdMatch ? cmdMatch[1].trim() : 'CLI Command Execution'
        try {
          event.sender.send('command-approval-requested', { taskId, promptId, command })
        } catch {
          /* ignore */
        }
        emit('command-approval-requested', { taskId, promptId, command })
      }
    },
    buildAgentEnv(agent),
    timeoutMs,
    {
      model: selectedModel,
      approvalMode: settings.approvalMode === 'true' || settings.approvalMode === '1',
    },
  )

  activeJobs.set(taskId, {
    driver,
    jobId: runId,
    worktree: usedWorktree ? actualWorkdir : undefined,
    branch: usedWorktree ? branchName : undefined,
  })

  promise.then(async (result) => {
    activeJobs.delete(taskId)
    await finalizeTaskRun(taskId, agent, actualWorkdir, branchName, result)

    // Run Post-Task or On-Failure Hooks
    const hooksToRun = enabledHooks.filter((h: any) =>
      result.status === 'success' ? h.event === 'post-task' : h.event === 'on-failure',
    )
    for (const hook of hooksToRun) {
      addActivity({ id: genId(), jobId: taskId, type: 'hook_started', message: `Running ${hook.event} hook: ${hook.name}` })
      addTerminalLine({ id: genId(), jobId: taskId, type: 'output', content: `\r\n[Hook] Running ${hook.event} hook "${hook.name}": $ ${hook.command}\r\n`, agent })
      const hookResult = await runHookCommand(hook.command, actualWorkdir)
      addTerminalLine({ id: genId(), jobId: taskId, type: 'output', content: `${hookResult.output}\r\n`, agent })
    }
  }).catch(async (error) => {
    activeJobs.delete(taskId)
    console.error('Task run failed:', error)
    updateJob(taskId, { status: 'planned', sub_status: `Driver error: ${error?.message || 'unknown'}` })
    removeWorker(taskId)
    emit('state-changed')
    const failureHooks = enabledHooks.filter((h: any) => h.event === 'on-failure')
    for (const hook of failureHooks) {
      await runHookCommand(hook.command, actualWorkdir)
    }
  })

  return { success: true, runId }
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

ipcMain.handle('delete-job', (_e, id: string) => {
  const job = getJob(id)
  if (!job) return { success: false, error: 'Job not found' }
  deleteJob(id)
  addActivity({ id: genId(), type: 'task_deleted', message: `Task deleted — ${job.title}` })
  return { success: true }
})

ipcMain.handle('get-activities', () => getActivities(100))
ipcMain.handle('get-workers', () => getWorkers())

ipcMain.handle('get-terminal-lines', (_e, jobId: string) => getTerminalLines(jobId))
ipcMain.handle('send-task-input', (_e, { taskId, data }: { taskId: string; data: string }) => {
  const active = activeJobs.get(taskId)
  if (active) {
    return active.driver.write(data)
  }
  return false
})

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
ipcMain.handle('run-tool-action', async (event, payload: { toolId: string; kind: 'install' | 'auth' | 'terminal'; secret?: string }) => {
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

ipcMain.handle('write-tool-input', (_e, payload: { sessionId: string; data: string }) => {
  return { ok: writeToolSessionInput(payload.sessionId, payload.data) }
})

ipcMain.handle('kill-tool-session', (_e, sessionId: string) => {
  const killed = killToolSession(sessionId)
  if (killed) activeToolSessions.delete(sessionId)
  return { ok: killed }
})

ipcMain.handle('get-tool-auth-capabilities', () => {
  return TOOL_IDS.map((toolId) => {
    const def = TOOL_DEFINITIONS[toolId]
    return {
      toolId,
      name: def.name,
      binary: def.binary,
      supportsAuth: toolSupportsAuth(toolId),
      authCommand: def.authCommand
        ? [def.authCommand, ...(def.authArgs || [])].join(' ')
        : toolId === 'aider'
          ? 'API key (saved securely)'
          : null,
    }
  })
})

function selectDriverForSubtask(
  subtaskTag: string,
  mode: 'auto' | 'custom',
  customPool: string[] = [],
  availableTools: any[],
): { agent: string; rationale: string; blocked?: boolean; reason?: string } {
  const toolToAgentMap: Record<string, string> = {
    'claude-code': 'Claude Code',
    'codex': 'Codex',
    'opencode': 'OpenCode',
    'antigravity': 'Antigravity',
    'aider': 'Aider',
  }
  const agentToToolMap: Record<string, string> = {
    'Claude Code': 'claude-code',
    'Codex': 'codex',
    'OpenCode': 'opencode',
    'Antigravity': 'antigravity',
    'Aider': 'aider',
  }

  const capabilityFit: Record<string, string[]> = {
    'claude-code': ['refactor', 'multi-file', 'architecture', 'planning', 'core', 'ui', 'frontend', 'general'],
    'codex': ['function', 'boilerplate', 'unit-test', 'small', 'tests', 'core'],
    'antigravity': ['ui', 'browser', 'frontend', 'visual', 'verification'],
    'aider': ['diff', 'tight-scope', 'quick-fix', 'patch', 'edit'],
    'opencode': ['general', 'general-purpose', 'fallback', 'script', 'core', 'ui', 'frontend', 'unit-test', 'tests', 'refactor', 'backend', 'full-stack', 'tracking', 'system'],
  }

  const rationales: Record<string, string> = {
    'claude-code': 'Claude Code: architecture & multi-file reasoning, strong quota headroom',
    'codex': 'Codex: small isolated function & unit tests, fast/cheap fit',
    'antigravity': 'Antigravity: browser and UI component verification',
    'aider': 'Aider: tight-scope diffs and quick patches',
    'opencode': 'OpenCode: general-purpose full-stack execution',
  }

  const readyToolSnapshots = availableTools.filter((t) => t.available)
  const candidateSnapshots = readyToolSnapshots.length > 0 ? readyToolSnapshots : availableTools

  let eligibleSnapshots = candidateSnapshots

  if (mode === 'custom') {
    if (!customPool || customPool.length === 0) {
      return { agent: candidateSnapshots[0]?.name || 'Claude Code', rationale: 'No selected tool fits this subtask', blocked: true, reason: 'No selected tool fits this subtask' }
    }
    const poolToolIds = customPool.map((agentName) => agentToToolMap[agentName]).filter(Boolean)
    eligibleSnapshots = candidateSnapshots.filter((t) => poolToolIds.includes(t.toolId))

    if (eligibleSnapshots.length === 0) {
      return { agent: customPool[0] || 'Claude Code', rationale: 'No selected tool fits this subtask', blocked: true, reason: 'No selected tool fits this subtask' }
    }
  }

  // Credit / Quota filter: if a tool has 3+ recent quota errors, deprioritize or exclude it if others exist
  const unexhausted = eligibleSnapshots.filter((tool) => getDriverQuotaErrors(tool.toolId) < 3)
  const candidatePool = unexhausted.length > 0 ? unexhausted : eligibleSnapshots

  const scored = candidatePool.map((tool) => {
    let score = 0
    const fits = capabilityFit[tool.toolId] || []
    const tagLower = (subtaskTag || '').toLowerCase()
    const fitMatch = fits.some((kw) => {
      try {
        const re = new RegExp(`\\b${kw.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i')
        return re.test(tagLower)
      } catch {
        return tagLower.includes(kw)
      }
    })
    if (fitMatch) score += 50
    else score += 10

    const errorCount = getDriverQuotaErrors(tool.toolId)
    score -= errorCount * 15

    const successRate = getDriverSuccessRate(tool.toolId, subtaskTag)
    score += Math.round(successRate * 30)

    return { tool, agentName: toolToAgentMap[tool.toolId] || tool.name, score, fitMatch }
  })

  scored.sort((a, b) => b.score - a.score)
  const best = scored[0]

  return {
    agent: best.agentName,
    rationale: rationales[best.tool.toolId] || `${best.agentName}: optimal capability fit`,
  }
}

// ─── IPC: Plan Task ────────────────────────────────────────────────────────────
ipcMain.handle('plan-task', async (_e, { description, mode, customPool }: { description: string; mode?: 'auto' | 'custom'; customPool?: string[] }) => {
  const availableTools = getToolStatusSnapshots()
  const modeVal = mode || 'auto'
  const poolVal = customPool || []

  // Define phases with capability tags and dependency modes
  const words = (description || 'Task').split(' ').slice(0, 4).join(' ')
  const phases = [
    { tag: 'core', title: `${words} — Core`, desc: `Phase 1 — Core logic & architecture: ${description}`, dep: 'parallel' as const },
    { tag: 'ui', title: `${words} — UI`, desc: `Phase 2 — UI components & layout: ${description}`, dep: 'parallel' as const },
    { tag: 'unit-test', title: `${words} — Tests`, desc: `Phase 3 — Unit tests & verification: ${description}`, dep: 'sequential' as const },
  ]

  const subtasks = phases.map((p) => {
    const selection = selectDriverForSubtask(p.tag + ' ' + description, modeVal, poolVal, availableTools)
    return {
      id: genId(),
      title: p.title,
      description: p.desc,
      capabilityTag: p.tag,
      assignedAgent: selection.agent,
      rationale: selection.rationale,
      dependencyMode: p.dep,
      status: selection.blocked ? 'blocked' : 'planned',
      blockedReason: selection.reason,
    }
  })

  return subtasks
})

// ─── IPC: Run Task ────────────────────────────────────────────────────────────
ipcMain.handle('run-task', async (event, { taskId, agent, workdir }: { taskId: string; agent: string; workdir: string }) => {
  if (activeJobs.has(taskId)) return { error: 'Task is already running' }

  const job = getJob(taskId)
  if (!job) return { error: 'Job not found' }

  const mode = (job.execution_mode || 'auto') as 'auto' | 'custom'
  const customPool = parseJsonArray(job.custom_agent_pool)
  const availableTools = getToolStatusSnapshots()

  const selection = selectDriverForSubtask(job.title + ' ' + job.description, mode, customPool, availableTools)

  if (selection.blocked) {
    updateJob(taskId, {
      is_blocked: 1,
      blocked_reason: selection.reason || 'No selected tool fits this subtask',
      sub_status: selection.reason || 'No selected tool fits this subtask',
    })
    emit('state-changed')
    return { error: selection.reason || 'No selected tool fits this subtask' }
  }

  updateJob(taskId, { is_blocked: 0, blocked_reason: null })
  const chosenAgent = selection.agent || agent

  return startAgentRun(event, taskId, chosenAgent, workdir)
})

ipcMain.handle('set-task-execution-mode', (_e, { taskId, mode }: { taskId: string; mode: string }) => {
  const job = getJob(taskId)
  if (!job) return null
  const customPool = parseJsonArray(job.custom_agent_pool)
  const availableTools = getToolStatusSnapshots()
  const modeVal = (mode || 'auto') as 'auto' | 'custom'

  const description = job.description || job.title
  const words = (description || 'Task').split(' ').slice(0, 4).join(' ')
  const phases = [
    { tag: 'core', title: `${words} — Core`, desc: `Phase 1 — Core logic & architecture: ${description}`, dep: 'parallel' as const },
    { tag: 'ui', title: `${words} — UI`, desc: `Phase 2 — UI components & layout: ${description}`, dep: 'parallel' as const },
    { tag: 'unit-test', title: `${words} — Tests`, desc: `Phase 3 — Unit tests & verification: ${description}`, dep: 'sequential' as const },
  ]

  const subtasks = phases.map((p) => {
    const selection = selectDriverForSubtask(p.tag + ' ' + description, modeVal, customPool, availableTools)
    return {
      id: genId(),
      title: p.title,
      description: p.desc,
      capabilityTag: p.tag,
      assignedAgent: selection.agent,
      rationale: selection.rationale,
      dependencyMode: p.dep,
      status: selection.blocked ? 'blocked' : 'planned',
      blockedReason: selection.reason,
    }
  })

  updateJob(taskId, { execution_mode: mode, subtasks: JSON.stringify(subtasks) })
  emit('state-changed')
  return getJob(taskId)
})

ipcMain.handle('set-task-custom-pool', (_e, { taskId, pool }: { taskId: string; pool: string[] }) => {
  const job = getJob(taskId)
  if (!job) return null
  const modeVal = (job.execution_mode || 'custom') as 'auto' | 'custom'
  const availableTools = getToolStatusSnapshots()

  const description = job.description || job.title
  const words = (description || 'Task').split(' ').slice(0, 4).join(' ')
  const phases = [
    { tag: 'core', title: `${words} — Core`, desc: `Phase 1 — Core logic & architecture: ${description}`, dep: 'parallel' as const },
    { tag: 'ui', title: `${words} — UI`, desc: `Phase 2 — UI components & layout: ${description}`, dep: 'parallel' as const },
    { tag: 'unit-test', title: `${words} — Tests`, desc: `Phase 3 — Unit tests & verification: ${description}`, dep: 'sequential' as const },
  ]

  const subtasks = phases.map((p) => {
    const selection = selectDriverForSubtask(p.tag + ' ' + description, modeVal, pool, availableTools)
    return {
      id: genId(),
      title: p.title,
      description: p.desc,
      capabilityTag: p.tag,
      assignedAgent: selection.agent,
      rationale: selection.rationale,
      dependencyMode: p.dep,
      status: selection.blocked ? 'blocked' : 'planned',
      blockedReason: selection.reason,
    }
  })

  updateJob(taskId, { custom_agent_pool: JSON.stringify(pool), subtasks: JSON.stringify(subtasks) })
  emit('state-changed')
  return getJob(taskId)
})

ipcMain.handle('retry-task', async (event, { taskId, feedback }: { taskId: string; feedback?: string }) => {
  if (activeJobs.has(taskId)) return { error: 'Task is already running' }
  const job = getJob(taskId)
  if (!job) return { error: 'Job not found' }
  const workdir = job.worktree || getProjects().find((p: any) => p.is_active === 1)?.path || '.'
  const notes = feedback
    || (job.failed_tests ? parseJsonArray(job.failed_tests).join('\n') : '')
    || job.sub_status
    || 'Previous attempt failed. Investigate and fix remaining issues.'
  return startAgentRun(event, taskId, job.agent, workdir, {
    feedback: notes,
    reuseWorktree: Boolean(job.worktree),
  })
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

// ─── IPC: Merge Task ──────────────────────────────────────────────────────────
ipcMain.handle('merge-task', async (_e, taskId: string) => {
  const job = getJob(taskId)
  if (!job) return { error: 'Not found' }

  try {
    if (job.worktree && job.branch) {
      await mergeWorktreeIntoHead(job.worktree, job.branch)
    }
  } catch (e: any) {
    const message = e?.message || 'Git merge failed'
    console.warn('Merge failed:', message)
    addActivity({ id: genId(), jobId: taskId, type: 'merge_failed', message })
    emit('state-changed')
    return { success: false, error: message }
  }

  updateJob(taskId, {
    status: 'done',
    branch: null,
    worktree: null,
    completed_at: new Date().toLocaleTimeString(),
  })
  addActivity({
    id: genId(),
    jobId: taskId,
    type: 'pr_merged',
    message: job.pr_number ? `Review #${job.pr_number} merged` : 'Worktree merged into current branch',
  })
  emit('state-changed')
  return { success: true }
})

// ─── IPC: Discard Task ───────────────────────────────────────────────────────
ipcMain.handle('discard-task', async (_e, taskId: string) => {
  const job = getJob(taskId)
  if (!job) return { error: 'Not found' }

  try {
    if (job.worktree) {
      await removeWorktree(job.worktree, job.branch)
    }
  } catch (e) {
    console.warn('Discard cleanup failed:', e)
  }

  updateJob(taskId, {
    status: 'planned',
    branch: null,
    worktree: null,
    diff: null,
    pr_number: null,
    ci_status: 'none',
    failed_tests: null,
    changes: 0,
  })
  addActivity({ id: genId(), jobId: taskId, type: 'agent_stopped', message: 'Worktree discarded' })
  emit('state-changed')
  return { success: true }
})

ipcMain.handle('create-worktree', async (_e, payload: { branchName: string; baseBranch?: string; workdir?: string }) => {
  const projects = getProjects()
  const active = projects.find((p: any) => p.is_active === 1) || projects[0]
  const workdir = payload.workdir || active?.path
  if (!workdir) return { error: 'No active project selected' }
  if (!payload.branchName?.trim()) return { error: 'Branch name is required' }
  if (!(await isGitRepo(workdir))) return { error: 'Active project is not a Git repository' }

  try {
    const created = await createIsolatedWorktree(
      workdir,
      payload.branchName.trim(),
      `manual-${genId()}`,
      payload.baseBranch || undefined,
    )
    addActivity({ id: genId(), type: 'worktree_created', message: `Manual worktree ${created.branch} at ${created.workdir}` })
    emit('state-changed')
    return { success: true, ...created }
  } catch (error: any) {
    return { error: error?.message || 'Failed to create worktree' }
  }
})

ipcMain.handle('list-branches', async (_e, workdir?: string) => {
  const projects = getProjects()
  const active = projects.find((p: any) => p.is_active === 1) || projects[0]
  const dir = workdir || active?.path
  if (!dir || !(await isGitRepo(dir))) return { current: '', all: [] }
  return listLocalBranches(dir)
})

// ─── IPC: Preview Server (Phase I: Review Loop) ────────────────────────────────
ipcMain.handle('start-preview-server', (_e, taskId: string) => {
  const job = getJob(taskId)
  if (!job || !job.worktree) return { error: 'No worktree found' }

  if (previewServers.has(taskId)) {
    return { port: previewServers.get(taskId)!.port, alreadyRunning: true }
  }

  let port = 3000 + (previewServers.size % 100)
  const proc = childSpawn('npm', ['run', 'dev', '--', '--port', String(port)], {
    cwd: job.worktree,
    stdio: 'pipe',
    shell: true,
    env: { ...(process.env as Record<string, string>), PORT: String(port) },
  })

  let output = ''
  const markReady = (resolvedPort: number) => {
    if (previewServers.has(taskId)) return
    previewServers.set(taskId, { proc, port: resolvedPort, taskId })
    emit('preview-ready', taskId, resolvedPort, output)
  }

  proc.stdout?.on('data', (data) => {
    const str = data.toString()
    output += str
    const portMatch = str.match(/(?:localhost|127\.0\.0\.1|0\.0\.0\.0):(\d+)/i)
      || str.match(/port\s+(\d+)/i)
      || str.match(/Listening on\s+.*:(\d+)/i)
    if (portMatch) markReady(parseInt(portMatch[1], 10))
  })

  proc.stderr?.on('data', (data) => {
    const str = data.toString()
    output += str
    const portMatch = str.match(/(?:localhost|127\.0\.0\.1|0\.0\.0\.0):(\d+)/i)
    if (portMatch) markReady(parseInt(portMatch[1], 10))
  })

  setTimeout(() => markReady(port), 10000)
  return { port, starting: true }
})

ipcMain.handle('stop-preview-server', (_e, taskId: string) => {
  const existing = previewServers.get(taskId)
  if (existing) {
    if (process.platform === 'win32' && existing.proc.pid) {
      try {
        execSync(`taskkill /PID ${existing.proc.pid} /T /F`, { stdio: 'ignore' })
      } catch {
        /* ignore if process already terminated */
      }
    }
    try {
      existing.proc.kill()
    } catch {
      /* ignore */
    }
    previewServers.delete(taskId)
  }
  return { success: true }
})

// ─── IPC: Plan Approval & Command Approval ────────────────────────────────────
ipcMain.handle('approve-plan', async (_e, taskId: string) => {
  updateJob(taskId, { plan_approved: 1 })
  addActivity({ id: genId(), jobId: taskId, type: 'plan_approved', message: `Plan approved for task ${taskId}` })
  emit('state-changed')
  return { success: true }
})

ipcMain.handle('update-subtask-agent', async (_e, { taskId, subtaskId, agent }: { taskId: string; subtaskId: string; agent: string }) => {
  const job = getJob(taskId)
  if (!job) return { error: 'Job not found' }
  try {
    const subtasks = JSON.parse(job.subtasks || '[]')
    const updated = subtasks.map((st: any) => st.id === subtaskId ? { ...st, assignedAgent: agent } : st)
    updateJob(taskId, { subtasks: JSON.stringify(updated) })
    emit('state-changed')
    return { success: true }
  } catch {
    return { error: 'Failed to update subtask' }
  }
})

ipcMain.handle('respond-command-approval', async (_e, { taskId, approve }: { taskId: string; promptId: string; approve: boolean }) => {
  const active = activeJobs.get(taskId)
  if (active) {
    const input = approve ? 'y\n' : 'n\n'
    return active.driver.write(input)
  }
  return false
})

// ─── IPC: Hooks ───────────────────────────────────────────────────────────────
ipcMain.handle('get-hooks', () => getHooks())
ipcMain.handle('add-hook', (_e, hook: any) => {
  const id = genId()
  addHook({ ...hook, id, enabled: hook.enabled ? 1 : 0 })
  return getHooks()
})
ipcMain.handle('update-hook', (_e, id: string, fields: Record<string, any>) => {
  if (typeof fields.enabled === 'boolean') {
    fields.enabled = fields.enabled ? 1 : 0
  }
  updateHook(id, fields)
  return getHooks()
})
ipcMain.handle('delete-hook', (_e, id: string) => {
  deleteHook(id)
  return getHooks()
})
ipcMain.handle('toggle-hook', (_e, id: string, enabled: boolean) => {
  updateHook(id, { enabled: enabled ? 1 : 0 })
  return getHooks()
})
ipcMain.handle('test-hook-command', async (_e, command: string) => {
  const activeProject = getProjects().find((p: any) => p.is_active === 1)
  const workdir = activeProject?.path || process.cwd()
  return runHookCommand(command, workdir)
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
  const encrypted = safeStorage.isEncryptionAvailable()
    ? safeStorage.encryptString(cred.secret).toString('base64')
    : Buffer.from(cred.secret, 'utf8').toString('base64')
  addCredential({ id, agent: cred.agent, label: cred.label, secretEncrypted: encrypted })
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

ipcMain.handle('open-native-terminal', () => {
  const isWin = process.platform === 'win32'
  const workdir = getProjects().find((p: any) => p.is_active === 1)?.path || process.cwd()

  if (isWin) {
    childSpawn('cmd.exe', ['/c', 'start', 'cmd.exe'], { cwd: workdir, detached: true, stdio: 'ignore' })
  } else if (process.platform === 'darwin') {
    childSpawn('open', ['-a', 'Terminal', workdir], { detached: true, stdio: 'ignore' })
  } else {
    childSpawn('x-terminal-emulator', [], { cwd: workdir, detached: true, stdio: 'ignore' })
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
ipcMain.handle('add-project', async (_e, project: {
  name: string
  path: string
  gitRemote?: string
  createIfMissing?: boolean
  gitInit?: boolean
  setActive?: boolean
}) => {
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
    } else if (project.createIfMissing && !existsSync(projectPath)) {
      mkdirSync(projectPath, { recursive: true })
    }
  } catch (error: any) {
    return { error: `Project setup failed: ${error?.message || 'check the path and access rights'}` }
  }
  if (!existsSync(projectPath) || !statSync(projectPath).isDirectory()) {
    return { error: 'Project folder does not exist' }
  }
  if (project.gitInit && !(await isGitRepo(projectPath))) {
    try {
      await simpleGit(projectPath).init()
    } catch (error: any) {
      return { error: `Git init failed: ${error?.message || 'could not initialize repository'}` }
    }
  }
  const id = genId()
  addProject({ ...project, id, path: projectPath, gitRemote: remote })
  if (project.setActive !== false) {
    setActiveProject(id)
  }
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

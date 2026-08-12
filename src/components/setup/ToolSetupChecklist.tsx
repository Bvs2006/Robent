import { useCallback, useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Download, ExternalLink, LogIn, RefreshCcw, Sparkles } from 'lucide-react'
import { useFleetStore } from '../../store/fleetStore'
import type { ToolId, ToolStatusRecord } from '../../types'
import ToolTerminalPane from './ToolTerminalPane'

type ToolSessionState = {
  sessionId: string
  kind: 'install' | 'auth'
  output: string
  running: boolean
}

interface ToolSetupChecklistProps {
  variant: 'setup' | 'settings'
}

const TOOL_ORDER: ToolId[] = ['claude-code', 'codex', 'antigravity', 'aider', 'opencode']

const TOOL_LABELS: Record<ToolId, string> = {
  'claude-code': 'Claude Code',
  codex: 'Codex',
  antigravity: 'Antigravity',
  aider: 'Aider',
  opencode: 'OpenCode',
}

const TOOL_BINARIES: Record<ToolId, string> = {
  'claude-code': 'claude',
  codex: 'codex',
  antigravity: 'agy',
  aider: 'aider',
  opencode: 'opencode',
}

const TOOL_WEB_URLS: Record<ToolId, string> = {
  'claude-code': 'https://console.anthropic.com',
  codex: 'https://platform.openai.com',
  antigravity: 'https://antigravity.google.com',
  aider: 'https://aider.chat',
  opencode: 'https://opencode.ai',
}

function statusLabel(status: ToolStatusRecord['authStatus']) {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'installed-not-signed-in':
      return 'Needs sign in'
    default:
      return 'Not installed'
  }
}

export default function ToolSetupChecklist({ variant }: ToolSetupChecklistProps) {
  const { toolStatuses, setToolSetupCompleted, toolSetupCompleted } = useFleetStore()
  const [sessions, setSessions] = useState<Record<ToolId, ToolSessionState | undefined>>({} as Record<ToolId, ToolSessionState | undefined>)
  const [aiderSecretDraft, setAiderSecretDraft] = useState('')
  const [showAiderSecretInput, setShowAiderSecretInput] = useState(false)
  const [isCheckingStatuses, setIsCheckingStatuses] = useState(false)
  const [setupError, setSetupError] = useState<string | null>(null)

  const refreshStatuses = useCallback(async () => {
    setIsCheckingStatuses(true)
    setSetupError(null)

    try {
      const rows = await window.electronAPI?.refreshToolStatuses()
      if (rows) {
        useFleetStore.setState({ toolStatuses: rows })
      } else {
        setSetupError('Tool status check is unavailable in this window.')
      }
    } catch (error) {
      setSetupError(error instanceof Error ? error.message : 'Tool status check failed.')
    } finally {
      setIsCheckingStatuses(false)
    }
  }, [])

  useEffect(() => {
    refreshStatuses()

    window.electronAPI?.onToolStatusesChanged((rows) => {
      useFleetStore.setState({ toolStatuses: rows })
    })

    window.electronAPI?.onToolActionStarted((toolId, sessionId, kind) => {
      setSessions((current) => ({
        ...current,
        [toolId]: { sessionId, kind, output: '', running: true },
      }))
    })

    window.electronAPI?.onToolOutput((toolId, sessionId, chunk) => {
      setSessions((current) => {
        const existing = current[toolId]
        if (!existing || existing.sessionId !== sessionId) return current
        return {
          ...current,
          [toolId]: { ...existing, output: existing.output + chunk },
        }
      })
    })

    window.electronAPI?.onToolActionEnded((toolId, sessionId, _exitCode, _output) => {
      setSessions((current) => {
        const existing = current[toolId]
        if (!existing || existing.sessionId !== sessionId) return current
        return {
          ...current,
          [toolId]: undefined,
        }
      })
      refreshStatuses()
    })

    return () => {
      window.electronAPI?.removeAllListeners('tool-statuses-changed')
      window.electronAPI?.removeAllListeners('tool-action-started')
      window.electronAPI?.removeAllListeners('tool-output')
      window.electronAPI?.removeAllListeners('tool-action-ended')
    }
  }, [refreshStatuses])

  const readyCount = useMemo(() => toolStatuses.filter((tool) => tool.available).length, [toolStatuses])
  const canContinue = readyCount > 0

  const runInstall = async (toolId: ToolId) => {
    setSetupError(null)
    setSessions((current) => ({
      ...current,
      [toolId]: { sessionId: `pending-${toolId}-install`, kind: 'install', output: 'Starting install...\r\n', running: true },
    }))

    try {
      await window.electronAPI?.runToolAction({ toolId, kind: 'install' })
    } catch (error) {
      setSessions((current) => ({ ...current, [toolId]: undefined }))
      setSetupError(error instanceof Error ? error.message : 'Install failed.')
      await refreshStatuses()
    }
  }

  const runSignIn = async (toolId: ToolId) => {
    const status = toolStatuses.find((item) => item.toolId === toolId)
    if (!status?.installed) return

    if (toolId === 'aider') {
      if (!showAiderSecretInput) {
        setShowAiderSecretInput(true)
        return
      }

      if (!aiderSecretDraft.trim()) return
      setSessions((current) => ({
        ...current,
        [toolId]: { sessionId: `pending-${toolId}-auth`, kind: 'auth', output: 'Saving API key...\r\n', running: true },
      }))

      try {
        await window.electronAPI?.runToolAction({
          toolId,
          kind: 'auth',
          secret: aiderSecretDraft.trim(),
        })
      } catch (error) {
        setSessions((current) => ({ ...current, [toolId]: undefined }))
        setSetupError(error instanceof Error ? error.message : 'Sign-in failed.')
        await refreshStatuses()
      }
      setAiderSecretDraft('')
      setShowAiderSecretInput(false)
      return
    }

    setSessions((current) => ({
      ...current,
      [toolId]: { sessionId: `pending-${toolId}-auth`, kind: 'auth', output: 'Starting sign in...\r\n', running: true },
    }))

    try {
      await window.electronAPI?.runToolAction({ toolId, kind: 'auth' })
    } catch (error) {
      setSessions((current) => ({ ...current, [toolId]: undefined }))
      setSetupError(error instanceof Error ? error.message : 'Sign-in failed.')
      await refreshStatuses()
    }
  }

  const handleOpenWebPortal = (toolId: ToolId) => {
    const url = TOOL_WEB_URLS[toolId]
    if (url && window.electronAPI?.openExternal) {
      window.electronAPI.openExternal(url)
    }
  }

  const handleContinue = async () => {
    await setToolSetupCompleted(true)
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky-400 mb-2">
            <Sparkles className="w-4 h-4" />
            Tool Setup & CLI Connections
          </div>
          <h2 className="text-lg font-bold text-zinc-100">Connect the CLIs this app can use</h2>
          <p className="text-sm text-zinc-500 max-w-2xl mt-1">
            Install or sign in to tools below. The orchestrator will automatically route engineering tickets to your ready CLI drivers.
          </p>
        </div>
        <button
          onClick={refreshStatuses}
          disabled={isCheckingStatuses}
          className="inline-flex items-center gap-2 rounded-lg border border-[#24242b] bg-[#111115] px-3 py-2 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-[#16161b] disabled:opacity-50 transition-colors"
        >
          <RefreshCcw className={`w-3.5 h-3.5 ${isCheckingStatuses ? 'animate-spin' : ''}`} />
          {isCheckingStatuses ? 'Checking...' : 'Recheck Status'}
        </button>
      </div>

      {setupError && (
        <div className="rounded-lg border border-red-900/60 bg-red-950/30 px-3 py-2 text-xs text-red-300">
          {setupError}
        </div>
      )}

      <div className="space-y-3">
        {TOOL_ORDER.map((toolId) => {
          const status = toolStatuses.find((item) => item.toolId === toolId)
          const session = sessions[toolId]
          const isReady = status?.available || false
          const isInstalled = status?.installed || false
          const showTerminal = Boolean(session?.running)

          return (
            <div key={toolId} className="rounded-2xl border border-[#1d1d24] bg-[#0f0f12] overflow-hidden">
              <div className="flex items-start justify-between gap-4 p-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-bold text-zinc-100">{TOOL_LABELS[toolId]}</span>
                    <span className={`text-[10px] font-semibold uppercase tracking-widest px-2 py-1 rounded-full border ${
                      isReady
                        ? 'text-emerald-300 border-emerald-800/60 bg-emerald-950/40'
                        : isInstalled
                          ? 'text-amber-300 border-amber-800/60 bg-amber-950/40'
                          : 'text-zinc-400 border-zinc-800 bg-zinc-900/70'
                    }`}>
                      {statusLabel(status?.authStatus || 'not-installed')}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-zinc-500 font-mono">
                    {status?.binary || TOOL_BINARIES[toolId]} {status?.version ? `v${status.version}` : ''}
                  </div>
                  {status?.details && (
                    <p className="mt-2 text-xs text-zinc-600 max-w-2xl whitespace-pre-wrap line-clamp-2">{status.details}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Direct Web Portal Link */}
                  <button
                    onClick={() => handleOpenWebPortal(toolId)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#24242b] bg-[#121216] px-2.5 py-2 text-xs font-medium text-zinc-400 hover:text-white hover:bg-[#18181f] transition-colors"
                    title={`Open ${TOOL_LABELS[toolId]} portal in browser`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Portal
                  </button>

                  {/* Install button */}
                  {!isInstalled && (
                    <button
                      onClick={() => runInstall(toolId)}
                      disabled={session?.running}
                      className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-colors disabled:opacity-50 bg-sky-500 text-sky-950 hover:bg-sky-400"
                    >
                      <Download className="w-3.5 h-3.5" />
                      {session?.running && session.kind === 'install' ? 'Installing...' : 'Install'}
                    </button>
                  )}

                  {/* Sign In button */}
                  {isInstalled && (
                    <button
                      onClick={() => runSignIn(toolId)}
                      disabled={session?.running}
                      className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-colors disabled:opacity-50 ${
                        isReady
                          ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/60'
                          : isInstalled
                            ? 'bg-amber-500 text-amber-950 hover:bg-amber-400'
                            : 'bg-[#1e1e26] border border-[#2e2e38] text-zinc-200 hover:bg-[#252530]'
                      }`}
                    >
                      {isReady ? <CheckCircle2 className="w-3.5 h-3.5" /> : <LogIn className="w-3.5 h-3.5" />}
                      {session?.running && session.kind === 'auth' ? 'Signing in...' : isReady ? 'Ready' : 'Sign in'}
                    </button>
                  )}

                  {toolId === 'aider' && isInstalled && !isReady && showAiderSecretInput && (
                    <div className="flex items-center gap-2">
                      <input
                        type="password"
                        value={aiderSecretDraft}
                        onChange={(e) => setAiderSecretDraft(e.target.value)}
                        placeholder="Paste Aider API key"
                        className="w-64 rounded-lg border border-[#24242b] bg-[#101014] px-3 py-2 text-xs text-zinc-100 outline-none focus:border-sky-500"
                      />
                    </div>
                  )}
                </div>
              </div>

              {toolId === 'aider' && status?.authStatus === 'installed-not-signed-in' && showAiderSecretInput && (
                <div className="px-4 pb-4 flex items-center gap-2">
                  <button
                    onClick={() => runSignIn(toolId)}
                    className="inline-flex items-center gap-2 rounded-lg border border-sky-800/60 bg-sky-950/40 px-3 py-2 text-xs font-semibold text-sky-300 hover:bg-sky-950/60 transition-colors"
                  >
                    <LogIn className="w-3.5 h-3.5" /> Save API key
                  </button>
                  <button
                    onClick={() => setShowAiderSecretInput(false)}
                    className="inline-flex items-center gap-2 rounded-lg border border-[#24242b] bg-[#111115] px-3 py-2 text-xs font-semibold text-zinc-400 hover:text-white hover:bg-[#16161b] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}

              <div className="px-4 pb-4">
                <ToolTerminalPane output={session?.output || ''} visible={showTerminal} />
              </div>
            </div>
          )
        })}
      </div>

      {variant === 'setup' && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-[#1d1d24] bg-[#0f0f12] p-4">
          <div>
            <div className="text-sm font-semibold text-zinc-100">{readyCount} tool{readyCount === 1 ? '' : 's'} ready</div>
            <div className="text-xs text-zinc-500">
              {readyCount > 0
                ? 'Great! The coordinator will assign tasks to your ready CLI tools.'
                : 'No CLI tools connected yet. You can sign in to a tool or skip to explore the app interface.'}
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
            <button
              onClick={handleContinue}
              className="flex-1 sm:flex-initial rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
            >
              Skip for now
            </button>
            <button
              onClick={handleContinue}
              disabled={!canContinue}
              className="flex-1 sm:flex-initial rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-black hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            >
              Continue to App
            </button>
          </div>
        </div>
      )}

      {variant === 'settings' && toolSetupCompleted && (
        <div className="text-xs text-zinc-600">Tool setup has already been completed for this workspace.</div>
      )}
    </div>
  )
}

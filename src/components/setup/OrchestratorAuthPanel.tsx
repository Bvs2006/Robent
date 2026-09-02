import { useCallback, useEffect, useMemo, useState } from 'react'
import { CheckCircle2, LogIn, RefreshCcw, Terminal, X, Zap } from 'lucide-react'
import { useFleetStore } from '../../store/fleetStore'
import type { ToolId, ToolStatusRecord } from '../../types'
import ToolTerminalPane from './ToolTerminalPane'

type AuthCapability = {
  toolId: ToolId
  name: string
  binary: string
  supportsAuth: boolean
  authCommand: string | null
}

type SessionState = {
  sessionId: string
  output: string
  running: boolean
  kind: 'auth' | 'terminal' | 'install'
}

const FALLBACK_ORDER: ToolId[] = ['claude-code', 'codex', 'antigravity', 'aider', 'opencode']

function statusLabel(status: ToolStatusRecord['authStatus'] | undefined) {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'installed-not-signed-in':
      return 'Needs sign in'
    case 'not-installed':
      return 'Not installed'
    default:
      return 'Unknown'
  }
}

export default function OrchestratorAuthPanel() {
  const toolStatuses = useFleetStore((s) => s.toolStatuses)
  const setShowOrchestrator = useFleetStore((s) => s.setShowOrchestrator)
  const [capabilities, setCapabilities] = useState<AuthCapability[]>([])
  const [selectedToolId, setSelectedToolId] = useState<ToolId | null>(null)
  const [session, setSession] = useState<SessionState | null>(null)
  const [aiderSecretDraft, setAiderSecretDraft] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [checkElapsed, setCheckElapsed] = useState<number>(0)
  const [lastCheckDuration, setLastCheckDuration] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const refreshStatuses = useCallback(async () => {
    setIsChecking(true)
    setError(null)
    setCheckElapsed(0)
    const startTime = Date.now()
    const timer = setInterval(() => {
      setCheckElapsed((Date.now() - startTime) / 1000)
    }, 100)

    try {
      const rows = await window.electronAPI?.refreshToolStatuses()
      if (rows) useFleetStore.setState({ toolStatuses: rows })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Status check failed.')
    } finally {
      clearInterval(timer)
      const duration = (Date.now() - startTime) / 1000
      setCheckElapsed(duration)
      setLastCheckDuration(duration)
      setIsChecking(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      const caps = await window.electronAPI?.getToolAuthCapabilities()
      if (cancelled) return
      if (caps?.length) {
        setCapabilities(caps)
        const firstAuth = caps.find((c) => c.supportsAuth)?.toolId || caps[0]?.toolId || null
        setSelectedToolId(firstAuth)
      } else {
        setCapabilities(
          FALLBACK_ORDER.map((toolId) => ({
            toolId,
            name: toolId,
            binary: toolId,
            supportsAuth: true,
            authCommand: null,
          })),
        )
        setSelectedToolId(FALLBACK_ORDER[0])
      }
    })()

    refreshStatuses()

    window.electronAPI?.onToolActionStarted((toolId, sessionId, kind) => {
      if (kind !== 'auth' && kind !== 'terminal') return
      setSelectedToolId(toolId)
      setSession((current) => ({
        sessionId,
        output: current?.sessionId.startsWith('pending-') ? current.output : '',
        running: true,
        kind: kind as 'auth' | 'terminal',
      }))
    })

    window.electronAPI?.onToolOutput((_toolId, sessionId, chunk) => {
      setSession((current) => {
        if (!current || current.sessionId !== sessionId) return current
        return { ...current, output: current.output + chunk }
      })
    })

    window.electronAPI?.onToolActionEnded((_toolId, sessionId) => {
      setSession((current) => {
        if (!current || current.sessionId !== sessionId) return current
        return { ...current, running: false }
      })
      // Only refresh tool statuses after auth sessions — terminal exit doesn't change auth state
      refreshStatuses()
    })

    return () => {
      cancelled = true
      window.electronAPI?.removeAllListeners('tool-action-started')
      window.electronAPI?.removeAllListeners('tool-output')
      window.electronAPI?.removeAllListeners('tool-action-ended')
    }
  }, [refreshStatuses])

  const tools = useMemo(() => {
    const byId = new Map(toolStatuses.map((t) => [t.toolId, t]))
    const ids = capabilities.length > 0 ? capabilities.map((c) => c.toolId) : FALLBACK_ORDER
    return ids.map((toolId) => {
      const cap = capabilities.find((c) => c.toolId === toolId)
      const status = byId.get(toolId)
      return {
        toolId,
        name: status?.name || cap?.name || toolId,
        binary: status?.binary || cap?.binary || toolId,
        version: status?.version || null,
        installed: status?.installed || false,
        authStatus: status?.authStatus || ('not-installed' as const),
        available: status?.available || false,
        details: status?.details || null,
        supportsAuth: cap?.supportsAuth ?? true,
        authCommand: cap?.authCommand || null,
      }
    })
  }, [capabilities, toolStatuses])

  const selected = tools.find((t) => t.toolId === selectedToolId) || tools[0] || null

  const handleInput = useCallback(
    (data: string) => {
      if (!session?.running || !session.sessionId) return
      window.electronAPI?.writeToolInput({ sessionId: session.sessionId, data })
    },
    [session],
  )

  const runAuth = async (toolId: ToolId) => {
    const tool = tools.find((t) => t.toolId === toolId)
    if (!tool?.supportsAuth) return
    if (!tool.installed) {
      setError(`${tool.name} is not installed. Open Tool Setup to install it first.`)
      return
    }

    setError(null)
    setSelectedToolId(toolId)

    if (toolId === 'aider') {
      if (!aiderSecretDraft.trim()) {
        setError('Paste an Aider API key to continue.')
        return
      }
      setSession({ sessionId: `pending-${toolId}-auth`, output: 'Saving API key...\r\n', running: true, kind: 'auth' })
      try {
        await window.electronAPI?.runToolAction({
          toolId,
          kind: 'auth',
          secret: aiderSecretDraft.trim(),
        })
      } catch (err) {
        setSession(null)
        setError(err instanceof Error ? err.message : 'Sign-in failed.')
        await refreshStatuses()
      }
      setAiderSecretDraft('')
      return
    }

    setSession({
      sessionId: `pending-${toolId}-auth`,
      output: `Starting ${tool.name} auth in terminal...\r\n${tool.authCommand ? `$ ${tool.authCommand}\r\n` : ''}`,
      running: true,
      kind: 'auth',
    })

    try {
      await window.electronAPI?.runToolAction({ toolId, kind: 'auth' })
    } catch (err) {
      setSession(null)
      setError(err instanceof Error ? err.message : 'Sign-in failed.')
      await refreshStatuses()
    }
  }

  const runCliTerminal = async (toolId: ToolId) => {
    setError(null)
    const tool = tools.find((item) => item.toolId === toolId)
    if (!tool?.installed) {
      setError(`${tool?.name || toolId} is not installed. Open Tool Setup to install it first.`)
      return
    }

    setSession({
      sessionId: `pending-${toolId}-terminal`,
      output: `Starting interactive CLI terminal for ${tool.name}...\r\n$ ${tool.binary}\r\n`,
      running: true,
      kind: 'terminal',
    })

    try {
      await window.electronAPI?.runToolAction({ toolId, kind: 'terminal' })
    } catch (err) {
      setSession(null)
      setError(err instanceof Error ? err.message : 'CLI terminal launch failed.')
      await refreshStatuses()
    }
  }

  const stopSession = async () => {
    if (!session?.sessionId) return
    await window.electronAPI?.killToolSession(session.sessionId)
    setSession((current) => (current ? { ...current, running: false } : current))
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="relative rounded-3xl border border-[#1d1d24] bg-[#0b0b0d] shadow-2xl p-5 md:p-6">
          <button
            onClick={() => setShowOrchestrator(false)}
            className="absolute right-5 top-5 rounded-full p-2 text-zinc-500 hover:bg-[#1a1a20] hover:text-white transition-colors"
            title="Close Orchestrator"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start justify-between gap-4 pr-10 mb-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky-400 mb-2">
                <Zap className="w-4 h-4" />
                Orchestrator
              </div>
              <h2 className="text-lg font-bold text-zinc-100">Authenticate CLIs in the terminal</h2>
              <p className="text-sm text-zinc-500 max-w-2xl mt-1">
                Pick any configured CLI and complete sign-in here. Tools that need no auth stay ready without
                extra steps; interactive logins stream into the embedded terminal below.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {lastCheckDuration !== null && !isChecking && (
                <span className="text-[11px] text-zinc-500 font-mono">
                  Checked in {lastCheckDuration.toFixed(1)}s
                </span>
              )}
              <button
                onClick={refreshStatuses}
                disabled={isChecking}
                className="inline-flex items-center gap-2 rounded-lg border border-[#24242b] bg-[#111115] px-3 py-2 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-[#16161b] disabled:opacity-50 transition-colors"
              >
                <RefreshCcw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin text-sky-400' : ''}`} />
                {isChecking ? `Checking (${checkElapsed.toFixed(1)}s)...` : 'Recheck'}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-900/60 bg-red-950/30 px-3 py-2 text-xs text-red-300">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4">
            <div className="space-y-1.5">
              {tools.map((tool) => {
                const active = selected?.toolId === tool.toolId
                return (
                  <button
                    key={tool.toolId}
                    onClick={() => setSelectedToolId(tool.toolId)}
                    className={`w-full text-left rounded-xl border px-3 py-2.5 transition-colors ${
                      active
                        ? 'border-sky-700/60 bg-sky-950/30'
                        : 'border-[#1d1d24] bg-[#0f0f12] hover:bg-[#141418]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-zinc-100">{tool.name}</span>
                      <span
                        className={`text-[9px] font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded-full border ${
                          tool.available
                            ? 'text-emerald-300 border-emerald-800/60 bg-emerald-950/40'
                            : tool.installed
                              ? 'text-amber-300 border-amber-800/60 bg-amber-950/40'
                              : 'text-zinc-400 border-zinc-800 bg-zinc-900/70'
                        }`}
                      >
                        {statusLabel(tool.authStatus)}
                      </span>
                    </div>
                    <div className="mt-1 text-[10px] text-zinc-500 font-mono truncate">
                      {tool.binary}
                      {tool.supportsAuth ? '' : ' · no auth needed'}
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="rounded-2xl border border-[#1d1d24] bg-[#0f0f12] p-4 space-y-4 min-w-0">
              {selected ? (
                <>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-zinc-100">{selected.name}</div>
                      <div className="mt-1 text-xs text-zinc-500 font-mono">
                        {selected.binary}
                        {selected.version ? ` v${selected.version}` : ''}
                      </div>
                      {selected.authCommand && (
                        <div className="mt-2 text-[11px] text-zinc-600 font-mono">Auth: {selected.authCommand}</div>
                      )}
                      {selected.details && (
                        <p className="mt-2 text-xs text-zinc-600 whitespace-pre-wrap line-clamp-3">{selected.details}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {selected.installed && (
                        <button
                          onClick={() => runCliTerminal(selected.toolId)}
                          disabled={session?.running}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-sky-800/60 bg-sky-950/40 px-3 py-2 text-xs font-semibold text-sky-300 hover:bg-sky-950/70 hover:text-white transition-colors disabled:opacity-50"
                          title="Open interactive CLI terminal session"
                        >
                          <Terminal className="w-3.5 h-3.5" />
                          <span>CLI Terminal</span>
                        </button>
                      )}

                      {selected.supportsAuth ? (
                        <>
                          <button
                            onClick={() => runAuth(selected.toolId)}
                            disabled={session?.running || !selected.installed}
                            className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-colors disabled:opacity-50 ${
                              selected.available
                                ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/60'
                                : 'bg-amber-500 text-amber-950 hover:bg-amber-400'
                            }`}
                          >
                            {selected.available ? <CheckCircle2 className="w-3.5 h-3.5" /> : <LogIn className="w-3.5 h-3.5" />}
                            {session?.running
                              ? 'Signing in...'
                              : selected.available
                                ? 'Re-auth'
                                : 'Sign in in terminal'}
                          </button>
                          {session?.running && (
                            <button
                              onClick={stopSession}
                              className="inline-flex items-center gap-2 rounded-xl border border-[#24242b] bg-[#121216] px-3 py-2 text-xs font-medium text-zinc-400 hover:text-white hover:bg-[#18181f] transition-colors"
                            >
                              Stop
                            </button>
                          )}
                        </>
                      ) : (
                        <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-800/60 bg-emerald-950/40 px-3 py-2 text-xs font-semibold text-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          No auth required
                        </div>
                      )}
                    </div>
                  </div>

                  {selected.toolId === 'aider' && selected.supportsAuth && (
                    <input
                      type="password"
                      value={aiderSecretDraft}
                      onChange={(e) => setAiderSecretDraft(e.target.value)}
                      placeholder="Paste Aider API key"
                      className="w-full max-w-md rounded-lg border border-[#24242b] bg-[#101014] px-3 py-2 text-xs text-zinc-100 outline-none focus:border-sky-500"
                    />
                  )}

                  {!selected.installed && (
                    <div className="rounded-lg border border-amber-900/50 bg-amber-950/20 px-3 py-2 text-xs text-amber-300">
                      Install this CLI from Tool Setup first, then return here to authenticate.
                    </div>
                  )}

                  {selected.supportsAuth && selected.installed && !selected.available && !session?.running && (
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <Terminal className="w-3.5 h-3.5" />
                      Interactive prompts (browser login, paste key) appear in the terminal below.
                    </div>
                  )}

                  <ToolTerminalPane
                    output={session?.output || ''}
                    visible={Boolean(session)}
                    interactive={Boolean(session?.running && selected.toolId !== 'aider')}
                    onInput={handleInput}
                    className="h-64 w-full rounded-lg overflow-hidden border border-[#1f1f25] bg-[#09090b]"
                  />

                  {!session && (
                    <div className="h-64 w-full rounded-lg border border-dashed border-[#1f1f25] bg-[#09090b] flex flex-col items-center justify-center gap-2 text-xs text-zinc-600">
                      <Terminal className="w-5 h-5 text-zinc-700" />
                      <span>Click &quot;CLI Terminal&quot; or &quot;Sign in in terminal&quot; above to view live CLI output.</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-xs text-zinc-500">No CLIs configured.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import { useFleetStore } from './store/fleetStore'

import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import Dashboard from './pages/Dashboard'
import Sessions from './pages/Sessions'
import Settings from './pages/Settings'
import Projects from './pages/Projects'
import TerminalView from './components/terminal/TerminalView'
import RaceModeView from './components/race/RaceModeView'
import DiffViewer from './components/diff/DiffViewer'
import NewTaskModal from './components/common/NewTaskModal'
import CommandPalette from './components/common/CommandPalette'
import NotificationToast from './components/common/NotificationToast'
import ToolSetupChecklist from './components/setup/ToolSetupChecklist'

function App() {
  // Read stable primitives only — these change rarely, don't trigger frame-level re-renders
  const currentPage    = useFleetStore((s) => s.currentPage)
  const terminalTaskId = useFleetStore((s) => s.terminalTaskId)
  const raceTaskId     = useFleetStore((s) => s.raceTaskId)
  const diffTaskId     = useFleetStore((s) => s.diffTaskId)
  const showNewTaskModal   = useFleetStore((s) => s.showNewTaskModal)
  const showCommandPalette = useFleetStore((s) => s.showCommandPalette)
  const toolSetupCompleted = useFleetStore((s) => s.toolSetupCompleted)
  const [isBootstrapping, setIsBootstrapping] = useState(true)

  // Debounce full state refreshes so rapid state-changed bursts don't hammer the DB
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const scheduleRefresh = useRef(() => {
    if (refreshTimer.current) clearTimeout(refreshTimer.current)
    refreshTimer.current = setTimeout(() => {
      useFleetStore.getState().refreshAll()
    }, 600)
  })

  useEffect(() => {
    // Initial full load
    useFleetStore.getState().loadAll()
      .catch((err) => console.error('Initial load failed:', err))
      .finally(() => setIsBootstrapping(false))

    if (window.electronAPI) {
      // state-changed = real event (task start/finish/cancel/merge)
      // → debounced full reload from DB
      window.electronAPI.onStateChanged(() => scheduleRefresh.current())

      // task-done → immediate full refresh (task moved to review/done)
      window.electronAPI.onTaskDone(() => {
        if (refreshTimer.current) clearTimeout(refreshTimer.current)
        useFleetStore.getState().refreshAll()
      })

      // runtime-tick → patch runtime counters IN-PLACE with no IPC round-trip
      // This is the fix for the blinking/page-reset: runtime updates no longer
      // touch currentPage or cause full re-renders.
      window.electronAPI.onRuntimeTick((runtimes: Record<string, number>) => {
        useFleetStore.setState((s) => ({
          tasks: s.tasks.map((t) =>
            runtimes[t.id] !== undefined
              ? { ...t, runtime: runtimes[t.id] }
              : t
          ),
          workers: s.workers.map((w) =>
            runtimes[w.taskId] !== undefined
              ? { ...w, runtime: runtimes[w.taskId] }
              : w
          ),
        }))
      })
    }

    // Cmd/Ctrl+K → command palette
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        useFleetStore.getState().setShowCommandPalette(
          !useFleetStore.getState().showCommandPalette
        )
      }
    }
    window.addEventListener('keydown', onKey)

    return () => {
      window.removeEventListener('keydown', onKey)
      if (refreshTimer.current) clearTimeout(refreshTimer.current)
      window.electronAPI?.removeAllListeners('state-changed')
      window.electronAPI?.removeAllListeners('task-done')
      window.electronAPI?.removeAllListeners('runtime-tick')
    }
  }, [])

  // Determine main content — derived from stable store slices, no unnecessary deps
  const renderMain = () => {
    if (terminalTaskId) return <TerminalView />
    if (raceTaskId)     return <RaceModeView />
    if (diffTaskId)     return <DiffViewer />
    switch (currentPage) {
      case 'sessions':  return <Sessions />
      case 'projects':  return <Projects />
      case 'settings':  return <Settings />
      default:          return <Dashboard />
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#09090b]">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <Header />
        <main className="flex-1 min-h-0 overflow-hidden flex flex-col">
          {renderMain()}
        </main>
      </div>

      {showNewTaskModal    && <NewTaskModal />}
      {showCommandPalette  && <CommandPalette />}

      {/* Tool Setup Overlay — only shown once, never re-mounts from runtime ticks */}
      {!isBootstrapping && !toolSetupCompleted && (
        <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="mx-auto max-w-5xl px-4 py-10">
            <div className="relative rounded-3xl border border-[#1d1d24] bg-[#0b0b0d] shadow-2xl p-5 md:p-6">
              <button
                onClick={() => useFleetStore.getState().setToolSetupCompleted(true)}
                className="absolute right-5 top-5 rounded-full p-2 text-zinc-500 hover:bg-[#1a1a20] hover:text-white transition-colors"
                title="Dismiss setup"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <ToolSetupChecklist variant="setup" />
            </div>
          </div>
        </div>
      )}

      <NotificationToast />
    </div>
  )
}

export default App

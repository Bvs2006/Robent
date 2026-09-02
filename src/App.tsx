import { useEffect, useRef, useState } from 'react'
import { useFleetStore } from './store/fleetStore'

import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import Dashboard from './pages/Dashboard'
import Sessions from './pages/Sessions'
import Settings from './pages/Settings'
import Projects from './pages/Projects'
import Worktrees from './pages/Worktrees'
import PullRequests from './pages/PullRequests'
import TerminalView from './components/terminal/TerminalView'
import DiffViewer from './components/diff/DiffViewer'
import NewTaskModal from './components/common/NewTaskModal'
import ProjectSetupModal from './components/common/ProjectSetupModal'
import CommandPalette from './components/common/CommandPalette'
import NotificationToast from './components/common/NotificationToast'
import ToolSetupChecklist from './components/setup/ToolSetupChecklist'
import OrchestratorAuthPanel from './components/setup/OrchestratorAuthPanel'
import WorkerPanel from './components/workers/WorkerPanel'

function App() {
  // Read stable primitives only — these change rarely, don't trigger frame-level re-renders
  const currentPage    = useFleetStore((s) => s.currentPage)
  const terminalTaskId = useFleetStore((s) => s.terminalTaskId)
  const diffTaskId     = useFleetStore((s) => s.diffTaskId)
  const showNewTaskModal   = useFleetStore((s) => s.showNewTaskModal)
  const showProjectSetupModal = useFleetStore((s) => s.showProjectSetupModal)
  const showCommandPalette = useFleetStore((s) => s.showCommandPalette)
  const showWorkerPanel    = useFleetStore((s) => s.showWorkerPanel)
  const showOrchestrator   = useFleetStore((s) => s.showOrchestrator)
  const showToolSetupModal = useFleetStore((s) => s.showToolSetupModal)
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

    let unsubStateChanged: (() => void) | undefined
    let unsubTaskDone: (() => void) | undefined
    let unsubRuntimeTick: (() => void) | undefined
    let unsubToolStatuses: (() => void) | undefined
    let unsubPreviewReady: (() => void) | undefined

    if (window.electronAPI) {
      unsubStateChanged = window.electronAPI.onStateChanged(() => scheduleRefresh.current())

      unsubTaskDone = window.electronAPI.onTaskDone(() => {
        if (refreshTimer.current) clearTimeout(refreshTimer.current)
        useFleetStore.getState().refreshAll()
      })

      unsubRuntimeTick = window.electronAPI.onRuntimeTick((runtimes: Record<string, number>) => {
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

      unsubToolStatuses = window.electronAPI.onToolStatusesChanged((statuses) => {
        useFleetStore.setState({ toolStatuses: statuses })
      })

      unsubPreviewReady = window.electronAPI.onPreviewReady((taskId, port) => {
        useFleetStore.setState((s) => ({
          previewPorts: { ...s.previewPorts, [taskId]: port },
        }))
        useFleetStore.getState().addNotification('success', `Preview ready on localhost:${port}`)
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
      unsubStateChanged?.()
      unsubTaskDone?.()
      unsubRuntimeTick?.()
      unsubToolStatuses?.()
      unsubPreviewReady?.()
    }
  }, [])

  // Determine main content — derived from stable store slices, no unnecessary deps
  const renderMain = () => {
    if (terminalTaskId) return <TerminalView />
    if (diffTaskId)     return <DiffViewer />
    switch (currentPage) {
      case 'sessions':      return <Sessions />
      case 'projects':      return <Projects />
      case 'worktrees':     return <Worktrees />
      case 'pullRequests':  return <PullRequests />
      case 'settings':      return <Settings />
      default:              return <Dashboard />
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
      {showProjectSetupModal && <ProjectSetupModal />}
      {showCommandPalette  && <CommandPalette />}
      {showOrchestrator    && <OrchestratorAuthPanel />}
      {showWorkerPanel     && (
        <div className="fixed top-12 right-4 z-50">
          <WorkerPanel />
        </div>
      )}

      {/* Tool Setup Overlay */}
      {((!isBootstrapping && !toolSetupCompleted) || showToolSetupModal) && !showOrchestrator && (
        <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="mx-auto max-w-5xl px-4 py-10">
            <div className="relative rounded-3xl border border-[#1d1d24] bg-[#0b0b0d] shadow-2xl p-5 md:p-6">
              <button
                onClick={() => {
                  useFleetStore.getState().setShowToolSetupModal(false)
                  if (!toolSetupCompleted) {
                    void useFleetStore.getState().setToolSetupCompleted(true)
                  }
                }}
                className="absolute right-5 top-5 rounded-full p-2 text-zinc-500 hover:bg-[#1a1a20] hover:text-white transition-colors"
                title="Close setup"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <ToolSetupChecklist
                variant={showToolSetupModal ? 'settings' : 'setup'}
                onClose={() => useFleetStore.getState().setShowToolSetupModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      <NotificationToast />
    </div>
  )
}

export default App

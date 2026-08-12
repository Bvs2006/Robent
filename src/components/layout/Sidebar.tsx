import { useFleetStore } from '../../store/fleetStore'
import {
  LayoutDashboard, Clock, Settings, Zap, ChevronRight, BookOpen, FolderOpen, Plus, Wrench
} from 'lucide-react'
import type { PageId } from '../../types'

const navItems: { id: PageId; label: string; icon: any }[] = [
  { id: 'dashboard', label: 'Board', icon: LayoutDashboard },
  { id: 'sessions', label: 'Sessions', icon: Clock },
  { id: 'projects', label: 'Projects', icon: FolderOpen },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  const currentPage = useFleetStore((s) => s.currentPage)
  const setCurrentPage = useFleetStore((s) => s.setCurrentPage)
  const setShowNewTaskModal = useFleetStore((s) => s.setShowNewTaskModal)
  const setToolSetupCompleted = useFleetStore((s) => s.setToolSetupCompleted)
  const tasks = useFleetStore((s) => s.tasks)
  const workers = useFleetStore((s) => s.workers)

  const runningCount = workers.filter(w => w.status === 'running').length
  const reviewCount  = tasks.filter(t => t.status === 'review').length

  return (
    <div className="w-[200px] shrink-0 bg-[#0c0c0e] border-r border-[#1a1a1f] flex flex-col h-full select-none">
      
      {/* Logo */}
      <div className="px-4 pt-10 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-sm tracking-tight">Robent</div>
            <div className="text-[10px] text-zinc-500 font-mono">Agent Orchestrator</div>
          </div>
        </div>
      </div>

      {/* Status Pill */}
      <div className="px-3 mb-4">
        <div className="bg-[#111115] border border-[#1f1f25] rounded-lg px-3 py-2 space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-zinc-500">Running</span>
            <span className="text-emerald-400 font-bold font-mono">{runningCount}</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-zinc-500">In Review</span>
            <span className="text-amber-400 font-bold font-mono">{reviewCount}</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-3 border-t border-[#1a1a1f] mb-3" />

      {/* Primary actions */}
      <div className="px-2 mb-3 space-y-1">
        <button
          onClick={() => setShowNewTaskModal(true)}
          className="w-full flex items-center gap-2.5 rounded-lg bg-sky-500 px-3 py-2 text-xs font-bold text-white hover:bg-sky-400 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          New Task
        </button>
        <button
          onClick={() => setToolSetupCompleted(false)}
          className="w-full flex items-center gap-2.5 rounded-lg border border-[#24242b] bg-[#111115] px-3 py-2 text-xs font-semibold text-zinc-300 hover:bg-[#17171c] hover:text-white transition-colors"
        >
          <Wrench className="w-3.5 h-3.5 text-zinc-500" />
          Tool Setup
        </button>
      </div>

      {/* Divider */}
      <div className="mx-3 border-t border-[#1a1a1f] mb-3" />

      {/* Nav */}
      <nav className="flex-1 px-2 space-y-0.5">
        {navItems.map(({ id, label, icon: Icon }) => {
          const active = currentPage === id
          return (
            <button
              key={id}
              onClick={() => setCurrentPage(id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                active
                  ? 'bg-[#1c1c22] text-white border border-[#2a2a32]'
                  : 'text-zinc-500 hover:text-zinc-200 hover:bg-[#141418]'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-sky-400' : 'text-zinc-600'}`} />
                {label}
              </span>
              {active && <ChevronRight className="w-3 h-3 text-zinc-600" />}
            </button>
          )
        })}
      </nav>

      {/* Divider */}
      <div className="mx-3 border-t border-[#1a1a1f] mb-2" />

      {/* Bottom status */}
      <div className="px-3 pb-4 space-y-1">
        <div className="flex items-center gap-2 px-2 py-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
          <span className="text-[11px] text-zinc-400 font-mono">LOCAL</span>
        </div>
        <div className="flex items-center gap-2 px-2 py-1 text-[10px] text-zinc-600">
          <BookOpen className="w-3 h-3" />
          <span>v0.2.0 — PRD complete</span>
        </div>
      </div>

    </div>
  )
}

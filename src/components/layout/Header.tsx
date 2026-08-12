import { useFleetStore } from '../../store/fleetStore'
import { Plus, Square, Shield, ShieldOff, Zap, FolderOpen, ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

export default function Header() {
  const setShowNewTaskModal = useFleetStore((s) => s.setShowNewTaskModal)
  const killAll = useFleetStore((s) => s.killAll)
  const approvalMode = useFleetStore((s) => s.approvalMode)
  const setApprovalMode = useFleetStore((s) => s.setApprovalMode)
  const workers = useFleetStore((s) => s.workers)
  const tasks = useFleetStore((s) => s.tasks)
  const projects = useFleetStore((s) => s.projects)
  const currentProject = useFleetStore((s) => s.currentProject)
  const setActiveProject = useFleetStore((s) => s.setActiveProject)
  const runningCount = workers.filter(w => w.status === 'running').length
  const totalTokens = tasks.reduce((acc, t) => acc + (t.tokenCount || 0), 0)
  const totalCost = tasks.reduce((acc, t) => acc + (t.estimatedCost || 0), 0)
  const [showProjectPicker, setShowProjectPicker] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  // Close picker on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowProjectPicker(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const projectName = currentProject?.name || 'No project'
  const projectPath = currentProject?.path || ''

  return (
    <div className="h-11 bg-[#0c0c0e] border-b border-[#1a1a1f] flex items-center justify-between px-4 shrink-0 relative">
      
      {/* Left: Project selector */}
      <div className="relative" ref={pickerRef}>
        <button
          onClick={() => setShowProjectPicker(!showProjectPicker)}
          className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg hover:bg-[#141418] transition-colors group"
        >
          <FolderOpen className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span className="text-zinc-300 font-medium max-w-[180px] truncate">{projectName}</span>
          {projectPath && <span className="text-zinc-600 hidden md:inline truncate max-w-[120px]">· {projectPath.split(/[\\/]/).pop()}</span>}
          <ChevronDown className="w-3 h-3 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
        </button>

        {showProjectPicker && (
          <div className="absolute top-full left-0 mt-1 w-72 bg-[#111114] border border-[#2a2a32] rounded-xl shadow-2xl z-50 overflow-hidden">
            <div className="px-3 py-2 border-b border-[#1e1e24]">
              <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Switch Project</p>
            </div>
            {projects.length === 0 ? (
              <div className="px-4 py-4 text-xs text-zinc-600 text-center">No projects — add one in Projects</div>
            ) : (
              <div className="py-1">
                {projects.map(p => (
                  <button
                    key={p.id}
                    onClick={() => { setActiveProject(p.id); setShowProjectPicker(false) }}
                    className={`w-full text-left px-3 py-2.5 flex items-center gap-2.5 hover:bg-[#1a1a22] transition-colors ${p.isActive ? 'bg-purple-950/20' : ''}`}
                  >
                    <FolderOpen className={`w-3.5 h-3.5 shrink-0 ${p.isActive ? 'text-purple-400' : 'text-zinc-600'}`} />
                    <div className="min-w-0">
                      <div className={`text-xs font-semibold truncate ${p.isActive ? 'text-purple-300' : 'text-zinc-300'}`}>{p.name}</div>
                      <div className="text-[10px] text-zinc-600 font-mono truncate">{p.path}</div>
                    </div>
                    {p.isActive && <span className="ml-auto text-[9px] text-purple-400 font-bold uppercase tracking-wider shrink-0">Active</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">

        {/* Cost & tokens meter */}
        {totalTokens > 0 && (
          <div className="hidden md:flex items-center gap-1.5 bg-[#111115] border border-[#1f1f25] rounded-md px-2.5 py-1 text-[11px] text-zinc-400">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>{(totalTokens / 1000).toFixed(1)}k tok</span>
            <span className="text-zinc-600">·</span>
            <span className="text-amber-400 font-mono">${totalCost.toFixed(3)}</span>
          </div>
        )}

        {/* Running badge */}
        {runningCount > 0 && (
          <div className="flex items-center gap-1.5 bg-emerald-950/50 border border-emerald-800/50 rounded-md px-2.5 py-1 text-[11px] text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            {runningCount} running
          </div>
        )}

        {/* Approval mode toggle */}
        <button
          onClick={() => setApprovalMode(!approvalMode)}
          className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-md border transition-colors ${
            approvalMode
              ? 'bg-amber-950/40 border-amber-800/50 text-amber-400'
              : 'border-[#1f1f25] text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
          }`}
          title={approvalMode ? 'Ask before running (ON)' : 'Auto-allow (OFF)'}
        >
          {approvalMode ? <Shield className="w-3 h-3" /> : <ShieldOff className="w-3 h-3" />}
          {approvalMode ? 'Ask' : 'Auto'}
        </button>

        {/* Kill all */}
        {runningCount > 0 && (
          <button
            onClick={killAll}
            className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-md bg-red-950/50 border border-red-800/50 text-red-400 hover:bg-red-900/60 transition-colors"
            title="Kill all running agents"
          >
            <Square className="w-3 h-3" />
            Kill All
          </button>
        )}

        {/* New task */}
        <button
          onClick={() => setShowNewTaskModal(true)}
          className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-md bg-sky-500 hover:bg-sky-400 text-white font-semibold transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          New Task
        </button>
      </div>
    </div>
  )
}

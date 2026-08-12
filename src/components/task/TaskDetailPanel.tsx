import { X, Terminal, GitBranch, Folder, CheckCircle2, XCircle, Play, Swords, FileCode, Coins, Trash2, RotateCcw, Clock, ExternalLink } from 'lucide-react'
import { useFleetStore } from '../../store/fleetStore'
import { AGENT_CONFIGS, ALL_AGENTS } from '../../types'
import type { AgentName } from '../../types'

const fmt = (s?: number) => s ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` : '—'

export const TaskDetailPanel = () => {
  const { selectedTaskId, tasks, selectTask, openTerminal, sendAgentFeedback, mergeTask, discardTask, startTask, startRace, openDiff, activities, startPreviewServer, previewPorts } = useFleetStore()
  const task = tasks.find(t => t.id === selectedTaskId)
  if (!task) return null

  const cfg = AGENT_CONFIGS[task.agent] || AGENT_CONFIGS['Aider']
  const taskActivities = activities.filter(a => a.taskId === task.id).slice(0, 8)
  const raceAgents: AgentName[] = ALL_AGENTS.filter(a => a !== task.agent).slice(0, 1) as AgentName[]
  const previewPort = previewPorts[task.id]

  return (
    <div className="fixed right-0 top-0 h-full w-[400px] bg-[#0e0e12] border-l border-[#1a1a20] z-40 flex flex-col shadow-2xl slide-panel">

      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b border-[#1a1a20]">
        <div className="min-w-0 pr-2">
          <div className="text-[10px] font-mono text-zinc-600 mb-0.5">{task.id}</div>
          <h2 className="text-sm font-bold text-white line-clamp-2">{task.title}</h2>
        </div>
        <button onClick={() => selectTask(null)} className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-[#1f1f25] transition-colors shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* Status row */}
        <div className="flex items-center justify-between bg-[#131318] border border-[#1e1e26] rounded-xl p-3">
          <span className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold">Status</span>
          <div className="flex items-center gap-1.5">
            {task.status === 'working' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />}
            <span className={`text-xs font-bold uppercase ${
              task.status === 'working' ? 'text-emerald-400' :
              task.status === 'review'  ? 'text-amber-400' :
              task.status === 'done'    ? 'text-blue-400' :
              task.status === 'assigned' ? 'text-purple-400' : 'text-zinc-400'
            }`}>{task.status}</span>
          </div>
        </div>

        {/* Agent */}
        <div>
          <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1.5">Agent</label>
          <div className={`flex items-center gap-2 p-2.5 rounded-xl border ${cfg.bg} ${cfg.border}`}>
            <span>{cfg.dot}</span>
            <span className={`text-xs font-bold ${cfg.color}`}>{task.agent}</span>
            {task.status === 'working' && (
              <div className="ml-auto flex items-center gap-2 text-[11px] text-zinc-400">
                <Clock className="w-3 h-3" />
                {fmt(task.runtime)}
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <div>
            <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1.5">Description</label>
            <p className="text-[11px] text-zinc-400 bg-[#131318] border border-[#1e1e26] rounded-xl p-3 leading-relaxed">{task.description}</p>
          </div>
        )}

        {/* Cost / Tokens */}
        {(task.tokenCount || 0) > 0 && (
          <div className="bg-[#131318] border border-[#1e1e26] rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
              <Coins className="w-3.5 h-3.5" />
              <span>{((task.tokenCount || 0) / 1000).toFixed(1)}k tokens used</span>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400">${(task.estimatedCost || 0).toFixed(4)}</span>
          </div>
        )}

        {/* Worktree */}
        {task.worktree && (
          <div>
            <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1.5">Worktree</label>
            <div className="flex items-center gap-2 bg-[#131318] border border-[#1e1e26] rounded-xl p-2.5 text-[11px] font-mono text-zinc-400">
              <Folder className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
              <span className="truncate">{task.worktree}</span>
            </div>
          </div>
        )}

        {/* Branch */}
        {task.branch && (
          <div>
            <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1.5">Branch</label>
            <div className="flex items-center gap-2 bg-[#131318] border border-[#1e1e26] rounded-xl p-2.5 text-[11px] font-mono text-zinc-400">
              <GitBranch className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
              <span>{task.branch}</span>
            </div>
          </div>
        )}

        {/* PR + CI */}
        {task.prNumber && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1.5">Pull Request</label>
              <div className="bg-[#131318] border border-[#1e1e26] rounded-xl p-2.5 text-[11px] font-mono font-bold text-sky-400">
                #{task.prNumber}
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1.5">CI Status</label>
              <div className={`bg-[#131318] border border-[#1e1e26] rounded-xl p-2.5 text-[11px] font-bold flex items-center gap-1 ${task.ciStatus === 'passing' ? 'text-emerald-400' : 'text-red-400'}`}>
                {task.ciStatus === 'passing' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                {task.ciStatus === 'passing' ? 'Passing' : 'Failed'}
              </div>
            </div>
          </div>
        )}

        {/* Diff preview button */}
        {task.diff && (
          <button onClick={() => openDiff(task.id)}
            className="w-full py-2 bg-[#131318] hover:bg-[#1a1a22] border border-[#1e1e26] text-zinc-300 text-[11px] font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors">
            <FileCode className="w-3.5 h-3.5 text-zinc-500" />
            View Diff
          </button>
        )}

        {/* Primary actions */}
        <div className="space-y-2 pt-1">
          {(task.status === 'planned' || task.status === 'assigned') && (
            <>
              <button onClick={() => startTask(task.id)}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors">
                <Play className="w-3.5 h-3.5 fill-current" /> Start Agent
              </button>
              <button onClick={() => startRace(task.id, [task.agent, ...raceAgents])}
                className="w-full py-2 bg-[#131318] hover:bg-[#1a1a22] border border-[#1e1e26] text-zinc-300 text-[11px] font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors">
                <Swords className="w-3.5 h-3.5 text-purple-400" /> Race Mode
              </button>
            </>
          )}

          {task.status === 'working' && (
            <button onClick={() => openTerminal(task.id)}
              className="w-full py-2.5 bg-sky-950/60 hover:bg-sky-900/80 border border-sky-800/60 text-sky-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors">
              <Terminal className="w-3.5 h-3.5" /> Open Terminal
            </button>
          )}

          {task.status === 'review' && (
            <>
              {/* Preview Server */}
              <div>
                <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1.5">Preview</label>
                {previewPort ? (
                  <a href={`http://localhost:${previewPort}`} target="_blank" rel="noopener noreferrer"
                    className="w-full py-2 bg-[#131318] hover:bg-[#1a1a22] border border-[#1e1e26] text-sky-300 text-[11px] font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" />
                    localhost:{previewPort}
                  </a>
                ) : (
                  <button onClick={() => startPreviewServer(task.id)}
                    className="w-full py-2 bg-[#131318] hover:bg-[#1a1a22] border border-[#1e1e26] text-zinc-300 text-[11px] font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors">
                    <Play className="w-3.5 h-3.5" /> Start Preview Server
                  </button>
                )}
              </div>

              {/* Review Actions */}
              {task.ciStatus === 'failed' && (
                <button onClick={() => sendAgentFeedback(task.id)}
                  className="w-full py-2.5 bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors">
                  <RotateCcw className="w-3.5 h-3.5" /> Request Changes
                </button>
              )}

              {task.ciStatus === 'passing' && (
                <>
                  <button onClick={() => mergeTask(task.id)}
                    className="w-full py-2.5 bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Merge
                  </button>
                  <button onClick={() => discardTask(task.id)}
                    className="w-full py-2 bg-[#131318] hover:bg-red-950/50 border border-[#1e1e26] hover:border-red-800/50 text-zinc-500 hover:text-red-400 text-[11px] font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" /> Discard Worktree
                  </button>
                </>
              )}
            </>
          )}
        </div>

        {/* Activity log */}
        {taskActivities.length > 0 && (
          <div className="pt-2 border-t border-[#1a1a20]">
            <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-3">Activity</label>
            <div className="space-y-2.5 pl-3 border-l border-[#222228]">
              {taskActivities.map(a => (
                <div key={a.id} className="relative pl-3">
                  <span className="absolute -left-[17px] top-1 w-2 h-2 rounded-full bg-zinc-700" />
                  <div className="text-[10px] text-zinc-600 font-mono mb-0.5">{a.timestamp}</div>
                  <p className="text-[11px] text-zinc-400">{a.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

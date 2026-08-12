import { GitBranch, Terminal, CheckCircle2, XCircle, Play, Swords, FileCode, Coins } from 'lucide-react'
import { useFleetStore } from '../../store/fleetStore'
import { AGENT_CONFIGS, ALL_AGENTS } from '../../types'
import type { Task, AgentName } from '../../types'

const fmt = (s?: number) => {
  if (!s) return '0:00'
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

const fmtCost = (c?: number) => c ? `$${c.toFixed(3)}` : null

export const KanbanCard = ({ task }: { task: Task }) => {
  const { selectTask, openTerminal, sendAgentFeedback, startTask, startRace, openDiff } = useFleetStore()
  const cfg = AGENT_CONFIGS[task.agent] || AGENT_CONFIGS['Aider']

  const raceAgents: AgentName[] = ALL_AGENTS.filter(a => a !== task.agent).slice(0, 1) as AgentName[]

  return (
    <div
      onClick={() => selectTask(task.id)}
      className="group bg-[#141418] hover:bg-[#1a1a20] border border-[#222229] hover:border-[#33333d] rounded-xl p-3 cursor-pointer transition-all duration-150 relative overflow-hidden"
    >
      {/* Status accent bar */}
      {task.status === 'working' && <div className="absolute left-0 inset-y-0 w-0.5 bg-emerald-500 rounded-l-xl" />}
      {task.status === 'review' && task.ciStatus === 'failed' && <div className="absolute left-0 inset-y-0 w-0.5 bg-red-500 rounded-l-xl" />}
      {task.status === 'review' && task.ciStatus === 'passing' && <div className="absolute left-0 inset-y-0 w-0.5 bg-amber-500 rounded-l-xl" />}

      {/* Header row */}
      <div className="flex items-start justify-between mb-2">
        <span className="text-[10px] font-mono text-zinc-600">{task.id}</span>
        <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border ${
          task.priority === 'critical' ? 'text-red-400 border-red-800 bg-red-950/40' :
          task.priority === 'high'     ? 'text-orange-400 border-orange-800 bg-orange-950/40' :
          task.priority === 'low'      ? 'text-zinc-500 border-zinc-800 bg-zinc-900' :
          'text-zinc-400 border-zinc-800 bg-zinc-900'
        }`}>{task.priority}</span>
      </div>

      {/* Title */}
      <h4 className="text-[13px] font-semibold text-zinc-100 leading-snug mb-2.5 group-hover:text-white transition-colors line-clamp-2">
        {task.title}
      </h4>

      {/* Agent chip */}
      <div className={`flex items-center gap-1.5 rounded-lg px-2 py-1 mb-2 border text-[11px] ${cfg.bg} ${cfg.border}`}>
        <span>{cfg.dot}</span>
        <span className={`font-semibold ${cfg.color}`}>{task.agent}</span>
        {task.status === 'working' && (
          <span className="ml-auto flex items-center gap-1 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            {fmt(task.runtime)}
          </span>
        )}
      </div>

      {/* Token / Cost meter */}
      {(task.tokenCount || 0) > 0 && (
        <div className="flex items-center gap-1 text-[10px] text-zinc-600 mb-2">
          <Coins className="w-3 h-3" />
          <span>{((task.tokenCount || 0) / 1000).toFixed(1)}k tokens</span>
          {fmtCost(task.estimatedCost) && <span className="text-amber-500 font-mono ml-1">{fmtCost(task.estimatedCost)}</span>}
        </div>
      )}

      {/* Branch */}
      {task.branch && (
        <div className="flex items-center gap-1 text-[10px] text-zinc-600 mb-2.5 font-mono truncate">
          <GitBranch className="w-3 h-3 shrink-0" />
          <span className="truncate">{task.branch}</span>
        </div>
      )}

      {/* Action footer */}
      <div className="pt-2 border-t border-[#1e1e26] flex items-center gap-1.5">

        {(task.status === 'planned' || task.status === 'assigned') && (
          <>
            <button onClick={(e) => { e.stopPropagation(); startTask(task.id) }}
              className="flex-1 py-1.5 bg-[#1d1d24] hover:bg-[#252530] text-zinc-300 text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors border border-zinc-800">
              <Play className="w-3 h-3 fill-current text-emerald-400" /> Start
            </button>
            <button onClick={(e) => { e.stopPropagation(); startRace(task.id, [task.agent, ...raceAgents]) }}
              className="py-1.5 px-2 bg-[#1d1d24] hover:bg-[#252530] text-zinc-400 text-[11px] rounded-lg border border-zinc-800 transition-colors"
              title="Race Mode">
              <Swords className="w-3 h-3" />
            </button>
          </>
        )}

        {task.status === 'working' && (
          <>
            <button onClick={(e) => { e.stopPropagation(); openTerminal(task.id) }}
              className="flex-1 py-1.5 bg-sky-950/40 hover:bg-sky-900/60 border border-sky-800/50 text-sky-400 text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors">
              <Terminal className="w-3 h-3" /> Terminal
            </button>
            <button onClick={(e) => { e.stopPropagation(); startRace(task.id, [task.agent, ...raceAgents]) }}
              className="py-1.5 px-2 bg-[#1d1d24] hover:bg-[#252530] text-zinc-400 text-[11px] rounded-lg border border-zinc-800 transition-colors" title="Race Mode">
              <Swords className="w-3 h-3" />
            </button>
          </>
        )}

        {task.status === 'review' && task.ciStatus === 'failed' && (
          <button onClick={(e) => { e.stopPropagation(); sendAgentFeedback(task.id) }}
            className="flex-1 py-1.5 bg-red-950/50 hover:bg-red-900/60 border border-red-800/50 text-red-300 text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors">
            <XCircle className="w-3 h-3" /> CI Failed — Retry
          </button>
        )}

        {task.status === 'review' && task.ciStatus === 'passing' && (
          <>
            <span className="text-[11px] text-zinc-400 font-mono">PR #{task.prNumber}</span>
            <button onClick={(e) => { e.stopPropagation(); openDiff(task.id) }}
              className="ml-auto py-1.5 px-2 bg-[#1d1d24] hover:bg-[#252530] text-zinc-400 text-[11px] rounded-lg border border-zinc-800 transition-colors" title="View diff">
              <FileCode className="w-3 h-3" />
            </button>
            <span className="text-[11px] text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Passing
            </span>
          </>
        )}

        {task.status === 'done' && (
          <span className="text-[11px] text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Merged · PR #{task.prNumber}
          </span>
        )}
      </div>
    </div>
  )
}

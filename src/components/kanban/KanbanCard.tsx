import { Terminal, CheckCircle2, XCircle, Play, FileCode, Trash2 } from 'lucide-react'
import { useFleetStore } from '../../store/fleetStore'
import { AGENT_CONFIGS } from '../../types'
import type { Task } from '../../types'

const fmt = (s?: number) => {
  if (!s) return '0:00'
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export const KanbanCard = ({ task }: { task: Task }) => {
  const {
    selectTask, openTerminal, sendAgentFeedback, startTask, openDiff, deleteTask,
    approvePlan, updateSubtaskAgent, respondCommandApproval, pendingCommandApprovals,
  } = useFleetStore()
  const cfg = AGENT_CONFIGS[task.agent] || AGENT_CONFIGS['Aider']
  const pendingApproval = pendingCommandApprovals[task.id]



  const handleDelete = (e: { stopPropagation: () => void }) => {
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to delete this task?')) return
    void deleteTask(task.id)
  }

  return (
    <div
      onClick={() => selectTask(task.id)}
      className="group bg-[#141418] hover:bg-[#1a1a20] border border-[#222229] hover:border-[#33333d] rounded-xl p-3 cursor-pointer transition-all duration-150 relative overflow-hidden space-y-2.5"
    >
      {/* Status accent bar */}
      {task.status === 'working' && <div className="absolute left-0 inset-y-0 w-0.5 bg-emerald-500 rounded-l-xl" />}
      {task.status === 'review' && task.ciStatus === 'failed' && <div className="absolute left-0 inset-y-0 w-0.5 bg-red-500 rounded-l-xl" />}
      {task.status === 'review' && task.ciStatus === 'passing' && <div className="absolute left-0 inset-y-0 w-0.5 bg-amber-500 rounded-l-xl" />}

      {/* Real-time Command Approval Banner */}
      {pendingApproval && (
        <div onClick={(e) => e.stopPropagation()} className="bg-amber-950/60 border border-amber-600/70 rounded-lg p-2 space-y-1.5 animate-pulse">
          <div className="flex items-center justify-between text-[11px] font-bold text-amber-300">
            <span>⚠️ Command Approval Requested</span>
          </div>
          <p className="text-[10px] font-mono text-zinc-300 bg-[#0f0f12] p-1.5 rounded border border-amber-900/50 truncate">
            {pendingApproval.command}
          </p>
          <div className="flex items-center gap-1.5 pt-0.5">
            <button
              onClick={() => respondCommandApproval(task.id, pendingApproval.promptId, true)}
              className="flex-1 py-1 bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-[10px] rounded transition-colors"
            >
              Approve
            </button>
            <button
              onClick={() => respondCommandApproval(task.id, pendingApproval.promptId, false)}
              className="flex-1 py-1 bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 font-bold text-[10px] rounded transition-colors"
            >
              Deny
            </button>
          </div>
        </div>
      )}

      {/* Header row */}
      <div className="flex items-start justify-between mb-1">
        <span className="text-[10px] font-mono text-zinc-600">{task.id}</span>
        <div className="flex items-center gap-1">
          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded border border-purple-800/60 bg-purple-950/40 text-purple-300">
            {task.executionMode === 'custom' ? 'Custom' : 'Auto'}
          </span>
          <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border ${
            task.priority === 'critical' ? 'text-red-400 border-red-800 bg-red-950/40' :
            task.priority === 'high'     ? 'text-orange-400 border-orange-800 bg-orange-950/40' :
            task.priority === 'low'      ? 'text-zinc-500 border-zinc-800 bg-zinc-900' :
            'text-zinc-400 border-zinc-800 bg-zinc-900'
          }`}>{task.priority}</span>
        </div>
      </div>

      {/* Title */}
      <h4 className="text-[13px] font-semibold text-zinc-100 leading-snug group-hover:text-white transition-colors line-clamp-2">
        {task.title}
      </h4>

      {/* Blocked state pill */}
      {(task.isBlocked || task.blockedReason) && (
        <div className="px-2 py-1 bg-red-950/50 border border-red-800/60 rounded text-[10px] text-red-300 font-semibold truncate">
          {task.blockedReason || 'No selected tool fits this subtask'}
        </div>
      )}

      {/* Agent chip */}
      <div className={`flex items-center gap-1.5 rounded-lg px-2 py-1 border text-[11px] ${cfg.bg} ${cfg.border}`}>
        <span>{cfg.dot}</span>
        <span className={`font-semibold ${cfg.color}`}>{task.agent}</span>
        {task.status === 'working' && (
          <span className="ml-auto flex items-center gap-1 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            {fmt(task.runtime)}
          </span>
        )}
      </div>

      {/* Subtask Plan Breakdown with Rationale & Edit Controls */}
      <details className="text-[10px] text-zinc-500 bg-[#0f0f12] p-2 rounded-xl border border-[#1d1d24] space-y-2 group" onClick={(e) => e.stopPropagation()}>
        <summary className="cursor-pointer font-semibold text-zinc-300 flex items-center justify-between">
          <span className="text-[11px] font-bold text-sky-400">Subtask Plan ({task.subtasks?.length || 0})</span>
          <span className="text-[8px] group-open:rotate-180 transition-transform">▼</span>
        </summary>
        <div className="mt-2 pt-2 border-t border-[#1d1d24] space-y-2">
          {task.subtasks && task.subtasks.length > 0 ? (
            task.subtasks.map((st) => (
              <div key={st.id} className="bg-[#141418] border border-[#222229] rounded-lg p-2 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-[11px] truncate">{st.title}</span>
                  <span className={`text-[8px] px-1.5 py-0.5 rounded font-mono uppercase font-bold ${st.dependencyMode === 'sequential' ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'}`}>
                    {st.dependencyMode || 'parallel'}
                  </span>
                </div>
                {st.rationale && (
                  <p className="text-[10px] text-zinc-400 italic leading-tight">{st.rationale}</p>
                )}
                <div className="flex items-center justify-between text-[10px] pt-1 border-t border-[#1c1c22]">
                  <span className="text-zinc-500 font-mono">Assigned CLI:</span>
                  <select
                    value={st.assignedAgent || task.agent}
                    onChange={(e) => updateSubtaskAgent(task.id, st.id, e.target.value as any)}
                    className="bg-[#1a1a22] border border-[#2e2e38] text-purple-300 rounded px-1.5 py-0.5 text-[10px] font-semibold outline-none"
                  >
                    {['Claude Code', 'OpenCode', 'Codex', 'Aider', 'Antigravity'].map((agent) => (
                      <option key={agent} value={agent}>{agent}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))
          ) : (
            <div className="text-[10px] text-zinc-500">Auto driver assignment active</div>
          )}
        </div>
      </details>

      {/* Action footer */}
      <div className="pt-2 border-t border-[#1e1e26] flex items-center gap-1.5">
        {(task.status === 'planned' || task.status === 'assigned') && (
          <>
            {!task.planApproved && task.executionMode === 'custom' ? (
              <button
                onClick={(e) => { e.stopPropagation(); approvePlan(task.id) }}
                className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black text-[11px] font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <Play className="w-3 h-3 fill-current" /> Approve & Run
              </button>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); startTask(task.id) }}
                className="flex-1 py-1.5 bg-[#1d1d24] hover:bg-[#252530] text-zinc-300 text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors border border-zinc-800"
              >
                <Play className="w-3 h-3 fill-current text-emerald-400" /> Start
              </button>
            )}
            <button
              type="button"
              onClick={handleDelete}
              aria-label="Delete task"
              title="Delete task"
              className="py-1.5 px-2 bg-[#1d1d24] hover:bg-red-950/50 text-zinc-500 hover:text-red-400 text-[11px] rounded-lg border border-zinc-800 hover:border-red-800/50 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </>
        )}

        {task.status === 'working' && (
          <>
            <button onClick={(e) => { e.stopPropagation(); openTerminal(task.id) }}
              className="flex-1 py-1.5 bg-sky-950/40 hover:bg-sky-900/60 border border-sky-800/50 text-sky-400 text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors">
              <Terminal className="w-3 h-3" /> Terminal
            </button>
          </>
        )}

        {task.status === 'review' && task.ciStatus === 'failed' && (
          <div className="flex items-center gap-1.5 w-full">
            <button onClick={(e) => { e.stopPropagation(); sendAgentFeedback(task.id) }}
              className="flex-1 py-1.5 bg-red-950/50 hover:bg-red-900/60 border border-red-800/50 text-red-300 text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors">
              <XCircle className="w-3.5 h-3.5" /> Retry
            </button>
            <button onClick={(e) => { e.stopPropagation(); openTerminal(task.id) }}
              className="py-1.5 px-2 bg-[#1d1d24] hover:bg-[#252530] text-zinc-400 text-[11px] rounded-lg border border-zinc-800 transition-colors" title="View terminal logs">
              <Terminal className="w-3 h-3" />
            </button>
          </div>
        )}

        {task.status === 'review' && task.ciStatus !== 'failed' && (
          <>
            <span className="text-[11px] text-zinc-400 font-mono">{task.prNumber ? `Review #${task.prNumber}` : 'Ready'}</span>
            <button onClick={(e) => { e.stopPropagation(); openTerminal(task.id) }}
              className="ml-auto py-1.5 px-2 bg-[#1d1d24] hover:bg-[#252530] text-zinc-400 text-[11px] rounded-lg border border-zinc-800 transition-colors" title="View terminal logs">
              <Terminal className="w-3 h-3" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); openDiff(task.id) }}
              className="py-1.5 px-2 bg-[#1d1d24] hover:bg-[#252530] text-zinc-400 text-[11px] rounded-lg border border-zinc-800 transition-colors" title="View diff">
              <FileCode className="w-3 h-3" />
            </button>
            <span className="text-[11px] text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> {task.ciStatus === 'passing' ? 'Passing' : 'Review'}
            </span>
          </>
        )}

        {task.status === 'done' && (
          <div className="flex items-center justify-between w-full">
            <span className="text-[11px] text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Merged{task.prNumber ? ` · #${task.prNumber}` : ''}
            </span>
            <button onClick={(e) => { e.stopPropagation(); openTerminal(task.id) }}
              className="py-1 px-2 bg-[#1d1d24] hover:bg-[#252530] text-zinc-400 hover:text-white text-[11px] rounded-lg border border-zinc-800 transition-colors flex items-center gap-1" title="View terminal logs">
              <Terminal className="w-3 h-3" /> Logs
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

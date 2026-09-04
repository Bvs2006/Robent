import { X, Terminal, GitBranch, Folder, CheckCircle2, XCircle, Play, FileCode, Coins, Trash2, RotateCcw, Clock, ExternalLink, Square } from 'lucide-react'
import { useFleetStore } from '../../store/fleetStore'
import { AGENT_CONFIGS } from '../../types'
import type { AgentName } from '../../types'

const fmt = (s?: number) => s ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` : '—'

export const TaskDetailPanel = () => {
  const {
    selectedTaskId, tasks, selectTask, openTerminal, sendAgentFeedback, mergeTask, discardTask,
    startTask, stopTask, openDiff, activities, startPreviewServer, stopPreviewServer, previewPorts,
    deleteTask,
  } = useFleetStore()
  const task = tasks.find(t => t.id === selectedTaskId)
  if (!task) return null

  const cfg = AGENT_CONFIGS[task.agent] || AGENT_CONFIGS['Aider']
  const taskActivities = activities.filter(a => a.taskId === task.id).slice(0, 8)
  const readyAgents = useFleetStore.getState().toolStatuses
    .filter((t) => t.available)
    .map((t) => {
      if (t.toolId === 'claude-code') return 'Claude Code' as AgentName
      if (t.toolId === 'codex') return 'Codex' as AgentName
      if (t.toolId === 'opencode') return 'OpenCode' as AgentName
      if (t.toolId === 'antigravity') return 'Antigravity' as AgentName
      if (t.toolId === 'aider') return 'Aider' as AgentName
      return null
    })
    .filter(Boolean) as AgentName[]
  const previewPort = previewPorts[task.id]

  const handleDelete = () => {
    if (!window.confirm('Are you sure you want to delete this task?')) return
    void deleteTask(task.id)
  }

  return (
    <div className="fixed right-0 top-0 h-full w-[400px] bg-[#0e0e12] border-l border-[#1a1a20] z-40 flex flex-col shadow-2xl slide-panel">
      <div className="flex items-start justify-between p-4 border-b border-[#1a1a20]">
        <div className="min-w-0 pr-2">
          <div className="text-[10px] font-mono text-zinc-600 mb-0.5">{task.id}</div>
          <h2 className="text-sm font-bold text-white line-clamp-2">{task.title}</h2>
        </div>
        <button onClick={() => selectTask(null)} className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-[#1f1f25] transition-colors shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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

        {/* Execution Mode Toggle */}
        <div>
          <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1.5">Execution Mode</label>
          <div className="flex bg-[#131318] border border-[#1e1e26] p-1 rounded-xl gap-1">
            <button
              onClick={() => useFleetStore.getState().setTaskExecutionMode(task.id, 'auto')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                (task.executionMode || 'auto') === 'auto'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Auto
            </button>
            <button
              onClick={() => useFleetStore.getState().setTaskExecutionMode(task.id, 'custom')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                task.executionMode === 'custom'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Custom
            </button>
          </div>
        </div>

        {/* Custom Mode Tool Checklist */}
        {task.executionMode === 'custom' && (
          <div className="bg-[#131318] border border-[#1e1e26] rounded-xl p-3 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Selected Eligible Tools</div>
            <p className="text-[11px] text-zinc-500">Only installed & signed-in tools are selectable:</p>
            <div className="space-y-1.5 pt-1">
              {readyAgents.length === 0 ? (
                <div className="text-xs text-amber-400">No ready tools detected. Complete Tool Setup first.</div>
              ) : (
                readyAgents.map((agentName) => {
                  const currentPool = task.customAgentPool || readyAgents
                  const isChecked = currentPool.includes(agentName)
                  return (
                    <label key={agentName} className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          const nextPool = e.target.checked
                            ? [...new Set([...currentPool, agentName])]
                            : currentPool.filter((a) => a !== agentName)
                          useFleetStore.getState().setTaskCustomPool(task.id, nextPool)
                        }}
                        className="accent-purple-500 rounded border-zinc-700"
                      />
                      <span>{agentName}</span>
                    </label>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* Blocked Alert Banner if no tool fits */}
        {(task.isBlocked || task.blockedReason) && (
          <div className="rounded-xl border border-red-900/60 bg-red-950/30 p-3 space-y-1">
            <div className="text-xs font-bold text-red-400">No selected tool fits this subtask</div>
            <p className="text-[11px] text-red-200/80">
              {task.blockedReason || 'Adjust your selected tool pool in Custom mode or switch to Auto mode.'}
            </p>
          </div>
        )}

        {/* Real-time Command Approval Banner */}
        {useFleetStore.getState().pendingCommandApprovals[task.id] && (
          <div className="bg-amber-950/60 border border-amber-600/70 rounded-xl p-3 space-y-2 animate-pulse">
            <div className="flex items-center justify-between text-xs font-bold text-amber-300">
              <span>⚠️ Command Approval Requested</span>
            </div>
            <p className="text-[11px] font-mono text-zinc-300 bg-[#0f0f12] p-2 rounded border border-amber-900/50 truncate">
              {useFleetStore.getState().pendingCommandApprovals[task.id].command}
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => useFleetStore.getState().respondCommandApproval(task.id, useFleetStore.getState().pendingCommandApprovals[task.id].promptId, true)}
                className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs rounded transition-colors"
              >
                Approve
              </button>
              <button
                onClick={() => useFleetStore.getState().respondCommandApproval(task.id, useFleetStore.getState().pendingCommandApprovals[task.id].promptId, false)}
                className="flex-1 py-1.5 bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 font-bold text-xs rounded transition-colors"
              >
                Deny
              </button>
            </div>
          </div>
        )}

        {/* Collapsible Plan / Subtask Breakdown */}
        <details className="bg-[#131318] border border-[#1e1e26] rounded-xl p-3 group" open>
          <summary className="text-xs font-bold text-sky-400 cursor-pointer list-none flex items-center justify-between">
            <span>Subtask Plan ({task.subtasks?.length || 0})</span>
            <span className="text-[10px] text-zinc-500 group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <div className="mt-3 pt-3 border-t border-[#1e1e26] space-y-2">
            {task.subtasks && task.subtasks.length > 0 ? (
              task.subtasks.map((st) => (
                <div key={st.id} className="text-xs bg-[#0f0f12] p-2.5 rounded-lg border border-[#1c1c22] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-zinc-100">{st.title}</div>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase font-bold ${st.dependencyMode === 'sequential' ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'}`}>
                      {st.dependencyMode || 'parallel'}
                    </span>
                  </div>
                  {st.rationale && (
                    <p className="text-[11px] text-zinc-400 italic leading-tight">{st.rationale}</p>
                  )}
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#1a1a20]">
                    <span className="text-zinc-500 font-mono">Assigned CLI:</span>
                    <select
                      value={st.assignedAgent || task.agent}
                      onChange={(e) => useFleetStore.getState().updateSubtaskAgent(task.id, st.id, e.target.value as any)}
                      className="bg-[#181820] border border-[#2b2b36] text-purple-300 rounded px-2 py-0.5 text-xs font-semibold outline-none"
                    >
                      {['Claude Code', 'OpenCode', 'Codex', 'Aider', 'Antigravity'].map((agent) => (
                        <option key={agent} value={agent}>{agent}</option>
                      ))}
                    </select>
                  </div>
                  {st.status === 'blocked' && (
                    <div className="text-[10px] text-red-400 font-medium mt-1">No selected tool fits this subtask</div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-xs text-zinc-500">
                Coordinator auto-assigns subtasks based on availability, capability fit, quota headroom, and history.
              </div>
            )}
          </div>
        </details>

        {task.description && (
          <div>
            <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1.5">Description</label>
            <p className="text-[11px] text-zinc-400 bg-[#131318] border border-[#1e1e26] rounded-xl p-3 leading-relaxed">{task.description}</p>
          </div>
        )}

        {(task.tokenCount || 0) > 0 && (
          <div className="bg-[#131318] border border-[#1e1e26] rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
              <Coins className="w-3.5 h-3.5" />
              <span>{((task.tokenCount || 0) / 1000).toFixed(1)}k tokens used</span>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400">${(task.estimatedCost || 0).toFixed(4)}</span>
          </div>
        )}

        {task.worktree && (
          <div>
            <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1.5">Worktree</label>
            <div className="flex items-center gap-2 bg-[#131318] border border-[#1e1e26] rounded-xl p-2.5 text-[11px] font-mono text-zinc-400">
              <Folder className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
              <span className="truncate">{task.worktree}</span>
            </div>
          </div>
        )}

        {task.branch && (
          <div>
            <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1.5">Branch</label>
            <div className="flex items-center gap-2 bg-[#131318] border border-[#1e1e26] rounded-xl p-2.5 text-[11px] font-mono text-zinc-400">
              <GitBranch className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
              <span>{task.branch}</span>
            </div>
          </div>
        )}

        {task.prNumber && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1.5">Review</label>
              <div className="bg-[#131318] border border-[#1e1e26] rounded-xl p-2.5 text-[11px] font-mono font-bold text-sky-400">
                #{task.prNumber}
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1.5">CI Status</label>
              <div className={`bg-[#131318] border border-[#1e1e26] rounded-xl p-2.5 text-[11px] font-bold flex items-center gap-1 ${
                task.ciStatus === 'passing' ? 'text-emerald-400' :
                task.ciStatus === 'pending' ? 'text-amber-400' : 'text-red-400'
              }`}>
                {task.ciStatus === 'passing' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                {task.ciStatus || 'none'}
              </div>
            </div>
          </div>
        )}

        {task.failedTests && task.failedTests.length > 0 && (
          <div className="bg-red-950/20 border border-red-900/40 rounded-xl p-3 space-y-1">
            <div className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Failures</div>
            {task.failedTests.map((item) => (
              <div key={item} className="text-[11px] text-red-200/80 font-mono">{item}</div>
            ))}
          </div>
        )}

        {task.diff && (
          <button onClick={() => openDiff(task.id)}
            className="w-full py-2 bg-[#131318] hover:bg-[#1a1a22] border border-[#1e1e26] text-zinc-300 text-[11px] font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors">
            <FileCode className="w-3.5 h-3.5 text-zinc-500" />
            View Diff
          </button>
        )}

        <div className="space-y-2 pt-1">
          {(task.status === 'planned' || task.status === 'assigned') && (
            <>
              <button onClick={() => startTask(task.id)}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors">
                <Play className="w-3.5 h-3.5 fill-current" /> Start Agent
              </button>
              {task.status === 'planned' && (
                <button
                  type="button"
                  onClick={handleDelete}
                  aria-label="Delete task"
                  className="w-full py-2 bg-[#131318] hover:bg-red-950/50 border border-[#1e1e26] hover:border-red-800/50 text-zinc-500 hover:text-red-400 text-[11px] font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Task
                </button>
              )}
            </>
          )}

          {task.status === 'working' && (
            <>
              <button onClick={() => openTerminal(task.id)}
                className="w-full py-2.5 bg-sky-950/60 hover:bg-sky-900/80 border border-sky-800/60 text-sky-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors">
                <Terminal className="w-3.5 h-3.5" /> Open Terminal
              </button>
              <button onClick={() => stopTask(task.id)}
                className="w-full py-2 bg-red-950/50 hover:bg-red-900/60 border border-red-800/50 text-red-300 text-[11px] font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors">
                <Square className="w-3.5 h-3.5" /> Stop Agent
              </button>
            </>
          )}

          {task.status === 'review' && (
            <>
              <div>
                <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1.5">Preview</label>
                {previewPort ? (
                  <div className="space-y-2">
                    <button
                      onClick={() => window.electronAPI?.openExternal(`http://localhost:${previewPort}`)}
                      className="w-full py-2 bg-[#131318] hover:bg-[#1a1a22] border border-[#1e1e26] text-sky-300 text-[11px] font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors">
                      <ExternalLink className="w-3.5 h-3.5" />
                      localhost:{previewPort}
                    </button>
                    <button onClick={() => stopPreviewServer(task.id)}
                      className="w-full py-2 bg-[#131318] hover:bg-[#1a1a22] border border-[#1e1e26] text-zinc-400 text-[11px] font-semibold rounded-xl">
                      Stop Preview
                    </button>
                  </div>
                ) : (
                  <button onClick={() => startPreviewServer(task.id)}
                    className="w-full py-2 bg-[#131318] hover:bg-[#1a1a22] border border-[#1e1e26] text-zinc-300 text-[11px] font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors">
                    <Play className="w-3.5 h-3.5" /> Start Preview Server
                  </button>
                )}
              </div>

              <button
                onClick={() => {
                  const input = window.prompt('Enter instructions/feedback for the agent (leave blank to auto-submit check failures):', '')
                  if (input !== null) {
                    void sendAgentFeedback(task.id, input)
                  }
                }}
                className="w-full py-2.5 bg-amber-950/60 hover:bg-amber-900/80 border border-amber-800/60 text-amber-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Request Changes
              </button>

              <button onClick={() => openTerminal(task.id)}
                className="w-full py-2 bg-[#131318] hover:bg-[#1a1a22] border border-[#1e1e26] text-sky-300 text-[11px] font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors">
                <Terminal className="w-3.5 h-3.5" /> View Terminal Logs
              </button>

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

          {task.status === 'done' && (
            <button onClick={() => openTerminal(task.id)}
              className="w-full py-2 bg-[#131318] hover:bg-[#1a1a22] border border-[#1e1e26] text-sky-300 text-[11px] font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors">
              <Terminal className="w-3.5 h-3.5" /> View Terminal Logs
            </button>
          )}
        </div>

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

import { useRef, useEffect } from 'react'
import { X, Trophy, Swords } from 'lucide-react'
import { useFleetStore } from '../../store/fleetStore'
import { AGENT_CONFIGS } from '../../types'

export default function RaceModeView() {
  const { raceTaskId, raceEntries, closeRace, tasks, mergeTask } = useFleetStore()
  const task = tasks.find(t => t.id === raceTaskId)
  const entries = Object.values(raceEntries)

  const refs = useRef<Record<string, HTMLDivElement | null>>({})

  // Auto-scroll each pane
  useEffect(() => {
    for (const [agent, el] of Object.entries(refs.current)) {
      if (el && raceEntries[agent]) el.scrollTop = el.scrollHeight
    }
  }, [raceEntries])

  if (!raceTaskId) return null

  const allDone = entries.every(e => e.status !== 'running')

  return (
    <div className="flex flex-col h-full bg-[#09090b]">
      {/* Header */}
      <div className="h-11 border-b border-[#1a1a20] bg-[#0c0c0e] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2.5">
          <Swords className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-bold text-white">Race Mode</span>
          {task && <span className="text-xs text-zinc-500 ml-2">— {task.title}</span>}
        </div>
        <div className="flex items-center gap-2">
          {allDone && (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5" /> Race Complete — pick a winner
            </span>
          )}
          <button onClick={closeRace} className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-[#1f1f25] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Side-by-side panes */}
      <div className="flex flex-1 min-h-0 gap-0 divide-x divide-[#1a1a20]">
        {entries.map((entry) => {
          const cfg = AGENT_CONFIGS[entry.agent] || AGENT_CONFIGS['Aider']
          const isWinner = allDone && entry.status === 'done'
          return (
            <div key={entry.agent} className="flex-1 flex flex-col min-w-0">
              {/* Pane header */}
              <div className={`flex items-center justify-between px-3 py-2 border-b border-[#1a1a20] ${isWinner ? 'bg-emerald-950/20' : 'bg-[#0e0e12]'}`}>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{cfg.dot}</span>
                  <span className={`text-xs font-bold ${cfg.color}`}>{entry.agent}</span>
                  {isWinner && <Trophy className="w-3.5 h-3.5 text-yellow-400 ml-1" />}
                </div>
                <div className="flex items-center gap-2">
                  {entry.status === 'running' && (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> running
                    </span>
                  )}
                  {entry.status === 'done' && (
                    <span className="text-[11px] text-emerald-400 font-semibold">✓ done</span>
                  )}
                  {entry.status === 'failed' && (
                    <span className="text-[11px] text-red-400 font-semibold">✕ failed</span>
                  )}
                  {entry.tokenCount && (
                    <span className="text-[10px] text-amber-400 font-mono">${(entry.cost || 0).toFixed(3)}</span>
                  )}
                </div>
              </div>

              {/* Terminal output */}
              <div
                ref={el => { refs.current[entry.agent] = el }}
                className="flex-1 p-3 overflow-y-auto font-mono text-[12px] leading-relaxed whitespace-pre-wrap break-all text-zinc-300 bg-[#090909]"
              >
                {entry.output || <span className="text-zinc-700 italic">Waiting for output...</span>}
              </div>

              {/* Pick winner button */}
              {allDone && entry.status === 'done' && raceTaskId && (
                <div className="p-2 border-t border-[#1a1a20] bg-[#0e0e12]">
                  <button
                    onClick={() => { mergeTask(raceTaskId); closeRace() }}
                    className={`w-full py-2 text-[11px] font-bold rounded-lg transition-colors ${
                      isWinner
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-black'
                        : 'bg-[#1a1a22] hover:bg-[#22222a] text-zinc-300 border border-zinc-800'
                    }`}
                  >
                    {isWinner ? '🏆 Pick this implementation' : 'Use this instead'}
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

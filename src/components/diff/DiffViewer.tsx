import { X, FileCode } from 'lucide-react'
import { useFleetStore } from '../../store/fleetStore'

export default function DiffViewer() {
  const { diffTaskId, tasks, closeDiff, mergeTask, discardTask } = useFleetStore()
  const task = tasks.find(t => t.id === diffTaskId)
  if (!task) return null

  const diff = task.diff || '# No diff available\n# The agent may not have made file changes yet.'
  const lines = diff.split('\n')

  return (
    <div className="flex flex-col h-full bg-[#09090b]">
      {/* Header */}
      <div className="h-11 border-b border-[#1a1a20] bg-[#0c0c0e] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2.5">
          <FileCode className="w-4 h-4 text-sky-400" />
          <span className="text-sm font-bold text-white">Diff Viewer</span>
          <span className="text-xs text-zinc-500">— {task.title}</span>
          <span className="text-[10px] font-mono text-zinc-600 bg-[#131318] border border-[#1e1e26] px-2 py-0.5 rounded-md">
            {task.branch}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {task.ciStatus === 'passing' && (
            <>
              <button onClick={() => { mergeTask(task.id); closeDiff() }}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-lg transition-colors">
                Merge PR #{task.prNumber}
              </button>
              <button onClick={() => { discardTask(task.id); closeDiff() }}
                className="px-3 py-1.5 bg-[#1a1a22] hover:bg-red-950/50 border border-[#2a2a32] hover:border-red-800/50 text-zinc-400 hover:text-red-400 text-xs font-semibold rounded-lg transition-colors">
                Discard
              </button>
            </>
          )}
          <button onClick={closeDiff} className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-[#1f1f25] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Diff content */}
      <div className="flex-1 overflow-y-auto font-mono text-[12px] leading-6">
        {lines.map((line, i) => {
          let cls = 'text-zinc-500 bg-transparent'
          if (line.startsWith('+++') || line.startsWith('---')) cls = 'text-zinc-400 bg-[#111116]'
          else if (line.startsWith('+')) cls = 'text-emerald-400 bg-emerald-950/20'
          else if (line.startsWith('-')) cls = 'text-red-400 bg-red-950/20'
          else if (line.startsWith('@@')) cls = 'text-sky-400 bg-sky-950/20'
          return (
            <div key={i} className={`flex px-4 py-0.5 ${cls}`}>
              <span className="select-none w-8 shrink-0 text-zinc-700 text-right pr-4">{i + 1}</span>
              <span className="break-all whitespace-pre-wrap">{line || ' '}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

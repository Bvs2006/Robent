import { useFleetStore } from '../../store/fleetStore'
import { KanbanCard } from './KanbanCard'
import type { TaskStatus } from '../../types'

const COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'planned',  title: 'Planned',  color: 'bg-zinc-500' },
  { id: 'assigned', title: 'Assigned', color: 'bg-purple-500' },
  { id: 'working',  title: 'Working',  color: 'bg-emerald-500' },
  { id: 'review',   title: 'Review',   color: 'bg-amber-500' },
  { id: 'done',     title: 'Done',     color: 'bg-blue-500' },
]

export const KanbanBoard = () => {
  const { tasks } = useFleetStore()

  return (
    <div className="flex flex-row gap-3 p-4 overflow-x-auto flex-1 items-start h-full bg-[#09090b]">
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter(t => t.status === col.id)
        return (
          <div
            key={col.id}
            className="w-[295px] shrink-0 flex flex-col max-h-[calc(100vh-96px)] bg-[#0f0f12] border border-[#1c1c22] rounded-xl"
          >
            {/* Column header */}
            <div className="flex items-center justify-between px-3.5 py-3 border-b border-[#1c1c22]">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${col.color}`} />
                <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-widest">{col.title}</span>
              </div>
              <span className="text-[11px] font-mono text-zinc-500 bg-[#18181e] border border-[#222229] px-1.5 py-0.5 rounded-full">
                {colTasks.length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-2.5 p-2.5 overflow-y-auto flex-1">
              {colTasks.length === 0 ? (
                <div className="h-24 border border-dashed border-[#1e1e24] rounded-xl flex items-center justify-center text-[11px] text-zinc-700 font-mono">
                  empty
                </div>
              ) : (
                colTasks.map(task => <KanbanCard key={task.id} task={task} />)
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

import { KanbanBoard } from '../components/kanban/KanbanBoard';
import { TaskDetailPanel } from '../components/task/TaskDetailPanel';

export default function Dashboard() {
  return (
    <div className="flex flex-col h-full bg-[#0d0d0e] relative overflow-hidden flex-1">
      <KanbanBoard />
      <TaskDetailPanel />
    </div>
  );
}

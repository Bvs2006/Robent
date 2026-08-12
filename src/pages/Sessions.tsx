
import { useFleetStore } from '../store/fleetStore';
import PageHeader from '../components/layout/PageHeader';
import { Check, Circle } from 'lucide-react';

const formatRuntime = (s?: number) => {
  if (!s) return '—';
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}m ${String(sec).padStart(2, '0')}s`;
};

export default function Sessions() {
  const tasks = useFleetStore((state) => state.tasks) || [];
  const selectTask = useFleetStore((state) => state.selectTask);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'working':
        return <Circle className="w-3 h-3 text-[var(--color-fleet-green)] fill-current" />;
      case 'done':
        return <Check className="w-3 h-3 text-[var(--color-fleet-green)]" />;
      default:
        return <Circle className="w-3 h-3 text-[var(--color-fleet-text-muted)]" />;
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <PageHeader title="Sessions" description="All agent sessions" />
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[var(--color-fleet-surface)] text-xs uppercase tracking-wider text-[var(--color-fleet-text-muted)] font-medium">
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Task</th>
              <th className="px-4 py-3 text-left">Agent</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Runtime</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task: any) => (
              <tr 
                key={task.id} 
                className="border-b border-[var(--color-fleet-border)] hover:bg-[var(--color-fleet-surface)]/50 cursor-pointer"
                onClick={() => selectTask?.(task.id)}
              >
                <td className="px-4 py-3 text-sm font-mono text-[var(--color-fleet-text-muted)]">{task.id}</td>
                <td className="px-4 py-3 text-sm text-[var(--color-fleet-text)]">{task.title}</td>
                <td className="px-4 py-3 text-sm text-[var(--color-fleet-text)]">{task.agent}</td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(task.status)}
                    <span className="capitalize text-[var(--color-fleet-text)]">{task.status}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-[var(--color-fleet-text-muted)]">{formatRuntime(task.runtime)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

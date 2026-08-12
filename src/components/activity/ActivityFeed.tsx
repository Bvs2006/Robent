import { useFleetStore } from '../../store/fleetStore';
import { Check, Circle, ArrowUp, Plus, AlertTriangle, Activity } from 'lucide-react';

export default function ActivityFeed() {
  const activity = useFleetStore((state) => state.activities) || [];

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
      case 'ci_passed':
      case 'pr_merged':
        return <Check className="w-3.5 h-3.5 text-[var(--color-fleet-green)]" />;
      case 'pr_created':
      case 'pr_updated':
        return <ArrowUp className="w-3.5 h-3.5 text-[var(--color-fleet-blue)]" />;
      case 'agent_started':
        return <Plus className="w-3.5 h-3.5 text-[var(--color-fleet-yellow)]" />;
      case 'ci_failed':
      case 'error':
        return <AlertTriangle className="w-3.5 h-3.5 text-[var(--color-fleet-red)]" />;
      default:
        return <Circle className="w-3.5 h-3.5 text-[var(--color-fleet-text-muted)]" />;
    }
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full bg-[var(--color-fleet-surface)] border-l border-[var(--color-fleet-border)]">
      <div className="px-4 py-3 border-b border-[var(--color-fleet-border)] flex items-center gap-2">
        <Activity className="w-4 h-4 text-[var(--color-fleet-text-muted)]" />
        <h2 className="text-xs uppercase tracking-wider text-[var(--color-fleet-text-muted)] font-medium">
          Activity
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {activity.map((item: any) => (
          <div key={item.id} className="flex items-start gap-3 py-1.5 text-xs">
            <span className="text-[var(--color-fleet-text-muted)] font-mono w-14 shrink-0">
              {formatTime(item.timestamp)}
            </span>
            <div className="mt-0.5 shrink-0">
              {getIcon(item.type)}
            </div>
            <span className="text-[var(--color-fleet-text)] break-words leading-tight">
              {item.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

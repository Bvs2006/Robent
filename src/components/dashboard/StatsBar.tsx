import React from 'react';
import { useFleetStore } from '../../store/fleetStore';

export const StatsBar: React.FC = () => {
  const { tasks } = useFleetStore();

  const activeWorkers = tasks.filter(t => t.status === 'working').length;
  // Mocking other stats for now, or you could compute them
  const openPRs = tasks.filter(t => t.status === 'review').length;
  const ciPassing = tasks.filter(t => t.status === 'review' && t.ciStatus === 'passing').length;

  return (
    <div className="grid grid-cols-4 gap-4 px-6 py-4">
      <div className="bg-[var(--color-fleet-surface)] border border-[var(--color-fleet-border)] rounded-lg p-4">
        <h3 className="text-xs uppercase tracking-wider text-[var(--color-fleet-text-muted)] font-medium mb-2">Active Workers</h3>
        <div className="text-2xl font-semibold text-[var(--color-fleet-text)] mb-1">{activeWorkers}</div>
        <div className="text-xs text-green-500">● Running</div>
      </div>
      <div className="bg-[var(--color-fleet-surface)] border border-[var(--color-fleet-border)] rounded-lg p-4">
        <h3 className="text-xs uppercase tracking-wider text-[var(--color-fleet-text-muted)] font-medium mb-2">Worktrees</h3>
        <div className="text-2xl font-semibold text-[var(--color-fleet-text)] mb-1">3</div>
        <div className="text-xs text-green-500">● Active</div>
      </div>
      <div className="bg-[var(--color-fleet-surface)] border border-[var(--color-fleet-border)] rounded-lg p-4">
        <h3 className="text-xs uppercase tracking-wider text-[var(--color-fleet-text-muted)] font-medium mb-2">Open PRs</h3>
        <div className="text-2xl font-semibold text-[var(--color-fleet-text)] mb-1">{openPRs}</div>
        <div className="text-xs text-blue-400">↑ {openPRs} today</div>
      </div>
      <div className="bg-[var(--color-fleet-surface)] border border-[var(--color-fleet-border)] rounded-lg p-4">
        <h3 className="text-xs uppercase tracking-wider text-[var(--color-fleet-text-muted)] font-medium mb-2">CI Passing</h3>
        <div className="text-2xl font-semibold text-[var(--color-fleet-text)] mb-1">{ciPassing}</div>
        <div className="text-xs text-green-500">✓ Healthy</div>
      </div>
    </div>
  );
};

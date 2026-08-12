import { useState } from 'react';
import { useFleetStore } from '../store/fleetStore';
import PageHeader from '../components/layout/PageHeader';
import { Circle, XCircle } from 'lucide-react';
import CreateWorktreeModal from '../components/worktrees/CreateWorktreeModal';

export default function Worktrees() {
  const worktrees = useFleetStore((state) => state.worktrees) || [];
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Circle className="w-3 h-3 text-emerald-400 fill-current" />;
      case 'clean':
        return <Circle className="w-3 h-3 text-zinc-500" />;
      case 'removed':
        return <XCircle className="w-3 h-3 text-red-400" />;
      default:
        return <Circle className="w-3 h-3 text-zinc-500" />;
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <PageHeader 
        title="Worktrees" 
        description="Isolated environments for each worker"
      >
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#18181e] hover:bg-[#1c1c22] text-zinc-100 px-4 py-2 rounded-md border border-[#222229] text-sm font-medium transition-colors"
        >
          + Create Worktree
        </button>
      </PageHeader>
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#0f0f12] text-xs uppercase tracking-wider text-zinc-500 font-medium">
              <th className="px-4 py-3 text-left">Worker</th>
              <th className="px-4 py-3 text-left">Branch</th>
              <th className="px-4 py-3 text-left">Path</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Changes</th>
            </tr>
          </thead>
          <tbody>
            {worktrees.map((wt: any) => (
              <tr 
                key={wt.id} 
                className="border-b border-[#1c1c22] hover:bg-[#18181e]/50 cursor-pointer"
              >
                <td className="px-4 py-3 text-sm text-zinc-100">{wt.workerId}</td>
                <td className="px-4 py-3 text-sm font-mono text-purple-400">{wt.branch}</td>
                <td className="px-4 py-3 text-sm text-zinc-500">{wt.path}</td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(wt.status)}
                    <span className="capitalize text-zinc-100">{wt.status}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-zinc-500">
                  {wt.changes > 0 ? (
                    <span className="bg-[#18181e] px-2 py-0.5 rounded text-xs">
                      {wt.changes}
                    </span>
                  ) : '0'}
                </td>
              </tr>
            ))}
            {worktrees.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-zinc-500">
                  No active worktrees. Start a task to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {isModalOpen && <CreateWorktreeModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}
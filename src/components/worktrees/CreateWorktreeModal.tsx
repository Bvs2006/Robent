import { useState } from 'react';

export default function CreateWorktreeModal({ onClose }: { onClose: () => void }) {
  const [branchName, setBranchName] = useState('');
  const [baseBranch, setBaseBranch] = useState('main');

  const handleCreate = () => {
    alert('Worktree created');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[var(--color-fleet-bg)] border border-[var(--color-fleet-border)] rounded-lg p-6 w-96 shadow-lg">
        <h2 className="text-lg font-semibold text-[var(--color-fleet-text)] mb-4">Create Worktree</h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs text-[var(--color-fleet-text-muted)] mb-1.5 block">Branch Name</label>
            <input 
              type="text" 
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              className="bg-[var(--color-fleet-surface)] border border-[var(--color-fleet-border)] rounded-md px-3 py-2 text-sm text-[var(--color-fleet-text)] w-full focus:border-[var(--color-fleet-accent)] outline-none"
              placeholder="feature/new-agent"
            />
          </div>
          <div>
            <label className="text-xs text-[var(--color-fleet-text-muted)] mb-1.5 block">Base Branch</label>
            <select 
              value={baseBranch}
              onChange={(e) => setBaseBranch(e.target.value)}
              className="bg-[var(--color-fleet-surface)] border border-[var(--color-fleet-border)] rounded-md px-3 py-2 text-sm text-[var(--color-fleet-text)] w-full focus:border-[var(--color-fleet-accent)] outline-none"
            >
              <option value="main">main</option>
              <option value="develop">develop</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm text-[var(--color-fleet-text)] hover:text-[var(--color-fleet-text)]/80"
          >
            Cancel
          </button>
          <button 
            onClick={handleCreate}
            className="bg-[var(--color-fleet-accent)] text-white px-4 py-2 text-sm rounded hover:bg-[var(--color-fleet-accent)]/90"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

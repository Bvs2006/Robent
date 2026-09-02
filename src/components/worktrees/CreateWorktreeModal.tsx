import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { useFleetStore } from '../../store/fleetStore'

export default function CreateWorktreeModal({ onClose }: { onClose: () => void }) {
  const createWorktree = useFleetStore((s) => s.createWorktree)
  const currentProject = useFleetStore((s) => s.currentProject)
  const [branchName, setBranchName] = useState('')
  const [baseBranch, setBaseBranch] = useState('main')
  const [branches, setBranches] = useState<string[]>(['main'])
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    window.electronAPI?.listBranches(currentProject?.path).then((result) => {
      if (result?.all?.length) {
        setBranches(result.all)
        setBaseBranch(result.current || result.all[0])
      }
    })
  }, [currentProject?.path])

  const handleCreate = async () => {
    if (!branchName.trim()) return
    setBusy(true)
    await createWorktree(branchName.trim(), baseBranch)
    setBusy(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#121215] border border-[#27272a] rounded-lg p-6 w-96 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-zinc-100">Create Worktree</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white"><X className="w-4 h-4" /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-zinc-500 mb-1.5 block">Branch Name</label>
            <input
              type="text"
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              className="bg-[#18181b] border border-[#27272a] rounded-md px-3 py-2 text-sm text-zinc-100 w-full focus:border-sky-500 outline-none"
              placeholder="feature/new-agent"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1.5 block">Base Branch</label>
            <select
              value={baseBranch}
              onChange={(e) => setBaseBranch(e.target.value)}
              className="bg-[#18181b] border border-[#27272a] rounded-md px-3 py-2 text-sm text-zinc-100 w-full focus:border-sky-500 outline-none"
            >
              {branches.map((branch) => (
                <option key={branch} value={branch}>{branch}</option>
              ))}
            </select>
          </div>
          {!currentProject && (
            <p className="text-xs text-amber-400">Select an active project first.</p>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-zinc-400 hover:text-white">Cancel</button>
          <button
            onClick={handleCreate}
            disabled={!branchName.trim() || busy || !currentProject}
            className="bg-sky-500 text-white px-4 py-2 text-sm rounded hover:bg-sky-400 disabled:opacity-50"
          >
            {busy ? 'Creating…' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  )
}

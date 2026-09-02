import { FolderPlus } from 'lucide-react'
import { useFleetStore } from '../../store/fleetStore'
import ProjectSetupForm from './ProjectSetupForm'

export default function ProjectSetupModal() {
  const setShowProjectSetupModal = useFleetStore((s) => s.setShowProjectSetupModal)
  const pendingStartAfterProject = useFleetStore((s) => s.pendingStartAfterProject)
  const startAllTasks = useFleetStore((s) => s.startAllTasks)
  const addNotification = useFleetStore((s) => s.addNotification)

  const handleComplete = async () => {
    const ids = useFleetStore.getState().pendingStartAfterProject
    setShowProjectSetupModal(false)
    if (ids && ids.length > 0) {
      addNotification('success', 'Project ready — starting agents')
      await startAllTasks(ids)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-[#121215] border border-[#27272a] rounded-2xl w-[520px] max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
        <div className="flex items-center gap-2 mb-1">
          <FolderPlus className="w-5 h-5 text-sky-400" />
          <h2 className="text-lg font-bold text-white">Choose a project folder</h2>
        </div>
        <p className="text-xs text-zinc-500 mb-5">
          {pendingStartAfterProject?.length
            ? 'Agents need a project folder before they can run. Add an existing folder or create a new one.'
            : 'Add an existing folder or create a new project from scratch.'}
        </p>
        <ProjectSetupForm
          defaultMode="create"
          onCancel={() => setShowProjectSetupModal(false)}
          onComplete={handleComplete}
        />
      </div>
    </div>
  )
}

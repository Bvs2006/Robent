import { useFleetStore } from '../store/fleetStore';
import PageHeader from '../components/layout/PageHeader';
import ProjectSetupForm from '../components/common/ProjectSetupForm';
import { FolderOpen, Plus, Trash2, Globe, Check } from 'lucide-react';
import { useState } from 'react';
import type { Project } from '../types';

export default function Projects() {
  const { projects, deleteProject, setActiveProject, currentProject, setShowNewTaskModal } = useFleetStore();
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="w-full h-full flex flex-col overflow-y-auto bg-[#09090b]">
      <PageHeader 
        title="Projects" 
        description="Add an existing folder or create a new one — tasks run against the active project"
      >
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-zinc-950 text-xs font-semibold rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Add Project
        </button>
      </PageHeader>

      <div className="px-6 py-4 max-w-4xl">
        {currentProject && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-sky-800/40 bg-sky-950/20 px-4 py-3">
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-sky-500 mb-0.5">Active project</div>
              <div className="text-sm font-semibold text-sky-200 truncate">{currentProject.name}</div>
              <div className="text-[11px] font-mono text-zinc-500 truncate">{currentProject.path}</div>
            </div>
            <button
              onClick={() => setShowNewTaskModal(true)}
              className="shrink-0 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-zinc-950 text-xs font-bold transition-colors"
            >
              New task here
            </button>
          </div>
        )}

        {projects.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <p className="text-sm text-zinc-300 mb-1">No projects yet</p>
            <p className="text-xs text-zinc-500 mb-4 max-w-sm mx-auto">
              Add an existing code folder, or create a new folder and start your first task there.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-zinc-950 text-sm font-semibold rounded-lg"
            >
              Add Your First Project
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((project) => (
              <ProjectCard 
                key={project.id} 
                project={project}
                isActive={currentProject?.id === project.id}
                onSetActive={() => setActiveProject(project.id)}
                onDelete={() => deleteProject(project.id)}
              />
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[#121215] border border-[#27272a] rounded-2xl w-[520px] max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-lg font-bold text-white mb-1">Add Project</h2>
            <p className="text-xs text-zinc-500 mb-5">
              The project you add becomes active — new tasks run in that folder.
            </p>
            <ProjectSetupForm
              defaultMode="existing"
              onCancel={() => setShowAddModal(false)}
              onComplete={() => setShowAddModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface ProjectCardProps {
  project: Project;
  isActive: boolean;
  onSetActive: () => void;
  onDelete: () => void;
}

function ProjectCard({ project, isActive, onSetActive, onDelete }: ProjectCardProps) {
  return (
    <div 
      className={`bg-[#0f0f12] border rounded-xl p-4 transition-all ${
        isActive
          ? 'border-sky-500 bg-sky-950/10'
          : 'border-[#1c1c22] hover:bg-[#131318]'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FolderOpen className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-zinc-500'}`} />
          <h3 className={`font-semibold ${isActive ? 'text-sky-400' : 'text-zinc-200'}`}>
            {project.name}
          </h3>
          {isActive && (
            <span className="text-[10px] bg-sky-950/40 text-sky-400 px-1.5 py-0.5 rounded-full border border-sky-800/50">
              Active
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onSetActive}
            className={`p-1.5 text-xs rounded-lg transition-colors ${
              isActive
                ? 'bg-emerald-950/30 text-emerald-400'
                : 'bg-[#1a1a22] hover:bg-[#22222a] text-zinc-400 hover:text-white'
            }`}
            title={isActive ? 'Active project' : 'Set as active'}
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
            title="Delete project"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="text-xs font-mono text-zinc-500 break-all">{project.path}</div>
      {project.gitRemote && (
        <div className="flex items-center gap-1.5 mt-2 text-xs text-zinc-600">
          <Globe className="w-3 h-3" />
          <span>{project.gitRemote}</span>
        </div>
      )}
    </div>
  );
}

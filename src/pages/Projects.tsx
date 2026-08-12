import { useState } from 'react';
import { useFleetStore } from '../store/fleetStore';
import PageHeader from '../components/layout/PageHeader';
import { FolderOpen, Plus, Trash2, Globe, Check } from 'lucide-react';
import type { Project } from '../types';

export default function Projects() {
  const { projects, addProject, deleteProject, setActiveProject, currentProject } = useFleetStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectPath, setProjectPath] = useState('');
  const [gitRemote, setGitRemote] = useState('');

  const handleAddProject = async () => {
    if (!projectName.trim() || !projectPath.trim()) return;
    await addProject({ name: projectName, path: projectPath, gitRemote });
    setProjectName('');
    setProjectPath('');
    setGitRemote('');
    setShowAddModal(false);
  };

  const handleFolderSelect = async () => {
    // Use Electron dialog to pick folder
    if (window.electronAPI) {
      const result = await window.electronAPI.showOpenDialog?.();
      if (result?.filePaths?.[0]) {
        setProjectPath(result.filePaths[0]);
      }
    } else {
      // Fallback: just use the manual input
    }
  };

  return (
    <div className="w-full h-full flex flex-col overflow-y-auto bg-[#09090b]">
      <PageHeader 
        title="Projects" 
        description="Manage your project workspaces"
      >
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500 hover:bg-purple-400 text-white text-xs font-semibold rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Add Project
        </button>
      </PageHeader>

      <div className="px-6 py-4 max-w-4xl">
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <p className="text-sm text-zinc-500 mb-4">No projects added yet</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white text-sm font-semibold rounded-lg"
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
          <div className="bg-[#121215] border border-[#27272a] rounded-2xl w-[480px] p-6">
            <h2 className="text-lg font-bold text-white mb-4">Add New Project</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Project Name</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. My Web App"
                  className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Project Path</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={projectPath}
                    onChange={(e) => setProjectPath(e.target.value)}
                    placeholder="/path/to/project"
                    className="flex-1 bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
                  />
                  <button
                    onClick={handleFolderSelect}
                    className="px-3 bg-[#1a1a22] border border-[#27272a] hover:border-purple-500 text-zinc-400 hover:text-white rounded-lg text-xs font-semibold transition-colors"
                    title="Browse folders"
                  >
                    Browse
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Git Remote (optional)</label>
                <input
                  type="text"
                  value={gitRemote}
                  onChange={(e) => setGitRemote(e.target.value)}
                  placeholder="e.g. https://github.com/user/repo.git"
                  className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 bg-[#1a1a22] hover:bg-[#22222a] text-zinc-300 text-sm font-semibold rounded-lg border border-[#27272a]"
              >
                Cancel
              </button>
              <button
                onClick={handleAddProject}
                disabled={!projectName.trim() || !projectPath.trim()}
                className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white text-sm font-bold rounded-lg disabled:opacity-50"
              >
                Add Project
              </button>
            </div>
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
      className={`bg-[#0f0f12] border rounded-xl p-4 transition-all cursor-pointer ${
        isActive
          ? 'border-purple-500 bg-purple-950/10'
          : 'border-[#1c1c22] hover:bg-[#131318]'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FolderOpen className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-zinc-500'}`} />
          <h3 className={`font-semibold ${isActive ? 'text-purple-400' : 'text-zinc-200'}`}>
            {project.name}
          </h3>
          {isActive && (
            <span className="text-[10px] bg-purple-950/40 text-purple-400 px-1.5 py-0.5 rounded-full border border-purple-800/50">
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

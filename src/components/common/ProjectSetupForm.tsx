import { useState, useEffect } from 'react'
import { FolderOpen, FolderPlus, Loader2 } from 'lucide-react'
import { useFleetStore } from '../../store/fleetStore'

export type ProjectSetupMode = 'existing' | 'create'

function joinPath(parent: string, name: string): string {
  const trimmedParent = parent.replace(/[/\\]+$/, '')
  const sep = trimmedParent.includes('\\') ? '\\' : '/'
  return `${trimmedParent}${sep}${name.trim()}`
}

function folderBasename(path: string): string {
  const parts = path.replace(/[/\\]+$/, '').split(/[/\\]/)
  return parts[parts.length - 1] || ''
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'new-project'
}

export interface ProjectSetupFormProps {
  /** Suggested name when creating from a task title */
  suggestedName?: string
  defaultMode?: ProjectSetupMode
  submitLabel?: string
  onCancel?: () => void
  onComplete?: () => void | Promise<void>
  compact?: boolean
}

export default function ProjectSetupForm({
  suggestedName,
  defaultMode = 'create',
  submitLabel,
  onCancel,
  onComplete,
  compact = false,
}: ProjectSetupFormProps) {
  const addProject = useFleetStore((s) => s.addProject)
  const [mode, setMode] = useState<ProjectSetupMode>(defaultMode)
  const [projectName, setProjectName] = useState(suggestedName ? slugify(suggestedName) : '')
  const [projectPath, setProjectPath] = useState('')
  const [parentPath, setParentPath] = useState('')
  const [gitRemote, setGitRemote] = useState('')
  const [gitInit, setGitInit] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!suggestedName?.trim()) return
    setProjectName((prev) => (prev.trim() ? prev : slugify(suggestedName)))
  }, [suggestedName])

  const resolvedCreatePath =
    parentPath.trim() && projectName.trim() ? joinPath(parentPath, projectName) : ''

  const canSubmit =
    mode === 'existing'
      ? Boolean(projectName.trim() && projectPath.trim())
      : Boolean(projectName.trim() && parentPath.trim())

  const browseFolder = async (target: 'existing' | 'parent') => {
    if (!window.electronAPI?.showOpenDialog) {
      setError('Folder picker is only available in the desktop app')
      return
    }
    const result = await window.electronAPI.showOpenDialog()
    if (result?.canceled || !result?.filePaths?.[0]) return
    const selected = result.filePaths[0]
    if (target === 'existing') {
      setProjectPath(selected)
      if (!projectName.trim()) setProjectName(folderBasename(selected))
    } else {
      setParentPath(selected)
    }
    setError('')
  }

  const handleSubmit = async () => {
    if (!canSubmit || busy) return
    setBusy(true)
    setError('')
    try {
      if (mode === 'existing') {
        const ok = await addProject({
          name: projectName.trim(),
          path: projectPath.trim(),
          gitRemote: gitRemote.trim() || undefined,
          setActive: true,
        })
        if (!ok) {
          setError('Could not add that folder — check the path and try again')
          return
        }
      } else {
        const ok = await addProject({
          name: projectName.trim(),
          path: resolvedCreatePath,
          createIfMissing: true,
          gitInit,
          setActive: true,
        })
        if (!ok) {
          setError('Could not create the project folder')
          return
        }
      }
      await onComplete?.()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={compact ? 'space-y-3' : 'space-y-4'}>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => { setMode('existing'); setError('') }}
          className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all ${
            mode === 'existing'
              ? 'bg-sky-950/30 border-sky-500 text-white'
              : 'bg-[#18181b] border-[#27272a] text-zinc-400 hover:border-zinc-700'
          }`}
        >
          <FolderOpen className={`w-4 h-4 mt-0.5 shrink-0 ${mode === 'existing' ? 'text-sky-400' : ''}`} />
          <div>
            <div className="text-xs font-bold">Add existing folder</div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Use a repo or workspace you already have</div>
          </div>
        </button>
        <button
          type="button"
          onClick={() => { setMode('create'); setError('') }}
          className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all ${
            mode === 'create'
              ? 'bg-sky-950/30 border-sky-500 text-white'
              : 'bg-[#18181b] border-[#27272a] text-zinc-400 hover:border-zinc-700'
          }`}
        >
          <FolderPlus className={`w-4 h-4 mt-0.5 shrink-0 ${mode === 'create' ? 'text-sky-400' : ''}`} />
          <div>
            <div className="text-xs font-bold">New folder for this work</div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Create a project from scratch, then start tasks</div>
          </div>
        </button>
      </div>

      <div>
        <label className="block text-xs text-zinc-500 mb-1.5">Project name</label>
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="e.g. my-web-app"
          className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
        />
      </div>

      {mode === 'existing' ? (
        <>
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Folder path</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={projectPath}
                onChange={(e) => setProjectPath(e.target.value)}
                placeholder="/path/to/project"
                className="flex-1 bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-sky-500 font-mono text-xs"
              />
              <button
                type="button"
                onClick={() => browseFolder('existing')}
                className="px-3 bg-[#1a1a22] border border-[#27272a] hover:border-sky-500 text-zinc-400 hover:text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Browse
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Git remote (optional — clones if folder is missing)</label>
            <input
              type="text"
              value={gitRemote}
              onChange={(e) => setGitRemote(e.target.value)}
              placeholder="https://github.com/user/repo.git"
              className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
            />
          </div>
        </>
      ) : (
        <>
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Parent folder</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={parentPath}
                onChange={(e) => setParentPath(e.target.value)}
                placeholder="/path/to/parent"
                className="flex-1 bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-sky-500 font-mono text-xs"
              />
              <button
                type="button"
                onClick={() => browseFolder('parent')}
                className="px-3 bg-[#1a1a22] border border-[#27272a] hover:border-sky-500 text-zinc-400 hover:text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Browse
              </button>
            </div>
          </div>
          {resolvedCreatePath && (
            <div className="rounded-lg border border-[#27272a] bg-[#0f0f12] px-3 py-2">
              <div className="text-[10px] text-zinc-600 uppercase tracking-wider mb-0.5">Will create</div>
              <div className="text-xs font-mono text-zinc-300 break-all">{resolvedCreatePath}</div>
            </div>
          )}
          <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
            <input
              type="checkbox"
              checked={gitInit}
              onChange={(e) => setGitInit(e.target.checked)}
              className="accent-sky-500"
            />
            Initialize git repository (needed for worktree isolation)
          </label>
        </>
      )}

      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}

      <div className={`flex gap-2 ${compact ? 'pt-1' : 'pt-2'}`}>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="flex-1 px-4 py-2 bg-[#1a1a22] hover:bg-[#22222a] text-zinc-300 text-sm font-semibold rounded-lg border border-[#27272a] disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit || busy}
          className="flex-1 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-zinc-950 text-sm font-bold rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {submitLabel || (mode === 'existing' ? 'Add & set active' : 'Create & set active')}
        </button>
      </div>
    </div>
  )
}

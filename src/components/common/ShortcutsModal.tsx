import { Keyboard, X } from 'lucide-react'
import { useFleetStore } from '../../store/fleetStore'

interface ShortcutGroup {
  category: string
  shortcuts: { keys: string[]; description: string }[]
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    category: 'Global Navigation',
    shortcuts: [
      { keys: ['Ctrl / ⌘', 'K'], description: 'Open command palette' },
      { keys: ['Ctrl / ⌘', 'N'], description: 'Create a new task' },
      { keys: ['Ctrl / ⌘', 'Shift', 'P'], description: 'Create or open project' },
      { keys: ['Esc'], description: 'Close modals, drawers, and active views' },
    ],
  },
  {
    category: 'Task Management',
    shortcuts: [
      { keys: ['Click Run'], description: 'Launch autonomous agent on active worktree' },
      { keys: ['Click Terminal'], description: 'Open interactive live PTY terminal' },
      { keys: ['Click Diff'], description: 'Inspect git diff against base branch' },
      { keys: ['Click Review Changes'], description: 'Submit custom feedback directive to agent' },
    ],
  },
  {
    category: 'Panels & Controls',
    shortcuts: [
      { keys: ['Approval Mode'], description: 'Require confirmation before executing shell commands' },
      { keys: ['CLI Setup'], description: 'Inspect local LLM CLI tools & authentication' },
      { keys: ['Kill All'], description: 'Force kill all active background agents' },
    ],
  },
]

export default function ShortcutsModal() {
  const setShowShortcutsModal = useFleetStore((s) => s.setShowShortcutsModal)

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-[#121215] border border-[#27272a] rounded-2xl w-[540px] max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4 border-b border-[#27272a] pb-3">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-semibold text-white">Keyboard Shortcuts & Controls</h2>
          </div>
          <button
            onClick={() => setShowShortcutsModal(false)}
            className="text-zinc-500 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-6">
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.category} className="space-y-2">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                {group.category}
              </h3>
              <div className="space-y-1.5 bg-[#0b0b0d] p-3 rounded-lg border border-[#1d1d24]">
                {group.shortcuts.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs py-1 border-b border-[#18181f] last:border-b-0"
                  >
                    <span className="text-zinc-300">{item.description}</span>
                    <div className="flex items-center gap-1">
                      {item.keys.map((k, kIdx) => (
                        <kbd
                          key={kIdx}
                          className="px-2 py-0.5 rounded bg-[#1f1f27] border border-[#30303b] text-zinc-200 font-mono text-[10px] shadow-sm"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => setShowShortcutsModal(false)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}

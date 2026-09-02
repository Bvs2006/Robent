import { useState } from 'react'
import { useFleetStore } from '../store/fleetStore'
import PageHeader from '../components/layout/PageHeader'
import { Check, X, MessageSquare, AlertTriangle, FileCode } from 'lucide-react'

export default function PullRequests() {
  const pullRequests = useFleetStore((state) => state.pullRequests) || []
  const tasks = useFleetStore((state) => state.tasks)
  const sendAgentFeedback = useFleetStore((state) => state.sendAgentFeedback)
  const mergeTask = useFleetStore((state) => state.mergeTask)
  const openDiff = useFleetStore((state) => state.openDiff)
  const selectTask = useFleetStore((state) => state.selectTask)
  const setCurrentPage = useFleetStore((state) => state.setCurrentPage)
  const [expandedPR, setExpandedPR] = useState<string | null>(null)

  const taskIdFromPr = (prId: string) => prId.replace(/^pr-/, '')

  return (
    <div className="w-full h-full flex flex-col overflow-y-auto bg-[#09090b]">
      <PageHeader title="Reviews" description="Local review packets created from agent worktrees" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 px-6 py-4">
        {pullRequests.map((pr: any) => {
          const taskId = taskIdFromPr(pr.id)
          const task = tasks.find((t) => t.id === taskId)
          return (
            <div key={pr.id} className="bg-[#0f0f12] border border-[#1c1c22] rounded-lg p-4 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg font-semibold text-zinc-100">#{pr.number}</span>
                  <h3 className="text-zinc-100 font-medium truncate">{pr.title}</h3>
                </div>
                {pr.status === 'merged' && (
                  <span className="bg-purple-950/40 text-purple-400 px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1">
                    <Check className="w-3 h-3" /> Merged
                  </span>
                )}
                {pr.status === 'open' && pr.ciStatus === 'passing' && (
                  <span className="bg-emerald-950/40 text-emerald-400 px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1">
                    <Check className="w-3 h-3" /> Passing
                  </span>
                )}
                {pr.status === 'open' && pr.ciStatus === 'failed' && (
                  <span className="bg-red-950/40 text-red-400 px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1">
                    <X className="w-3 h-3" /> Failed
                  </span>
                )}
                {pr.status === 'open' && (pr.ciStatus === 'none' || pr.ciStatus === 'pending') && (
                  <span className="bg-sky-950/40 text-sky-400 px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1">
                    Ready for Review
                  </span>
                )}
              </div>

              <div className="text-xs font-mono text-zinc-500 mb-4">{pr.branch}</div>
              <div className="flex items-center gap-4 text-xs text-zinc-500 mb-4">
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" /> {task?.agent || 'Agent'}
                </span>
              </div>

              <div className="mt-auto flex gap-2 flex-wrap">
                {pr.status === 'open' && (
                  <>
                    <button
                      onClick={() => openDiff(taskId)}
                      className="bg-[#0f0f12] border border-[#1c1c22] text-zinc-100 px-3 py-1.5 rounded text-sm hover:bg-[#18181e] flex items-center gap-1"
                    >
                      Diff <FileCode className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => { setCurrentPage('dashboard'); selectTask(taskId) }}
                      className="bg-purple-500 text-white px-3 py-1.5 rounded text-sm hover:bg-purple-500/90"
                    >
                      Review
                    </button>
                    {pr.ciStatus === 'passing' && (
                      <button
                        onClick={() => mergeTask(taskId)}
                        className="bg-emerald-500 text-black px-3 py-1.5 rounded text-sm font-semibold hover:bg-emerald-400"
                      >
                        Merge
                      </button>
                    )}
                    {(pr.ciStatus === 'none' || pr.ciStatus === 'pending') && (
                      <button
                        onClick={() => mergeTask(taskId)}
                        className="bg-emerald-500 text-black px-3 py-1.5 rounded text-sm font-semibold hover:bg-emerald-400"
                      >
                        Approve & Merge
                      </button>
                    )}
                    {pr.ciStatus === 'failed' && (
                      <>
                        <button
                          onClick={() => setExpandedPR(expandedPR === pr.id ? null : pr.id)}
                          className="bg-[#0f0f12] border border-[#1c1c22] text-zinc-100 px-3 py-1.5 rounded text-sm hover:bg-[#18181e]"
                        >
                          View Failure
                        </button>
                        <button
                          onClick={() => sendAgentFeedback(taskId)}
                          className="bg-red-500 text-white px-3 py-1.5 rounded text-sm hover:bg-red-500/90"
                        >
                          Send To Agent
                        </button>
                        <button
                          onClick={() => mergeTask(taskId)}
                          className="bg-[#1c1c22] border border-[#2a2a35] text-zinc-400 hover:text-white px-3 py-1.5 rounded text-sm font-semibold hover:bg-[#252530]"
                        >
                          Merge anyway
                        </button>
                      </>
                    )}
                  </>
                )}
                {pr.status === 'merged' && (
                  <button
                    onClick={() => openDiff(taskId)}
                    className="bg-[#0f0f12] border border-[#1c1c22] text-zinc-400 hover:text-zinc-100 px-3 py-1.5 rounded text-sm hover:bg-[#18181e] flex items-center gap-1"
                  >
                    View Diff <FileCode className="w-3 h-3" />
                  </button>
                )}
              </div>

              {expandedPR === pr.id && (
                <div className="mt-4 p-3 bg-[#0f0f12] border border-red-900/40 rounded-md">
                  <div className="flex items-center gap-2 text-red-400 font-semibold text-sm mb-2">
                    <AlertTriangle className="w-4 h-4" /> Checks failed
                  </div>
                  <div className="text-sm text-zinc-100 mb-2 font-medium">{pr.title}</div>
                  <ul className="text-xs font-mono text-zinc-300 list-disc pl-4 mb-3 space-y-1">
                    {(task?.failedTests || pr.ciFailureDetails?.failedFiles || ['No details available']).map((file: string, idx: number) => (
                      <li key={idx}>{file}</li>
                    ))}
                  </ul>
                  <button
                    onClick={() => sendAgentFeedback(taskId)}
                    className="bg-red-500 text-white px-3 py-1.5 rounded text-xs hover:bg-red-500/90"
                  >
                    Send Feedback To Agent
                  </button>
                </div>
              )}
            </div>
          )
        })}
        {pullRequests.length === 0 && (
          <div className="col-span-full text-center py-12 text-zinc-500">
            No reviews yet. Finish an agent task to create one.
          </div>
        )}
      </div>
    </div>
  )
}

import { useState } from 'react';
import { useFleetStore } from '../store/fleetStore';
import PageHeader from '../components/layout/PageHeader';
import { Check, X, MessageSquare, AlertTriangle, ExternalLink } from 'lucide-react';

export default function PullRequests() {
  const pullRequests = useFleetStore((state) => state.pullRequests) || [];
  const sendAgentFeedback = useFleetStore((state) => state.sendAgentFeedback);
  const [expandedPR, setExpandedPR] = useState<string | null>(null);

  const handleSendFeedback = (prId: string) => {
    if (sendAgentFeedback) {
      sendAgentFeedback(prId);
    }
  };

  return (
    <div className="w-full h-full flex flex-col overflow-y-auto bg-[#09090b]">
      <PageHeader title="Pull Requests" description="GitHub feedback from your agent fleet" />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 px-6 py-4">
        {pullRequests.map((pr: any) => (
          <div key={pr.id} className="bg-[#0f0f12] border border-[#1c1c22] rounded-lg p-4 flex flex-col">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-zinc-100">#{pr.number}</span>
                <h3 className="text-zinc-100 font-medium">{pr.title}</h3>
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
            </div>

            <div className="text-xs font-mono text-zinc-500 mb-4">
              {pr.branch}
            </div>

            <div className="flex items-center gap-4 text-xs text-zinc-500 mb-4">
              <span className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3" /> {pr.reviewCount} Reviews
              </span>
            </div>

            <div className="mt-auto flex gap-2">
              {pr.status === 'open' && pr.ciStatus === 'passing' && (
                <>
                  <button className="bg-[#0f0f12] border border-[#1c1c22] text-zinc-100 px-3 py-1.5 rounded text-sm hover:bg-[#18181e] flex items-center gap-1">
                    Open <ExternalLink className="w-3 h-3" />
                  </button>
                  <button className="bg-purple-500 text-white px-3 py-1.5 rounded text-sm hover:bg-purple-500/90">
                    Review
                  </button>
                </>
              )}
              {pr.status === 'open' && pr.ciStatus === 'failed' && (
                <>
                  <button 
                    onClick={() => setExpandedPR(expandedPR === pr.id ? null : pr.id)}
                    className="bg-[#0f0f12] border border-[#1c1c22] text-zinc-100 px-3 py-1.5 rounded text-sm hover:bg-[#18181e]"
                  >
                    View Failure
                  </button>
                  <button 
                    onClick={() => handleSendFeedback(pr.id)}
                    className="bg-purple-500 text-white px-3 py-1.5 rounded text-sm hover:bg-purple-500/90"
                  >
                    Send To Agent
                  </button>
                </>
              )}
            </div>

            {expandedPR === pr.id && pr.ciFailureDetails && (
              <div className="mt-4 p-3 bg-[#0f0f12] border border-red-900/40 rounded-md">
                <div className="flex items-center gap-2 text-red-400 font-semibold text-sm mb-2">
                  <AlertTriangle className="w-4 h-4" /> ⚠ CI FAILED
                </div>
                <div className="text-sm text-zinc-100 mb-2 font-medium">
                  {pr.ciFailureDetails.taskTitle}
                </div>
                <div className="text-xs text-zinc-500 mb-2">
                  {pr.ciFailureDetails.failedTestsCount} tests failed
                </div>
                <ul className="text-xs font-mono text-zinc-300 list-disc pl-4 mb-3 space-y-1">
                  {pr.ciFailureDetails.failedFiles.map((file: string, idx: number) => (
                    <li key={idx}>{file}</li>
                  ))}
                </ul>
                <button 
                  onClick={() => handleSendFeedback(pr.id)}
                  className="bg-red-500 text-white px-3 py-1.5 rounded text-xs hover:bg-red-500/90"
                >
                  Send Feedback To Agent
                </button>
              </div>
            )}
          </div>
        ))}
        {pullRequests.length === 0 && (
          <div className="col-span-full text-center py-12 text-zinc-500">
            No pull requests yet. Start a task to create one.
          </div>
        )}
      </div>
    </div>
  );
}
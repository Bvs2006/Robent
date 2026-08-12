import { useState } from 'react';
import { X, ArrowRight, Bot, Layers, Sparkles, Cpu } from 'lucide-react';
import { useFleetStore } from '../../store/fleetStore';
import type { Task } from '../../types';

export default function NewTaskModal() {
  const { setShowNewTaskModal, addPlannedTasks, startAllTasks, planTasks, toolStatuses } = useFleetStore();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [agentMode, setAgentMode] = useState<'auto' | 'manual'>('auto');
  const [planningStage, setPlanningStage] = useState(0);
  const [plannedSubtasks, setPlannedSubtasks] = useState<Task[]>([]);

  // Get real installed agent names
  const toolIdToLabel: Record<string, string> = {
    'claude-code': 'Claude Code',
    'codex': 'Codex',
    'opencode': 'OpenCode',
    'antigravity': 'Antigravity',
    'aider': 'Aider',
  }
  const readyAgents = toolStatuses.filter(t => t.available).map(t => toolIdToLabel[t.toolId] || t.toolId)
  const agentListText = readyAgents.length > 0
    ? readyAgents.slice(0, 3).join(', ')
    : 'Claude Code, OpenCode'

  const handlePlanTicket = async () => {
    if (!title.trim()) return;

    setStep(2);
    setPlanningStage(1);
    setTimeout(() => setPlanningStage(2), 800);
    setTimeout(() => setPlanningStage(3), 1600);

    const generated = await planTasks(title + ' ' + description);
    setPlannedSubtasks(generated);
    setTimeout(() => setStep(3), 2400);
  };

  const handleStartAll = async () => {
    await addPlannedTasks(plannedSubtasks);
    await startAllTasks(plannedSubtasks.map((t) => t.id));
    setShowNewTaskModal(false);
  };

  const handleAddOnly = async () => {
    await addPlannedTasks(plannedSubtasks);
    setShowNewTaskModal(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center modal-backdrop p-4">
      <div className="bg-[#121215] border border-[#27272a] rounded-2xl w-[520px] max-h-[85vh] overflow-y-auto modal-content shadow-2xl">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#1f1f23] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-400" />
            <h2 className="text-white font-bold text-base">Create Engineering Ticket</h2>
          </div>
          <button 
            onClick={() => setShowNewTaskModal(false)}
            className="text-zinc-500 hover:text-white p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Modal Body */}
        <div className="px-6 py-5">
          {step === 1 && (
            <div className="space-y-4">
              
              {/* Title Input */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                  Ticket Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && title.trim() && handlePlanTicket()}
                  placeholder="e.g. Build authentication system"
                  className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-sky-500 outline-none transition-colors"
                  autoFocus
                />
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                  Requirement Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Build JWT auth with login, signup and automated testing"
                  className="w-full bg-[#18181b] border border-[#27272a] rounded-xl p-3.5 text-sm text-white resize-none h-24 focus:border-sky-500 outline-none transition-colors"
                />
              </div>

              {/* Agent Mode Radio Selector */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2 uppercase tracking-wider">
                  Agent Mode
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label 
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      agentMode === 'auto'
                        ? 'bg-sky-950/30 border-sky-500 text-white'
                        : 'bg-[#18181b] border-[#27272a] text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="agentMode" 
                      checked={agentMode === 'auto'} 
                      onChange={() => setAgentMode('auto')}
                      className="mt-0.5 accent-sky-500" 
                    />
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        <Bot className="w-3.5 h-3.5 text-sky-400" />
                        Auto Assign Agents
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        Planner breaks outcome into subtasks & assigns best available agents
                      </div>
                    </div>
                  </label>

                  <label 
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      agentMode === 'manual'
                        ? 'bg-sky-950/30 border-sky-500 text-white'
                        : 'bg-[#18181b] border-[#27272a] text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="agentMode" 
                      checked={agentMode === 'manual'} 
                      onChange={() => setAgentMode('manual')}
                      className="mt-0.5 accent-sky-500" 
                    />
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5" />
                        Manual Assign
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        Select specific AI engine for each subtask manually
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Ready agents pill */}
              {readyAgents.length > 0 && (
                <div className="flex items-center gap-2 bg-emerald-950/20 border border-emerald-800/30 rounded-xl px-3 py-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span className="text-[11px] text-emerald-400">
                    {readyAgents.length} agent{readyAgents.length > 1 ? 's' : ''} ready: <strong>{agentListText}</strong>
                  </span>
                </div>
              )}

            </div>
          )}

          {/* Planning Animation */}
          {step === 2 && (
            <div className="py-10 flex flex-col items-center justify-center space-y-5 text-center">
              <div className="relative">
                <div className="w-12 h-12 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                <Sparkles className="w-5 h-5 text-sky-400 absolute inset-0 m-auto" />
              </div>
              
              <div className="space-y-1">
                <h3 className="text-white font-bold text-base">Planning...</h3>
                <div className="text-xs text-sky-400 font-mono space-y-1">
                  <p className={planningStage >= 1 ? 'opacity-100' : 'opacity-30'}>
                    ✓ Breaking requirement into tasks...
                  </p>
                  <p className={planningStage >= 2 ? 'opacity-100' : 'opacity-30'}>
                    ✓ Assigning to {agentListText}...
                  </p>
                  <p className={planningStage >= 3 ? 'opacity-100' : 'opacity-30'}>
                    ✓ Creating git worktrees...
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Plan Breakdown Result */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wide">
                  <Sparkles className="w-4 h-4" />
                  <span>PLANNED — {plannedSubtasks.length} Subtasks Generated</span>
                </div>
              </div>

              <div className="space-y-2.5">
                {plannedSubtasks.map((st, i) => (
                  <div key={st.id} className="bg-[#18181b] border border-[#27272a] rounded-xl p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-zinc-800 text-zinc-400 text-xs flex items-center justify-center font-bold font-mono">
                        {i + 1}
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-white">{st.title}</h4>
                        <p className="text-[11px] text-zinc-400 line-clamp-1">{st.description}</p>
                      </div>
                    </div>
                    <div className="bg-[#222226] border border-[#2e2e34] px-2.5 py-1 rounded-lg text-xs font-semibold text-purple-300 shrink-0 ml-2">
                      {st.agent}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {(step === 1 || step === 3) && (
          <div className="px-6 py-4 border-t border-[#1f1f23] flex justify-end gap-3">
            <button 
              onClick={() => setShowNewTaskModal(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-[#27272a] text-zinc-400 hover:text-white hover:bg-[#18181b] transition-colors"
            >
              Cancel
            </button>

            {step === 1 && (
              <button 
                onClick={handlePlanTicket}
                disabled={!title.trim()}
                className="px-4 py-2 rounded-xl text-xs bg-sky-500 text-zinc-950 font-bold hover:bg-sky-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <span>Plan Ticket & Assign Agents</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {step === 3 && (
              <>
                <button 
                  onClick={handleAddOnly}
                  className="px-4 py-2 rounded-xl text-xs border border-[#27272a] text-zinc-300 font-semibold hover:bg-[#18181b] transition-colors"
                >
                  Add to Board
                </button>
                <button 
                  onClick={handleStartAll}
                  className="px-5 py-2 rounded-xl text-xs bg-emerald-500 text-zinc-950 font-bold hover:bg-emerald-400 transition-colors flex items-center gap-2"
                >
                  <span>Start All Agents</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

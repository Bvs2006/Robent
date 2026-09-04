import { useState } from 'react';
import {
  X,
  ArrowRight,
  Sparkles,
  ChevronDown,
  Layers,
  Flame,
  Check,
} from 'lucide-react';
import { useFleetStore } from '../../store/fleetStore';
import ProjectSetupForm from './ProjectSetupForm';
import type { Task, AgentName } from '../../types';

export default function NewTaskModal() {
  const {
    setShowNewTaskModal,
    addPlannedTasks,
    startAllTasks,
    startTask,
    openTerminal,
    planTasks,
    toolStatuses,
    currentProject,
  } = useFleetStore();

  const [prompt, setPrompt] = useState('');
  const [title, setTitle] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<AgentName>('Claude Code');
  const [selectedModel, setSelectedModel] = useState('Agent default');
  const [collaborativeMode, setCollaborativeMode] = useState(false);
  const [agentDropdownOpen, setAgentDropdownOpen] = useState(false);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [planningStage, setPlanningStage] = useState(0);
  const [plannedSubtasks, setPlannedSubtasks] = useState<Task[]>([]);
  const [changingProject, setChangingProject] = useState(false);
  const [busy, setBusy] = useState(false);

  const needsProject = !currentProject || changingProject;

  const agentList: Array<{ name: AgentName; ready: boolean; tag?: string }> = [
    { name: 'Claude Code', ready: toolStatuses.some((t) => t.toolId === 'claude-code' && t.available) },
    { name: 'Codex', ready: toolStatuses.some((t) => t.toolId === 'codex' && t.available) },
    { name: 'OpenCode', ready: toolStatuses.some((t) => t.toolId === 'opencode' && t.available) },
    { name: 'Antigravity', ready: toolStatuses.some((t) => t.toolId === 'antigravity' && t.available) },
    { name: 'Aider', ready: toolStatuses.some((t) => t.toolId === 'aider' && t.available), tag: 'Needs API key' },
    { name: 'Cursor', ready: false, tag: 'Needs install' },
  ];

  const models = [
    'Agent default',
    'claude-3-7-sonnet',
    'gpt-4o',
    'gpt-4o-mini',
    'gemini-3.8-flash',
  ];

  // Direct start or plan
  const handleStartTask = async () => {
    if (!prompt.trim() || !currentProject || changingProject) return;

    if (collaborativeMode) {
      // Decompose across multiple complementary CLIs
      setStep(2);
      setPlanningStage(1);
      setTimeout(() => setPlanningStage(2), 700);
      setTimeout(() => setPlanningStage(3), 1400);

      const generated = await planTasks(prompt.trim());
      setPlannedSubtasks(generated);
      setTimeout(() => setStep(3), 2000);
      return;
    }

    // Direct single-agent run
    setBusy(true);
    try {
      const taskTitle = title.trim() || prompt.trim().split('\n')[0].slice(0, 60);
      const taskId = `TASK-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`.toUpperCase();
      const newTask: Task = {
        id: taskId,
        title: taskTitle,
        description: prompt.trim(),
        status: 'planned',
        priority: 'normal',
        agent: selectedAgent,
      };

      await addPlannedTasks([newTask]);
      setShowNewTaskModal(false);
      await startTask(taskId);
      openTerminal(taskId);
    } finally {
      setBusy(false);
    }
  };

  const handleStartAll = async () => {
    if (!currentProject) {
      setChangingProject(true);
      setStep(1);
      return;
    }
    setBusy(true);
    try {
      await addPlannedTasks(plannedSubtasks);
      await startAllTasks(plannedSubtasks.map((t) => t.id));
      setShowNewTaskModal(false);
      if (plannedSubtasks.length > 0) {
        openTerminal(plannedSubtasks[0].id);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center modal-backdrop p-4">
      <div className="bg-[#121215] border border-[#27272f] rounded-2xl w-[560px] max-h-[85vh] overflow-y-auto modal-content shadow-2xl">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#1f1f26] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-400" />
            <h2 className="text-white font-bold text-base">Start Task with CLI Agents</h2>
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
              {/* Project selector if needed */}
              {needsProject ? (
                <div className="rounded-xl border border-[#27272f] bg-[#0f0f13] p-4 space-y-3">
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {currentProject ? 'Switch project' : 'Where should this task run?'}
                    </h3>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      Select or create a project folder for this task.
                    </p>
                  </div>
                  <ProjectSetupForm
                    onComplete={() => setChangingProject(false)}
                    onCancel={() => setChangingProject(false)}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-between bg-[#17171d] border border-[#23232c] px-3.5 py-2 rounded-xl text-xs">
                  <div className="flex items-center gap-2 truncate text-zinc-300">
                    <span className="text-zinc-500 font-mono">Workspace:</span>
                    <span className="font-bold text-sky-400 truncate">{currentProject?.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setChangingProject(true)}
                    className="text-xs text-zinc-400 hover:text-white font-semibold transition-colors shrink-0"
                  >
                    Change
                  </button>
                </div>
              )}

              {/* Task Title (optional summary) */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
                  Task Title (optional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Build a chess game"
                  className="w-full bg-[#18181c] border border-[#282832] rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-sky-500 outline-none transition-colors"
                />
              </div>

              {/* Prompt / Instructions Textarea matching Reference */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
                  Instructions & Verification
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={5}
                  placeholder="Describe what the agent should build, expected files, and verification steps..."
                  className="w-full bg-[#18181c] border border-[#282832] rounded-xl p-3.5 text-sm text-white focus:border-sky-500 outline-none transition-colors resize-y font-mono placeholder:text-zinc-500"
                  autoFocus
                />
              </div>

              {/* Agent & Model Selectors Row matching Reference UI */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                {/* Agent Dropdown */}
                <div className="relative">
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                    Agent
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setAgentDropdownOpen(!agentDropdownOpen);
                      setModelDropdownOpen(false);
                    }}
                    className="w-full bg-[#18181c] border border-[#282832] rounded-xl px-3.5 py-2 text-xs font-semibold text-white flex items-center justify-between hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Flame className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span className="truncate">{selectedAgent}</span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  </button>

                  {agentDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#15151a] border border-[#2b2b36] rounded-xl shadow-2xl py-1.5 z-50 max-h-56 overflow-y-auto">
                      {agentList.map((ag) => (
                        <button
                          key={ag.name}
                          type="button"
                          onClick={() => {
                            setSelectedAgent(ag.name);
                            setAgentDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-[#202028] transition-colors ${
                            selectedAgent === ag.name ? 'text-sky-400 font-bold bg-[#1c1c24]' : 'text-zinc-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${ag.ready ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                            <span>{ag.name}</span>
                          </div>
                          {ag.tag && (
                            <span className="text-[10px] text-zinc-500 font-mono">{ag.tag}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Model Dropdown */}
                <div className="relative">
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                    Model
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setModelDropdownOpen(!modelDropdownOpen);
                      setAgentDropdownOpen(false);
                    }}
                    className="w-full bg-[#18181c] border border-[#282832] rounded-xl px-3.5 py-2 text-xs font-semibold text-white flex items-center justify-between hover:border-zinc-700 transition-colors"
                  >
                    <span className="truncate">{selectedModel}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  </button>

                  {modelDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#15151a] border border-[#2b2b36] rounded-xl shadow-2xl py-1.5 z-50">
                      {models.map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => {
                            setSelectedModel(m);
                            setModelDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-[#202028] transition-colors ${
                            selectedModel === m ? 'text-sky-400 font-bold bg-[#1c1c24]' : 'text-zinc-300'
                          }`}
                        >
                          <span>{m}</span>
                          {selectedModel === m && <Check className="w-3.5 h-3.5" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Multi-CLI Collaboration Toggle */}
              <div className="pt-2">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-[#23232c] bg-[#15151a] cursor-pointer hover:border-zinc-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={collaborativeMode}
                    onChange={(e) => setCollaborativeMode(e.target.checked)}
                    className="rounded border-zinc-700 text-sky-500 focus:ring-0 focus:ring-offset-0 bg-[#1c1c24]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      <span className="text-xs font-bold text-white">Multi-CLI Orchestration</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Decompose into subtasks (Core, UI, Tests) executed across complementary installed CLIs.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Step 2: Planning animation */}
          {step === 2 && (
            <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
              <div className="w-12 h-12 rounded-full border-2 border-sky-400 border-t-transparent animate-spin" />
              <div>
                <h3 className="text-sm font-bold text-white">Orchestrating CLI Subtasks...</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  {planningStage === 1 && 'Analyzing architecture & requirements...'}
                  {planningStage === 2 && 'Mapping subtasks to ready agent capabilities...'}
                  {planningStage === 3 && 'Allocating isolated worktree environments...'}
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Planned Subtasks Breakdown */}
          {step === 3 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <Sparkles className="w-4 h-4" />
                  <span>PLANNED — {plannedSubtasks.length} Subtasks Generated</span>
                </div>
              </div>

              <div className="space-y-2.5 max-h-60 overflow-y-auto">
                {plannedSubtasks.map((st, i) => (
                  <div key={st.id} className="bg-[#18181c] border border-[#272730] rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-400 text-[11px] flex items-center justify-center font-bold font-mono shrink-0">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">{st.title}</h4>
                        <p className="text-[11px] text-zinc-400 truncate">{st.description}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#24242c] text-purple-300 shrink-0">
                      {st.agent}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#1f1f26] flex items-center justify-between gap-3 bg-[#0e0e11]">
          {step === 3 ? (
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setPlannedSubtasks([]);
              }}
              className="text-xs text-zinc-500 hover:text-red-400 transition-colors"
            >
              Start Over
            </button>
          ) : <div />}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowNewTaskModal(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-[#272730] text-zinc-400 hover:text-white hover:bg-[#18181c] transition-colors"
            >
              Cancel
            </button>

            {step === 1 && !needsProject && (
              <button
                type="button"
                onClick={handleStartTask}
                disabled={!prompt.trim() || busy}
                className="px-5 py-2 rounded-xl text-xs bg-sky-500 text-zinc-950 font-bold hover:bg-sky-400 transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
              >
                <span>{collaborativeMode ? 'Plan & Assign' : 'Start Task'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {step === 3 && (
              <button
                type="button"
                onClick={handleStartAll}
                disabled={busy}
                className="px-5 py-2 rounded-xl text-xs bg-emerald-500 text-zinc-950 font-bold hover:bg-emerald-400 transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
              >
                <span>Start All Agents</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

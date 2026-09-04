import { useState, useEffect } from 'react';
import {
  X,
  ArrowRight,
  Sparkles,
  ChevronDown,
  Layers,
  Flame,
  Check,
  Loader2,
} from 'lucide-react';
import { useFleetStore } from '../../store/fleetStore';
import ProjectSetupForm from './ProjectSetupForm';
import type { AgentName } from '../../types';

export default function NewTaskModal() {
  const {
    setShowNewTaskModal,
    startAllTasks,
    startTask,
    createTask,
    openTerminal,
    planTasks,
    addPlannedTasks,
    toolStatuses,
    currentProject,
    addNotification,
  } = useFleetStore();

  const [prompt, setPrompt] = useState('');
  const [title, setTitle] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<AgentName>('OpenCode');
  const [selectedModel, setSelectedModel] = useState('Agent default');
  const [collaborativeMode, setCollaborativeMode] = useState(false);
  const [agentDropdownOpen, setAgentDropdownOpen] = useState(false);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [changingProject, setChangingProject] = useState(false);
  const [busy, setBusy] = useState(false);

  // Set initial agent to first available tool
  useEffect(() => {
    const ready = toolStatuses.find((t) => t.available);
    if (ready) {
      const toolIdToAgent: Record<string, AgentName> = {
        'claude-code': 'Claude Code',
        'codex': 'Codex',
        'opencode': 'OpenCode',
        'antigravity': 'Antigravity',
        'aider': 'Aider',
      };
      if (toolIdToAgent[ready.toolId]) {
        setSelectedAgent(toolIdToAgent[ready.toolId]);
      }
    }
  }, [toolStatuses]);

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

  // Derive task text from either prompt or title
  const effectivePrompt = (prompt.trim() || title.trim());
  const isStartDisabled = !effectivePrompt || !currentProject || changingProject || busy;

  const handleStartTask = async () => {
    if (isStartDisabled) {
      if (!effectivePrompt) {
        addNotification('info', 'Please enter a task title or description to start.');
      }
      return;
    }

    setBusy(true);
    try {
      const taskTitle = title.trim() || effectivePrompt.split('\n')[0].slice(0, 60);
      const taskDesc = prompt.trim() || title.trim();

      if (collaborativeMode) {
        // Multi-CLI Orchestration: decompose across complementary CLIs and start them all
        addNotification('info', 'Orchestrating subtasks across installed CLIs...');
        const generated = await planTasks(taskDesc);
        if (generated && generated.length > 0) {
          await addPlannedTasks(generated);
          setShowNewTaskModal(false);
          await startAllTasks(generated.map((t) => t.id));
          openTerminal(generated[0].id);
          return;
        }
      }

      // Single-agent direct run
      const created = await createTask(taskTitle, taskDesc, selectedAgent, 'normal');
      setShowNewTaskModal(false);
      await startTask(created.id);
      openTerminal(created.id);
    } catch (err: any) {
      console.error('Failed to start task:', err);
      addNotification('error', `Failed to start task: ${err?.message || 'unknown error'}`);
    } finally {
      setBusy(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' && e.ctrlKey) || (e.key === 'Enter' && e.target instanceof HTMLInputElement)) {
      e.preventDefault();
      handleStartTask();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center modal-backdrop p-4" onKeyDown={handleKeyDown}>
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
        <div className="px-6 py-5 space-y-4">
          {/* Project selector */}
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

          {/* Task Title Input */}
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
              autoFocus
            />
          </div>

          {/* Instructions / Prompt Textarea */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
              Instructions & Verification
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              placeholder="Describe what the agent should build, expected files, and verification steps..."
              className="w-full bg-[#18181c] border border-[#282832] rounded-xl p-3.5 text-sm text-white focus:border-sky-500 outline-none transition-colors resize-y font-mono placeholder:text-zinc-500"
            />
          </div>

          {/* Agent & Model Selectors Row */}
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
          <div className="pt-1">
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

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#1f1f26] flex items-center justify-between gap-3 bg-[#0e0e11]">
          <span className="text-[11px] text-zinc-500 font-mono">
            Press <kbd className="px-1 py-0.5 bg-[#18181c] border border-[#282832] rounded text-zinc-400">Ctrl+Enter</kbd> to launch
          </span>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowNewTaskModal(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-[#272730] text-zinc-400 hover:text-white hover:bg-[#18181c] transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleStartTask}
              disabled={isStartDisabled}
              className="px-5 py-2 rounded-xl text-xs bg-sky-500 text-zinc-950 font-bold hover:bg-sky-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-sm"
            >
              {busy ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Launching Agent...</span>
                </>
              ) : (
                <>
                  <span>{collaborativeMode ? 'Start Multi-Agent Run' : 'Start Task'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

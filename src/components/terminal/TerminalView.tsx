import { useState, useRef, useEffect } from 'react';
import {
  X,
  Play,
  ArrowLeft,
  Globe,
  FileText,
  ListTodo,
  RotateCw,
  ExternalLink,
  Square,
  Send,
  GitPullRequest,
  AlertCircle,
  Search,
  Flame,
  Cpu,
  Terminal as TerminalIcon,
  ChevronUp,
} from 'lucide-react';
import { useFleetStore } from '../../store/fleetStore';
import { Terminal } from 'xterm';
import { FitAddon } from '@xterm/addon-fit';
import 'xterm/css/xterm.css';

interface CliTabDef {
  id: string;
  name: string;
  icon: string;
  desc: string;
}

const PRIMARY_CLIS: CliTabDef[] = [
  { id: 'all', name: 'All CLIs', icon: '🌐', desc: 'Unified multi-CLI combined stream' },
  { id: 'OpenCode', name: 'OpenCode', icon: '⚡', desc: 'Planning & full-stack reasoning' },
  { id: 'Codex', name: 'Codex', icon: '🧠', desc: 'Fast code generation & fixes' },
  { id: 'Antigravity', name: 'Antigravity', icon: '🚀', desc: 'Deep autonomous agentic workflows' },
  { id: 'Claude Code', name: 'Claude Code', icon: '🟣', desc: 'Complex refactors & architecture' },
  { id: 'Aider', name: 'Aider', icon: '🔨', desc: 'Git-integrated precise edits' },
];

function normalizeAgent(name?: string): string {
  if (!name) return '';
  const lower = name.toLowerCase().trim();
  if (lower.includes('opencode')) return 'OpenCode';
  if (lower.includes('codex')) return 'Codex';
  if (lower.includes('antigravity') || lower === 'agy') return 'Antigravity';
  if (lower.includes('claude')) return 'Claude Code';
  if (lower.includes('aider')) return 'Aider';
  if (lower.includes('cursor')) return 'Cursor';
  if (lower.includes('copilot')) return 'GitHub Copilot';
  return name;
}

export default function TerminalView() {
  const {
    terminalTaskId,
    closeTerminal,
    tasks,
    startTask,
    stopTask,
    mergeTask,
    activities,
    workers,
  } = useFleetStore();

  const task = tasks.find((t) => t.id === terminalTaskId);

  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  // Inspector panel tabs: 'activity' | 'preview' | 'files'
  const [activeInspectorTab, setActiveInspectorTab] = useState<'activity' | 'preview' | 'files'>('activity');
  const [inputCommand, setInputCommand] = useState('');
  const [terminateOnMerge, setTerminateOnMerge] = useState(false);
  const [worktreeFiles, setWorktreeFiles] = useState<Array<{ path: string; index: string; working_dir: string }>>([]);
  const [previewInfo, setPreviewInfo] = useState<{ url: string; port?: number; file?: string; type: 'server' | 'file' } | null>(null);
  const [searchFileQuery, setSearchFileQuery] = useState('');
  const [selectedAgentFilter, setSelectedAgentFilter] = useState<string>('all');
  const [startingPreview, setStartingPreview] = useState(false);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [activeModel, setActiveModel] = useState(task?.model || 'claude-3-7-sonnet');

  // Per-agent output buffers and status tracking
  const agentOutputsRef = useRef<Record<string, string[]>>({ all: [] });
  const [unreadMap, setUnreadMap] = useState<Record<string, number>>({});
  const [outputCounts, setOutputCounts] = useState<Record<string, number>>({});

  // Supported model choices
  const AVAILABLE_MODELS = [
    { id: 'claude-3-7-sonnet', name: 'Claude 3.7 Sonnet', desc: 'Hybrid reasoning, deep coding' },
    { id: 'claude-3-5-sonnet-latest', name: 'Claude 3.5 Sonnet', desc: 'Fast, high-fidelity coding' },
    { id: 'gpt-4o', name: 'GPT-4o', desc: 'Omni multi-modal powerhouse' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', desc: 'Fast, cost-efficient for small fixes' },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', desc: '2M context, deep reasoning' },
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', desc: 'Ultra-fast inference speed' },
    { id: 'deepseek-chat', name: 'DeepSeek V3', desc: 'Cost-effective open-weights model' },
    { id: 'deepseek-reasoner', name: 'DeepSeek R1', desc: 'Deep Chain-of-Thought reasoning' },
  ];

  // Slash commands catalogue
  const SLASH_COMMANDS = [
    { cmd: '/model', desc: 'Switch AI model (e.g. /model gpt-4o, /model claude-3-7-sonnet)', action: 'model' },
    { cmd: '/agent', desc: 'Switch target agent CLI (e.g. /agent claude, /agent agy, /agent opencode)', action: 'agent' },
    { cmd: '/clear', desc: 'Clear the terminal output screen', action: 'clear' },
    { cmd: '/preview', desc: 'Launch live web preview & dev server', action: 'preview' },
    { cmd: '/diff', desc: 'Inspect worktree git changes and diffs', action: 'diff' },
    { cmd: '/merge', desc: 'Merge current task branch into main branch', action: 'merge' },
    { cmd: '/stop', desc: 'Interrupt the running agent process immediately', action: 'stop' },
    { cmd: '/restart', desc: 'Restart current task agent with fresh execution', action: 'restart' },
    { cmd: '/help', desc: 'Show all available CLI shortcuts & slash commands', action: 'help' },
  ];

  // Check if a specific CLI is actively running on this task
  const isCliRunning = (cliId: string) => {
    if (cliId === 'all') {
      return task?.status === 'working' || (workers || []).some((w) => w.taskId === terminalTaskId && w.status === 'running');
    }
    const norm = normalizeAgent(cliId);
    if (task?.status === 'working' && normalizeAgent(task?.agent) === norm) return true;
    return (workers || []).some((w) => w.taskId === terminalTaskId && w.status === 'running' && normalizeAgent(w.agent) === norm);
  };

  // Helper to render current selected buffer into xterm
  const renderAgentBuffer = (filter: string, currentTask?: any) => {
    if (!xtermRef.current) return;
    xtermRef.current.reset();

    const lines = agentOutputsRef.current[filter] || [];
    if (lines.length > 0) {
      for (const line of lines) {
        xtermRef.current.write(line);
      }
    } else {
      if (filter === 'all') {
        xtermRef.current.writeln(`\x1b[1;36m┌─────────────────────────────────────────────────────────────┐\x1b[0m`);
        xtermRef.current.writeln(`\x1b[1;36m│\x1b[0m  \x1b[1;37mRobent Unified Multi-CLI Console\x1b[0m                           \x1b[1;36m│\x1b[0m`);
        xtermRef.current.writeln(`\x1b[1;36m│\x1b[0m  Task:   \x1b[33m${(currentTask?.title || terminalTaskId || '').slice(0, 48)}\x1b[0m`);
        xtermRef.current.writeln(`\x1b[1;36m│\x1b[0m  Status: \x1b[32m${currentTask?.status || 'idle'}\x1b[0m`);
        xtermRef.current.writeln(`\x1b[1;36m└─────────────────────────────────────────────────────────────┘\x1b[0m\r\n`);
        xtermRef.current.writeln(`\x1b[38;5;244m[Unified stream · Logs from all active and subtask agents stream here]\x1b[0m\r\n`);
      } else {
        const isRunning = isCliRunning(filter);
        xtermRef.current.writeln(`\x1b[1;35m┌─────────────────────────────────────────────────────────────┐\x1b[0m`);
        xtermRef.current.writeln(`\x1b[1;35m│\x1b[0m  \x1b[1;37m${filter} CLI Dedicated Workspace\x1b[0m                       \x1b[1;35m│\x1b[0m`);
        xtermRef.current.writeln(`\x1b[1;35m│\x1b[0m  Status: ${isRunning ? '\x1b[1;32m● Running (Executing task...)\x1b[0m' : '\x1b[38;5;244mStandby · Idle\x1b[0m'}`);
        xtermRef.current.writeln(`\x1b[1;35m│\x1b[0m  Model:  \x1b[36m${activeModel}\x1b[0m`);
        xtermRef.current.writeln(`\x1b[1;35m└─────────────────────────────────────────────────────────────┘\x1b[0m\r\n`);
        if (isRunning) {
          xtermRef.current.writeln(`\x1b[32m[${filter} is currently running on this task. Streaming output live...]\x1b[0m\r\n`);
        } else {
          xtermRef.current.writeln(`\x1b[38;5;244mNo terminal output recorded for ${filter} on this task yet.\x1b[0m`);
          xtermRef.current.writeln(`\x1b[38;5;244mType a prompt below and press Enter, or click "Run with ${filter}" above to start.\x1b[0m\r\n`);
        }
      }
    }
  };

  // Initialize xterm.js instance
  useEffect(() => {
    if (!terminalRef.current) return;
    if (xtermRef.current) return;

    const term = new Terminal({
      theme: {
        background: '#09090b',
        foreground: '#e4e4e7',
        cursor: '#38bdf8',
        selectionBackground: 'rgba(56, 189, 248, 0.3)',
      },
      fontFamily: 'Consolas, Monaco, "Courier New", monospace',
      fontSize: 12,
      lineHeight: 1.25,
      cursorBlink: true,
      scrollback: 5000,
    });
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    // Interactive input directly to PTY on key press
    const dataDisposable = term.onData((data) => {
      if (terminalTaskId && window.electronAPI?.sendTaskInput) {
        window.electronAPI.sendTaskInput(terminalTaskId, data);
      }
    });

    const resizeObserver = new ResizeObserver(() => {
      fitAddon.fit();
    });
    resizeObserver.observe(terminalRef.current);

    return () => {
      dataDisposable.dispose();
      resizeObserver.disconnect();
      term.dispose();
      xtermRef.current = null;
    };
  }, [terminalTaskId]);

  // Load existing output and history on task selection
  useEffect(() => {
    if (!terminalTaskId || !window.electronAPI) return;

    const currentTask = useFleetStore.getState().tasks.find((t) => t.id === terminalTaskId);
    window.electronAPI.getTerminalLines(terminalTaskId).then((lines: any[]) => {
      const buffers: Record<string, string[]> = { all: [] };
      const counts: Record<string, number> = { all: 0 };

      for (const line of lines || []) {
        const chunk = line?.content || '';
        buffers.all.push(chunk);
        counts.all = (counts.all || 0) + 1;

        const norm = normalizeAgent(line.agent);
        if (norm) {
          if (!buffers[norm]) buffers[norm] = [];
          buffers[norm].push(chunk);
          counts[norm] = (counts[norm] || 0) + 1;
        }
      }

      agentOutputsRef.current = buffers;
      setOutputCounts(counts);

      renderAgentBuffer(selectedAgentFilter, currentTask);
    });
  }, [terminalTaskId]);

  // When tab switches, clear unread and re-render that CLI's buffer
  useEffect(() => {
    const currentTask = useFleetStore.getState().tasks.find((t) => t.id === terminalTaskId);
    setUnreadMap((prev) => ({ ...prev, [selectedAgentFilter]: 0 }));
    renderAgentBuffer(selectedAgentFilter, currentTask);
  }, [selectedAgentFilter]);

  // Live streaming output effect
  useEffect(() => {
    if (!terminalTaskId || !window.electronAPI) return;

    const unsubscribe = window.electronAPI.onTaskOutput((jobId, chunk, agent) => {
      if (jobId !== terminalTaskId) return;

      const normAgent = normalizeAgent(agent || task?.agent);

      // Append to 'all'
      if (!agentOutputsRef.current.all) agentOutputsRef.current.all = [];
      agentOutputsRef.current.all.push(chunk);

      // Append to specific agent
      if (normAgent) {
        if (!agentOutputsRef.current[normAgent]) agentOutputsRef.current[normAgent] = [];
        agentOutputsRef.current[normAgent].push(chunk);
      }

      // Update counts
      setOutputCounts((prev) => ({
        ...prev,
        all: (prev.all || 0) + 1,
        ...(normAgent ? { [normAgent]: (prev[normAgent] || 0) + 1 } : {}),
      }));

      // Stream to terminal if this tab is active
      if (selectedAgentFilter === 'all' || (normAgent && selectedAgentFilter.toLowerCase() === normAgent.toLowerCase())) {
        if (xtermRef.current) {
          xtermRef.current.write(chunk);
        }
      } else if (normAgent) {
        // Increment unread count for that agent tab
        setUnreadMap((prev) => ({
          ...prev,
          [normAgent]: (prev[normAgent] || 0) + 1,
        }));
      }
    });

    return () => {
      unsubscribe?.();
    };
  }, [terminalTaskId, selectedAgentFilter, task?.agent]);

  // Fetch worktree files & preview info periodically while task is viewed
  useEffect(() => {
    if (!terminalTaskId || !window.electronAPI) return;

    const updateFilesAndPreview = () => {
      const api = window.electronAPI;
      if (api?.getWorktreeFiles) {
        api.getWorktreeFiles(terminalTaskId).then((files) => {
          setWorktreeFiles(files || []);
        }).catch(() => {});
      }
      if (api?.getTaskPreview) {
        api.getTaskPreview(terminalTaskId).then((info) => {
          setPreviewInfo(info);
          if (info && activeInspectorTab === 'activity' && info.type === 'file') {
            // Auto-switch to preview if an html file was generated
            setActiveInspectorTab('preview');
          }
        }).catch(() => {});
      }
    };

    updateFilesAndPreview();
    const interval = setInterval(updateFilesAndPreview, 3000);
    return () => clearInterval(interval);
  }, [terminalTaskId, activeInspectorTab]);

  // Subtask drivers for filter tabs
  const subtasks = task?.subtasks || [];
  const subtaskDrivers = subtasks.map((st) => st.assignedAgent).filter(Boolean);
  const additionalDrivers = Array.from(new Set([task?.agent, ...subtaskDrivers].filter(Boolean))) as string[];

  // Combine primary CLIs with any custom additional drivers
  const knownIds = new Set(PRIMARY_CLIS.map((c) => c.id.toLowerCase()));
  const extraTabs = additionalDrivers
    .filter((d) => !knownIds.has(d.toLowerCase()))
    .map((d) => ({
      id: d,
      name: d,
      icon: '🤖',
      desc: `${d} execution logs`,
    }));

  const ALL_CLI_TABS = [...PRIMARY_CLIS, ...extraTabs];
  const currentTabDef = ALL_CLI_TABS.find((c) => c.id === selectedAgentFilter) || ALL_CLI_TABS[0];

  // Task-specific activities
  const taskActivities = activities.filter((a) => (a as any).jobId === terminalTaskId || a.taskId === terminalTaskId || a.message.includes(task?.title || ''));

  // Switch task model handler
  const handleSelectModel = async (modelId: string) => {
    setActiveModel(modelId);
    setShowModelPicker(false);
    if (!terminalTaskId || !window.electronAPI?.updateJob) return;
    await window.electronAPI.updateJob(terminalTaskId, { model: modelId });
    if (xtermRef.current) {
      xtermRef.current.writeln(`\r\n\x1b[35m[Robent] Switched AI model to: ${modelId}\x1b[0m\r\n`);
    }
  };

  // Switch task agent handler
  const handleSelectAgent = async (agentName: string) => {
    if (!terminalTaskId || !window.electronAPI?.updateJob) return;
    await window.electronAPI.updateJob(terminalTaskId, { agent: agentName });
    if (xtermRef.current) {
      xtermRef.current.writeln(`\r\n\x1b[35m[Robent] Switched target agent to: ${agentName}\x1b[0m\r\n`);
    }
    useFleetStore.getState().loadTasks();
  };

  // Launch a specific CLI on this task
  const handleLaunchCli = async (agentName: string) => {
    if (!terminalTaskId) return;
    if (xtermRef.current) {
      xtermRef.current.writeln(`\r\n\x1b[32m[Robent] Starting ${agentName} on task...\x1b[0m\r\n`);
    }
    if (window.electronAPI?.updateJob) {
      await window.electronAPI.updateJob(terminalTaskId, { agent: agentName, model: activeModel });
    }
    await startTask(terminalTaskId);
  };

  // Stop currently running execution
  const handleStopCli = async () => {
    if (!terminalTaskId) return;
    await stopTask(terminalTaskId);
    if (xtermRef.current) {
      xtermRef.current.writeln(`\r\n\x1b[31m[Robent] Stopped ${selectedAgentFilter} execution.\x1b[0m\r\n`);
    }
  };

  // Submit bottom input bar command (with full slash commands support and per-CLI dispatch)
  const handleSendInput = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const raw = inputCommand.trim();
    if (!raw || !terminalTaskId) return;

    // Handle slash commands
    if (raw.startsWith('/')) {
      const parts = raw.split(/\s+/);
      const cmd = parts[0].toLowerCase();
      const arg = parts.slice(1).join(' ');

      if (cmd === '/clear') {
        xtermRef.current?.reset();
        setInputCommand('');
        setShowSlashMenu(false);
        return;
      }

      if (cmd === '/model') {
        if (!arg) {
          setShowModelPicker(true);
          setInputCommand('');
          setShowSlashMenu(false);
          return;
        }
        await handleSelectModel(arg);
        setInputCommand('');
        setShowSlashMenu(false);
        return;
      }

      if (cmd === '/agent') {
        if (arg) {
          await handleSelectAgent(arg);
        } else {
          xtermRef.current?.writeln(`\r\n\x1b[33mUsage: /agent <Claude Code | Codex | Antigravity | OpenCode | Aider>\x1b[0m\r\n`);
        }
        setInputCommand('');
        setShowSlashMenu(false);
        return;
      }

      if (cmd === '/preview') {
        setActiveInspectorTab('preview');
        handleStartPreview();
        setInputCommand('');
        setShowSlashMenu(false);
        return;
      }

      if (cmd === '/diff' || cmd === '/files') {
        setActiveInspectorTab('files');
        setInputCommand('');
        setShowSlashMenu(false);
        return;
      }

      if (cmd === '/merge') {
        mergeTask(terminalTaskId);
        setInputCommand('');
        setShowSlashMenu(false);
        return;
      }

      if (cmd === '/stop') {
        stopTask(terminalTaskId);
        xtermRef.current?.writeln(`\r\n\x1b[31m[Robent] Task stopped via /stop\x1b[0m\r\n`);
        setInputCommand('');
        setShowSlashMenu(false);
        return;
      }

      if (cmd === '/restart') {
        await stopTask(terminalTaskId);
        setTimeout(() => startTask(terminalTaskId), 500);
        xtermRef.current?.writeln(`\r\n\x1b[32m[Robent] Restarting agent on task...\x1b[0m\r\n`);
        setInputCommand('');
        setShowSlashMenu(false);
        return;
      }

      if (cmd === '/help') {
        xtermRef.current?.writeln(`\r\n\x1b[1;36m=== Robent Slash Commands ===\x1b[0m`);
        xtermRef.current?.writeln(`  \x1b[33m/model [name]\x1b[0m   - Switch active model (e.g. /model gpt-4o, /model claude-3-7-sonnet)`);
        xtermRef.current?.writeln(`  \x1b[33m/agent <name>\x1b[0m   - Switch agent (e.g. /agent claude, /agent agy, /agent opencode)`);
        xtermRef.current?.writeln(`  \x1b[33m/clear\x1b[0m          - Clear the terminal screen`);
        xtermRef.current?.writeln(`  \x1b[33m/preview\x1b[0m        - Switch to live web preview / launch dev server`);
        xtermRef.current?.writeln(`  \x1b[33m/diff\x1b[0m           - Switch to file changes tab`);
        xtermRef.current?.writeln(`  \x1b[33m/merge\x1b[0m          - Merge current task branch into main`);
        xtermRef.current?.writeln(`  \x1b[33m/stop\x1b[0m           - Terminate running agent process`);
        xtermRef.current?.writeln(`  \x1b[33m/restart\x1b[0m        - Restart task execution`);
        xtermRef.current?.writeln(`  \x1b[33m/help\x1b[0m           - Display this help message\r\n`);
        setInputCommand('');
        setShowSlashMenu(false);
        return;
      }
    }

    // Normal interactive prompt / command dispatch
    if (selectedAgentFilter !== 'all') {
      const targetAgent = selectedAgentFilter;
      const isRunning = isCliRunning(targetAgent);

      if (isRunning) {
        if (window.electronAPI?.sendTaskInput) {
          window.electronAPI.sendTaskInput(terminalTaskId, raw + '\r\n');
          if (xtermRef.current) {
            xtermRef.current.write(`\r\n\x1b[36m❯ ${raw}\x1b[0m\r\n`);
          }
        }
      } else {
        const otherRunningWorker = (workers || []).find((w) => w.taskId === terminalTaskId && w.status === 'running' && normalizeAgent(w.agent) !== targetAgent);
        const isOtherAgentRunning = task?.status === 'working' && normalizeAgent(task?.agent) !== targetAgent;
        if (isOtherAgentRunning || otherRunningWorker) {
          const busyAgent = task?.agent || otherRunningWorker?.agent || 'Another CLI';
          xtermRef.current?.writeln(`\r\n\x1b[33m[Robent] ${busyAgent} is currently running on this task. Stop it first before launching ${targetAgent}.\x1b[0m\r\n`);
        } else {
          xtermRef.current?.writeln(`\r\n\x1b[32m[Robent] Launching ${targetAgent} on task "${task?.title || terminalTaskId}"...\x1b[0m\r\n`);
          if (window.electronAPI?.updateJob) {
            await window.electronAPI.updateJob(terminalTaskId, { agent: targetAgent, model: activeModel });
          }
          await startTask(terminalTaskId);
        }
      }
    } else {
      if (task?.status === 'working' && window.electronAPI?.sendTaskInput) {
        window.electronAPI.sendTaskInput(terminalTaskId, raw + '\r\n');
        if (xtermRef.current) {
          xtermRef.current.write(`\r\n\x1b[36m❯ ${raw}\x1b[0m\r\n`);
        }
      } else {
        await startTask(terminalTaskId);
      }
    }

    setInputCommand('');
    setShowSlashMenu(false);
  };

  // Keyboard shortcut for Esc interrupt and slash suggestions
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (showSlashMenu) {
        setShowSlashMenu(false);
        return;
      }
      if (showModelPicker) {
        setShowModelPicker(false);
        return;
      }
      if (task?.status === 'working') {
        stopTask(terminalTaskId!);
      }
    }
  };

  const handleStartPreview = async () => {
    if (!terminalTaskId || !window.electronAPI?.startPreviewServer) return;
    setStartingPreview(true);
    try {
      await window.electronAPI.startPreviewServer(terminalTaskId);
    } finally {
      setStartingPreview(false);
    }
  };

  const filteredFiles = worktreeFiles.filter((f) =>
    f.path.toLowerCase().includes(searchFileQuery.toLowerCase())
  );

  if (!terminalTaskId) return null;

  return (
    <div className="flex flex-col h-full bg-[#0a0a0c] text-zinc-100" onKeyDown={handleKeyDown}>
      {/* Top Navigation Bar */}
      <div className="h-11 bg-[#0c0c0e] border-b border-[#1a1a20] px-4 flex items-center justify-between shrink-0 gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={closeTerminal}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#18181f] border border-[#272732] text-xs font-semibold text-zinc-300 hover:text-white hover:bg-[#22222c] transition-colors shrink-0"
            title="Back to Board"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-sky-400" />
            <span>Back to Board</span>
          </button>
          <div className="text-sm font-bold text-zinc-100 truncate flex items-center gap-2">
            <span>{task?.title || 'Terminal Session'}</span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
              task?.status === 'working' ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800 animate-pulse' :
              task?.status === 'review' ? 'bg-amber-950/60 text-amber-400 border-amber-800' :
              task?.status === 'done' ? 'bg-sky-950/60 text-sky-400 border-sky-800' :
              'bg-zinc-800/80 text-zinc-400 border-zinc-700'
            }`}>
              {task?.status || 'idle'}
            </span>
          </div>
        </div>

        {/* Right header actions */}
        <div className="flex items-center gap-2 shrink-0">
          {(task?.status === 'planned' || task?.status === 'assigned') && (
            <button
              onClick={() => startTask(task.id)}
              className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Agent</span>
            </button>
          )}

          {task?.status === 'working' && (
            <button
              onClick={() => stopTask(task.id)}
              className="px-3 py-1 bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Square className="w-3.5 h-3.5" />
              <span>Stop</span>
            </button>
          )}

          <button
            onClick={closeTerminal}
            className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-[#18181f] transition-colors"
            title="Close workspace"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Multi-CLI Independent Selector Tab Bar */}
      <div className="bg-[#0e0e12] border-b border-[#1b1b24] px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
        {ALL_CLI_TABS.map((cli) => {
          const isWorking = isCliRunning(cli.id);
          const hasOutput = (outputCounts[cli.id] || 0) > 0;
          const unread = unreadMap[cli.id] || 0;
          const isSelected = selectedAgentFilter === cli.id;

          return (
            <button
              key={cli.id}
              onClick={() => setSelectedAgentFilter(cli.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 relative ${
                isSelected
                  ? 'bg-[#1e1e28] text-white border border-[#38384e] shadow-md ring-1 ring-white/10'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#15151c] border border-transparent'
              }`}
            >
              <span className="text-sm">{cli.icon}</span>
              <span className={isSelected ? 'font-bold text-white' : 'font-medium'}>{cli.name}</span>

              {/* Real-time status badge */}
              {isWorking ? (
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-950/90 text-emerald-400 border border-emerald-700/80 text-[10px] font-mono animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Working
                </span>
              ) : hasOutput ? (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-sky-950/40 text-sky-400 border border-sky-800/30">
                  Ready
                </span>
              ) : (
                <span className="text-[10px] text-zinc-600 font-mono">Idle</span>
              )}

              {/* Unread indicator */}
              {unread > 0 && !isSelected && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute -top-0.5 -right-0.5"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Dedicated CLI Status & Action Ribbon */}
      <div className="h-9 bg-[#111116] border-b border-[#1a1a24] px-4 flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {selectedAgentFilter === 'all' ? (
            <div className="flex items-center gap-2 text-zinc-400 truncate">
              <Globe className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="font-semibold text-zinc-200">Unified Multi-CLI Stream</span>
              <span className="text-zinc-600">·</span>
              <span className="text-[11px] text-zinc-400 truncate">Combined console streaming all agent outputs for this task</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-zinc-300 truncate">
              <span className="font-bold text-zinc-100 flex items-center gap-1.5">
                <span>{currentTabDef?.icon}</span>
                <span>{currentTabDef?.name} CLI</span>
              </span>
              <span className="text-zinc-600">·</span>
              {isCliRunning(selectedAgentFilter) ? (
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800 text-[11px] font-mono animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Executing with {activeModel}
                </span>
              ) : (outputCounts[selectedAgentFilter] || 0) > 0 ? (
                <span className="px-2 py-0.5 rounded-full bg-sky-950/60 text-sky-400 border border-sky-800 text-[11px] font-mono">
                  ✓ Output ready ({outputCounts[selectedAgentFilter]} events recorded)
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-zinc-800/80 text-zinc-400 border border-zinc-700 text-[11px] font-mono">
                  Standby · Ready to run
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {selectedAgentFilter !== 'all' && (
            <>
              {isCliRunning(selectedAgentFilter) ? (
                <button
                  onClick={handleStopCli}
                  className="px-2.5 py-1 bg-red-950/70 hover:bg-red-900 border border-red-800 text-red-300 font-bold text-[11px] rounded-lg flex items-center gap-1 transition-colors"
                >
                  <Square className="w-3 h-3" />
                  <span>Stop {selectedAgentFilter}</span>
                </button>
              ) : (
                <button
                  onClick={() => handleLaunchCli(selectedAgentFilter)}
                  disabled={task?.status === 'working'}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-zinc-950 font-bold text-[11px] rounded-lg flex items-center gap-1 transition-colors shadow-sm"
                  title={task?.status === 'working' ? 'Another agent is currently running' : `Run task with ${selectedAgentFilter}`}
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Run with {selectedAgentFilter}</span>
                </button>
              )}
            </>
          )}

          <button
            onClick={() => {
              xtermRef.current?.reset();
            }}
            className="px-2 py-1 bg-[#181820] hover:bg-[#22222e] border border-[#272734] text-zinc-400 hover:text-zinc-200 text-[11px] rounded-lg font-mono transition-colors"
            title="Clear this terminal view"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Main Split Layout: Left Terminal Canvas + Right Inspector Panel */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Column: Interactive Terminal Stream */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#09090b]">
          {/* Substatus Error Alert Banner if any */}
          {task?.subStatus && task.subStatus.toLowerCase().includes('error') && (
            <div className="bg-red-950/50 border-b border-red-800/60 px-4 py-2 flex items-center justify-between text-xs text-red-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span className="font-mono">{task.subStatus}</span>
              </div>
              <button
                onClick={() => startTask(task.id)}
                className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] rounded transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* xterm.js Terminal Container */}
          <div className="flex-1 relative p-2 overflow-hidden">
            <div ref={terminalRef} className="absolute inset-0 p-3" />
          </div>

          {/* Reference Bottom Interactive Input Box & Status Line */}
          <div className="bg-[#0f0f12] border-t border-[#1a1a22] p-2.5 space-y-2 shrink-0 relative">
            
            {/* Slash Command Autocomplete / Suggestions Menu */}
            {showSlashMenu && (
              <div className="absolute bottom-full left-2.5 right-2.5 mb-2 bg-[#141418] border border-[#272732] rounded-xl shadow-2xl overflow-hidden z-30 max-h-64 flex flex-col">
                <div className="px-3 py-2 bg-[#1b1b22] border-b border-[#252530] flex items-center justify-between text-xs text-zinc-400 font-mono">
                  <span className="font-bold text-sky-400 flex items-center gap-1.5">
                    <TerminalIcon className="w-3.5 h-3.5" />
                    <span>Robent Slash Commands</span>
                  </span>
                  <span className="text-[10px] text-zinc-500">esc to close</span>
                </div>
                <div className="overflow-y-auto p-1.5 space-y-0.5">
                  {SLASH_COMMANDS
                    .filter((c) => c.cmd.toLowerCase().includes(inputCommand.toLowerCase()))
                    .map((item) => (
                      <button
                        key={item.cmd}
                        onClick={() => {
                          if (item.action === 'model') {
                            setShowSlashMenu(false);
                            setShowModelPicker(true);
                            setInputCommand('');
                          } else {
                            setInputCommand(item.cmd);
                            setShowSlashMenu(false);
                          }
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-[#202028] flex items-center justify-between group transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-sky-400 group-hover:text-sky-300">
                            {item.cmd}
                          </span>
                          <span className="text-xs text-zinc-400 group-hover:text-zinc-200">
                            {item.desc}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-600 group-hover:text-zinc-400">
                          ↵ select
                        </span>
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* Model Picker Popup Modal */}
            {showModelPicker && (
              <div className="absolute bottom-full left-2.5 right-2.5 mb-2 bg-[#141418] border border-[#272732] rounded-xl shadow-2xl overflow-hidden z-30 flex flex-col">
                <div className="px-3 py-2 bg-[#1b1b22] border-b border-[#252530] flex items-center justify-between text-xs text-zinc-400 font-mono">
                  <span className="font-bold text-purple-400 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>Select AI Model for {task?.agent || 'CLI'}</span>
                  </span>
                  <button
                    onClick={() => setShowModelPicker(false)}
                    className="text-zinc-500 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="p-2 grid grid-cols-2 gap-1.5 max-h-56 overflow-y-auto">
                  {AVAILABLE_MODELS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => handleSelectModel(m.id)}
                      className={`text-left p-2 rounded-lg border transition-all flex flex-col gap-0.5 ${
                        activeModel === m.id
                          ? 'bg-purple-950/40 border-purple-600 text-purple-200'
                          : 'bg-[#181820] border-[#22222c] text-zinc-300 hover:border-zinc-500'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold font-mono">{m.name}</span>
                        {activeModel === m.id && (
                          <span className="text-[10px] bg-purple-500 text-zinc-950 font-extrabold px-1.5 rounded">Active</span>
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-400 truncate">{m.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Form Bar */}
            <form onSubmit={handleSendInput} className="flex items-center gap-2 bg-[#18181c] border border-[#272730] rounded-xl px-3 py-1.5 focus-within:border-sky-500 transition-colors">
              <span className="text-zinc-500 font-mono text-xs select-none">❯</span>
              <input
                type="text"
                value={inputCommand}
                onChange={(e) => {
                  const val = e.target.value;
                  setInputCommand(val);
                  if (val.startsWith('/')) {
                    setShowSlashMenu(true);
                  } else {
                    setShowSlashMenu(false);
                  }
                }}
                placeholder={
                  selectedAgentFilter !== 'all'
                    ? (isCliRunning(selectedAgentFilter)
                        ? `Send input to ${selectedAgentFilter} CLI (or type /)...`
                        : `Type prompt to run ${selectedAgentFilter} CLI, or / for commands...`)
                    : (task?.status === 'working'
                        ? 'Type input to active agent, or / for commands (/model, /preview, /diff)...'
                        : 'Type / for commands (/model, /restart, /help)...')
                }
                className="flex-1 bg-transparent text-xs text-zinc-100 outline-none placeholder:text-zinc-500 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowSlashMenu(!showSlashMenu)}
                className="px-2 py-0.5 rounded bg-[#24242e] hover:bg-[#2d2d3a] text-zinc-300 text-[11px] font-mono font-bold transition-colors"
                title="Open slash commands menu"
              >
                /
              </button>
              <button
                type="submit"
                disabled={!inputCommand.trim()}
                className="text-zinc-400 hover:text-sky-400 disabled:opacity-30 disabled:hover:text-zinc-400 transition-colors"
                title="Send command"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Bottom Status & Key Hints Bar */}
            <div className="flex items-center justify-between text-[11px] text-zinc-500 px-1 font-mono">
              <div className="flex items-center gap-2 truncate">
                <span className="flex items-center gap-1 text-purple-400 font-semibold">
                  <Flame className="w-3 h-3 text-purple-400" />
                  <span>{selectedAgentFilter !== 'all' ? `${selectedAgentFilter} CLI` : (task?.agent || 'CLI Agent')}</span>
                </span>
                <span className="text-zinc-600">·</span>
                {/* Clickable Model Switcher Badge */}
                <button
                  onClick={() => setShowModelPicker(!showModelPicker)}
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#1c1c24] hover:bg-[#282834] text-purple-300 border border-purple-800/40 text-[10px] font-semibold transition-colors"
                  title="Click to change model"
                >
                  <Cpu className="w-2.5 h-2.5" />
                  <span>{activeModel}</span>
                  <ChevronUp className="w-2.5 h-2.5 opacity-60" />
                </button>
                <span className="text-zinc-600">·</span>
                <span className="text-zinc-400 truncate max-w-xs">{task?.worktree || 'Isolated worktree'}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span>/ <span className="text-zinc-400">commands</span></span>
                <span>esc <span className="text-zinc-400">interrupt</span></span>
                {task?.runtime ? (
                  <span className="text-emerald-400 font-bold">{Math.floor(task.runtime / 60)}m {task.runtime % 60}s</span>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 3-Tab Inspector Panel (Activity & PR, Live Web Preview, File Changes) */}
        <div className="w-[420px] bg-[#0d0d10] border-l border-[#1a1a22] flex flex-col shrink-0">
          
          {/* Top 3 Inspector Tab Icons */}
          <div className="h-11 border-b border-[#1a1a22] px-3 flex items-center justify-between shrink-0 bg-[#0f0f13]">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveInspectorTab('activity')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  activeInspectorTab === 'activity'
                    ? 'bg-[#1c1c24] text-white border border-[#2a2a36]'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#16161c]'
                }`}
                title="Activity & Pull Request"
              >
                <ListTodo className="w-3.5 h-3.5 text-sky-400" />
                <span>Activity</span>
              </button>

              <button
                onClick={() => setActiveInspectorTab('preview')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  activeInspectorTab === 'preview'
                    ? 'bg-[#1c1c24] text-white border border-[#2a2a36]'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#16161c]'
                }`}
                title="Live Web Preview"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span>Preview</span>
                {previewInfo && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />}
              </button>

              <button
                onClick={() => setActiveInspectorTab('files')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  activeInspectorTab === 'files'
                    ? 'bg-[#1c1c24] text-white border border-[#2a2a36]'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#16161c]'
                }`}
                title="File Changes & Diffs"
              >
                <FileText className="w-3.5 h-3.5 text-purple-400" />
                <span>Files</span>
                {worktreeFiles.length > 0 && (
                  <span className="text-[10px] bg-purple-950 text-purple-300 px-1.5 py-0.2 rounded-full font-bold">
                    {worktreeFiles.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Tab 1: Activity & Pull Request */}
          {activeInspectorTab === 'activity' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {/* Pull Request Box */}
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                  Pull Request
                </div>
                <div className="bg-[#131318] border border-[#1f1f28] rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GitPullRequest className="w-4 h-4 text-sky-400" />
                    <span className="text-xs text-zinc-300">
                      {task?.prNumber ? `PR #${task.prNumber} ready for review` : 'No pull request opened yet.'}
                    </span>
                  </div>
                  {task?.status === 'review' && (
                    <button
                      onClick={() => mergeTask(task.id)}
                      className="px-2.5 py-1 bg-white hover:bg-zinc-200 text-zinc-950 text-[11px] font-bold rounded-lg transition-colors"
                    >
                      Merge
                    </button>
                  )}
                </div>
              </div>

              {/* Completion Settings */}
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                  Completion
                </div>
                <div className="bg-[#131318] border border-[#1f1f28] rounded-xl p-3 flex items-center justify-between">
                  <span className="text-xs text-zinc-300">Terminate on merge</span>
                  <button
                    type="button"
                    onClick={() => setTerminateOnMerge(!terminateOnMerge)}
                    className={`w-9 h-5 rounded-full transition-colors relative flex items-center p-0.5 ${
                      terminateOnMerge ? 'bg-sky-500' : 'bg-zinc-800'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        terminateOnMerge ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Chronological Activity Feed */}
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                  Activity
                </div>
                <div className="space-y-3 pl-2 border-l border-[#22222a]">
                  {taskActivities.length > 0 ? (
                    taskActivities.map((act) => (
                      <div key={act.id} className="relative pl-3 text-xs space-y-0.5">
                        <span className="absolute -left-[13px] top-1.5 w-2 h-2 rounded-full bg-sky-500" />
                        <div className="text-zinc-200 font-medium">{act.message}</div>
                        <div className="text-[10px] text-zinc-500 font-mono">{act.timestamp}</div>
                      </div>
                    ))
                  ) : (
                    <div className="relative pl-3 text-xs space-y-0.5">
                      <span className="absolute -left-[13px] top-1.5 w-2 h-2 rounded-full bg-zinc-600" />
                      <div className="text-zinc-400">Created workspace</div>
                      <div className="text-[10px] text-zinc-600 font-mono">Just now</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Live In-App Browser / Preview */}
          {activeInspectorTab === 'preview' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Browser Address Bar & Actions */}
              <div className="p-2 border-b border-[#1a1a22] flex items-center gap-2 bg-[#0c0c0f]">
                <div className="flex-1 bg-[#16161b] border border-[#272732] rounded-lg px-2.5 py-1 text-xs text-zinc-300 truncate font-mono flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  <span className="truncate">{previewInfo?.url || 'No active web preview'}</span>
                </div>
                {previewInfo && (
                  <>
                    <button
                      onClick={() => {
                        const iframe = document.getElementById('robent-preview-frame') as HTMLIFrameElement;
                        if (iframe) iframe.src = previewInfo.url;
                      }}
                      className="p-1 text-zinc-400 hover:text-white rounded hover:bg-[#202028] transition-colors"
                      title="Reload preview"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => window.electronAPI?.openExternal(previewInfo.url)}
                      className="p-1 text-zinc-400 hover:text-white rounded hover:bg-[#202028] transition-colors"
                      title="Open in external browser"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>

              {/* Preview Body */}
              <div className="flex-1 bg-white relative overflow-hidden flex items-center justify-center">
                {previewInfo ? (
                  <iframe
                    id="robent-preview-frame"
                    src={previewInfo.url}
                    className="w-full h-full border-0 bg-white"
                    title="Live Web Preview"
                    sandbox="allow-scripts allow-same-origin allow-forms"
                  />
                ) : (
                  <div className="text-center p-6 space-y-3 bg-[#0a0a0c] w-full h-full flex flex-col items-center justify-center">
                    <Globe className="w-8 h-8 text-zinc-600" />
                    <p className="text-xs text-zinc-400 max-w-xs">
                      No web output detected yet. If this task creates an HTML app or Vite server, it will render here automatically.
                    </p>
                    <button
                      onClick={handleStartPreview}
                      disabled={startingPreview}
                      className="px-3 py-1.5 bg-sky-500 text-zinc-950 font-bold text-xs rounded-lg hover:bg-sky-400 transition-colors disabled:opacity-50"
                    >
                      {startingPreview ? 'Starting Preview...' : 'Start Local Dev Server'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 3: File Changes & Diffs */}
          {activeInspectorTab === 'files' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Search Bar */}
              <div className="p-2.5 border-b border-[#1a1a22] bg-[#0c0c0f]">
                <div className="flex items-center gap-2 bg-[#16161b] border border-[#272732] rounded-lg px-2.5 py-1 text-xs text-zinc-300">
                  <Search className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  <input
                    type="text"
                    value={searchFileQuery}
                    onChange={(e) => setSearchFileQuery(e.target.value)}
                    placeholder={`Search ${worktreeFiles.length} file changes...`}
                    className="w-full bg-transparent outline-none text-xs placeholder:text-zinc-500"
                  />
                </div>
              </div>

              {/* File List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {filteredFiles.length > 0 ? (
                  filteredFiles.map((file) => (
                    <div
                      key={file.path}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-[#181820] text-xs font-mono group transition-colors"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          file.index === 'A' || file.working_dir === '?'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}>
                          {file.index === 'A' || file.working_dir === '?' ? 'A' : 'M'}
                        </span>
                        <span className="text-zinc-300 truncate">{file.path}</span>
                      </div>
                      <span className="text-[10px] text-zinc-600 group-hover:text-zinc-400 transition-colors">
                        Ready
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 space-y-2 text-zinc-500 text-xs">
                    <FileText className="w-6 h-6 mx-auto opacity-50" />
                    <p>No changed files recorded yet in this workspace.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

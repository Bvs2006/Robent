import { useState, useRef, useEffect } from 'react';
import { X, Play, Pause, SkipBack, SkipForward, ArrowLeft } from 'lucide-react';
import { useFleetStore } from '../../store/fleetStore';
import { Terminal } from 'xterm';
import { FitAddon } from '@xterm/addon-fit';
import 'xterm/css/xterm.css';

export default function TerminalView() {
  const { terminalTaskId, closeTerminal, tasks } = useFleetStore();
  const task = tasks.find((t) => t.id === terminalTaskId);
  
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [replayMode, setReplayMode] = useState(false);
  const [replayLines, setReplayLines] = useState<any[]>([]);
  const [scrubPosition, setScrubPosition] = useState(0);
  const [playing, setPlaying] = useState(false);

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

    // Interactive input to running CLI
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

  const [selectedAgentFilter, setSelectedAgentFilter] = useState<string>('all')

  const subtasks = task?.subtasks || []
  const subtaskDrivers = subtasks.map((st) => st.assignedAgent).filter(Boolean)
  const availableDrivers = Array.from(new Set([task?.agent, ...subtaskDrivers].filter(Boolean))) as string[]

  // Playback/Scrubbing logic
  useEffect(() => {
    if (!playing || !replayLines.length) return;
    
    const timer = setInterval(() => {
      setScrubPosition((prev) => {
        const next = prev + 1;
        if (xtermRef.current) {
          xtermRef.current.writeln(replayLines[prev]?.content || '');
        }
        if (next >= replayLines.length) {
          setPlaying(false);
          return prev;
        }
        return next;
      });
    }, 50);
    
    return () => clearInterval(timer);
  }, [playing, replayLines]);

  // Scrub to position
  useEffect(() => {
    if (!replayMode || replayLines.length === 0) return;
    if (xtermRef.current) {
      xtermRef.current.reset();
      for (let i = 0; i < scrubPosition; i++) {
        xtermRef.current.writeln(replayLines[i]?.content || '');
      }
    }
  }, [scrubPosition, replayLines, replayMode]);

  // Live streaming output effect
  useEffect(() => {
    if (!terminalTaskId || replayMode || !window.electronAPI) return;

    const unsubscribe = window.electronAPI.onTaskOutput((jobId, chunk) => {
      if (jobId !== terminalTaskId) return;
      if (xtermRef.current) {
        xtermRef.current.write(chunk);
      }
    });

    return () => {
      unsubscribe?.();
    };
  }, [terminalTaskId, replayMode]);

  const toggleReplay = () => {
    if (!replayMode) {
      // Enter replay mode
      if (terminalTaskId && window.electronAPI) {
        window.electronAPI.getTerminalLines(terminalTaskId).then((lines: any[]) => {
          setReplayLines(lines);
          setScrubPosition(0);
          setPlaying(false);
          if (xtermRef.current) {
            xtermRef.current.reset();
          }
        });
      }
    }
    setReplayMode(!replayMode);
  };

  // Load existing output and history on task selection
  useEffect(() => {
    if (!terminalTaskId || !window.electronAPI) return
    
    const currentTask = useFleetStore.getState().tasks.find((t) => t.id === terminalTaskId)
    window.electronAPI.getTerminalLines(terminalTaskId).then((lines: any[]) => {
      const filteredLines = selectedAgentFilter === 'all'
        ? (lines || [])
        : (lines || []).filter((l) => l.agent?.toLowerCase() === selectedAgentFilter.toLowerCase())
      setReplayLines(filteredLines)
      if (!replayMode && xtermRef.current) {
        xtermRef.current.reset()
        if (filteredLines && filteredLines.length > 0) {
          for (const line of filteredLines) {
            xtermRef.current.write(line?.content || '')
          }
        } else {
          xtermRef.current.writeln(`\x1b[38;5;244m[Robent CLI Terminal initialized for ${currentTask?.title || terminalTaskId}]\x1b[0m`)
          if (currentTask?.status === 'working') {
            xtermRef.current.writeln(`\x1b[38;5;244m[Running agent: ${selectedAgentFilter === 'all' ? (currentTask?.agent || 'CLI') : selectedAgentFilter} · streaming output...]\x1b[0m\r\n`)
          } else {
            xtermRef.current.writeln(`\x1b[38;5;244m[Status: ${currentTask?.status || 'idle'}]\x1b[0m\r\n`)
          }
        }
      }
    })
  }, [terminalTaskId, replayMode, selectedAgentFilter])

  if (!terminalTaskId) return null

  return (
    <div className="flex flex-col h-full bg-[#0a0a0c]">
      {/* Header */}
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
          <div className="text-sm font-medium text-zinc-100 truncate">
            {task?.title || 'Terminal'}
          </div>
        </div>

        {/* Multi-CLI Subtask Driver Tabs */}
        {availableDrivers.length > 0 && (
          <div className="flex items-center gap-1 bg-[#131318] p-1 rounded-lg border border-[#22222b]">
            <button
              onClick={() => setSelectedAgentFilter('all')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                selectedAgentFilter === 'all'
                  ? 'bg-sky-500 text-sky-950 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              All CLI Output
            </button>
            {availableDrivers.map((agentName) => (
              <button
                key={agentName}
                onClick={() => setSelectedAgentFilter(agentName || 'all')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                  selectedAgentFilter === agentName
                    ? 'bg-purple-600 text-white font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {agentName}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 shrink-0">
          {/* Replay mode toggle */}
          {task && task.status !== 'working' && (
            <button
              onClick={toggleReplay}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md transition-colors ${
                replayMode
                  ? 'bg-purple-950/40 border border-purple-800/50 text-purple-400'
                  : 'bg-[#131318] border border-[#1e1e26] text-zinc-500 hover:text-zinc-300'
              }`}
              title={replayMode ? 'Exit replay mode' : 'Session replay'}
            >
              <Play className="w-3 h-3" />
              Replay
            </button>
          )}
          <button 
            onClick={closeTerminal}
            className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-[#18181f] transition-colors"
            title="Close terminal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <div className="flex-1 p-4 overflow-hidden relative">
         <div ref={terminalRef} className="absolute inset-0 p-4" />
      </div>

      {/* Replay scrubber */}
      {replayMode && replayLines.length > 0 && (
        <div className="h-16 bg-[#0c0c0e] border-t border-[#1a1a20] px-4 flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              if (playing) {
                setPlaying(false);
              } else {
                setPlaying(true);
              }
            }}
            className="p-1 text-zinc-400 hover:text-white"
            disabled={scrubPosition >= replayLines.length - 1}
          >
            {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          
          <button
            onClick={() => setScrubPosition(Math.max(0, scrubPosition - 10))}
            className="p-1 text-zinc-500 hover:text-zinc-300"
          >
            <SkipBack className="w-3 h-3" />
          </button>

          <input
            type="range"
            min="0"
            max={replayLines.length - 1}
            value={scrubPosition}
            onChange={(e) => {
              setScrubPosition(Number(e.target.value));
              setPlaying(false);
            }}
            className="flex-1 h-1 accent-purple-500"
          />

          <button
            onClick={() => {
              if (scrubPosition < replayLines.length - 1) {
                setScrubPosition(Math.min(replayLines.length - 1, scrubPosition + 10));
              }
            }}
            className="p-1 text-zinc-500 hover:text-zinc-300"
          >
            <SkipForward className="w-3 h-3" />
          </button>

          <span className="text-[10px] text-zinc-600 font-mono">
            {scrubPosition + 1} / {replayLines.length}
          </span>
        </div>
      )}
    </div>
  );
};

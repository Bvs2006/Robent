import { useEffect, useRef } from 'react';
import { Square, Terminal, X } from 'lucide-react';
import { useFleetStore } from '../../store/fleetStore';

const formatRuntime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) {
    return `${s}s`;
  }
  return `${m}m ${s}s`;
};

export default function WorkerPanel() {
  const { workers, showWorkerPanel, setShowWorkerPanel, stopTask, selectTask, openTerminal } = useFleetStore();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setShowWorkerPanel(false);
      }
    };
    if (showWorkerPanel) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showWorkerPanel, setShowWorkerPanel]);

  if (workers.length === 0) {
    return (
      <div 
        ref={panelRef}
        className="absolute top-[calc(100%+8px)] right-0 w-80 bg-[var(--color-fleet-panel)] border border-[var(--color-fleet-border)] rounded-lg shadow-xl p-3 z-50 flex flex-col gap-3"
      >
        <div className="flex items-center justify-between text-xs text-[var(--color-fleet-text-muted)] font-medium tracking-wider uppercase">
          <span>ACTIVE WORKERS</span>
          <button 
            onClick={() => setShowWorkerPanel(false)}
            className="text-[var(--color-fleet-text-muted)] hover:text-[var(--color-fleet-text)]"
          >
            <X size={14} />
          </button>
        </div>
        <div className="text-sm text-[var(--color-fleet-text-secondary)] italic py-2 text-center">
          No active agent workers.
        </div>
      </div>
    );
  }

  const runningWorkers = workers.filter(w => w.status === 'running');

  return (
    <div 
      ref={panelRef}
      className="absolute top-[calc(100%+8px)] right-0 w-84 bg-[var(--color-fleet-panel)] border border-[var(--color-fleet-border)] rounded-lg shadow-xl p-3 z-50 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between text-xs text-[var(--color-fleet-text-muted)] font-medium tracking-wider uppercase pb-1 border-b border-[var(--color-fleet-border)]">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          WORKERS ({workers.length})
        </span>
        <div className="flex items-center gap-2">
          {runningWorkers.length > 0 && (
            <button
              onClick={() => runningWorkers.forEach(w => stopTask(w.taskId))}
              className="text-[10px] text-red-400 hover:text-red-300 hover:bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20 flex items-center gap-1 transition-colors"
              title="Stop all active workers"
            >
              <Square size={9} fill="currentColor" />
              Stop All
            </button>
          )}
          <button 
            onClick={() => setShowWorkerPanel(false)}
            className="text-[var(--color-fleet-text-muted)] hover:text-[var(--color-fleet-text)] ml-1"
          >
            <X size={14} />
          </button>
        </div>
      </div>
      
      <div className="flex flex-col gap-2.5 max-h-96 overflow-y-auto">
        {workers.map((worker) => (
          <div 
            key={worker.id} 
            className="flex items-center justify-between p-2 rounded-md bg-[var(--color-fleet-bg)]/40 border border-[var(--color-fleet-border)]/60 hover:border-[var(--color-fleet-border)] transition-colors group"
          >
            <div 
              className="flex flex-col gap-0.5 flex-1 min-w-0 cursor-pointer"
              onClick={() => {
                selectTask(worker.taskId);
                setShowWorkerPanel(false);
              }}
            >
              <div className="text-xs text-[var(--color-fleet-text)] font-medium truncate group-hover:text-cyan-400 transition-colors">
                {worker.taskTitle}
              </div>
              <div className="text-[11px] text-[var(--color-fleet-text-secondary)] flex items-center gap-2">
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-white/5 border border-white/10 text-neutral-300 font-mono">
                  {worker.agent}
                </span>
                {worker.status === 'running' ? (
                  <span className="text-emerald-400 font-mono text-[10px]">
                    {formatRuntime(worker.runtime || 0)}
                  </span>
                ) : (
                  <span className="text-[var(--color-fleet-text-muted)] text-[10px]">
                    idle
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0 ml-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openTerminal(worker.taskId);
                  setShowWorkerPanel(false);
                }}
                className="p-1 rounded text-[var(--color-fleet-text-muted)] hover:text-[var(--color-fleet-text)] hover:bg-white/5 transition-colors"
                title="View Terminal"
              >
                <Terminal size={13} />
              </button>
              {worker.status === 'running' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    stopTask(worker.taskId);
                  }}
                  className="p-1 rounded text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                  title="Stop Worker"
                >
                  <Square size={12} fill="currentColor" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

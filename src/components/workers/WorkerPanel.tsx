import { useEffect, useRef } from 'react';
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
  const { workers, showWorkerPanel, setShowWorkerPanel } = useFleetStore();
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
        className="absolute top-[calc(100%+8px)] right-0 w-72 bg-[var(--color-fleet-panel)] border border-[var(--color-fleet-border)] rounded-lg shadow-xl p-3 z-50 flex flex-col gap-3"
      >
        <div className="text-xs text-[var(--color-fleet-text-muted)] font-medium tracking-wider uppercase">
          WORKERS
        </div>
        <div className="text-sm text-[var(--color-fleet-text-secondary)] italic">
          No workers found.
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={panelRef}
      className="absolute top-[calc(100%+8px)] right-0 w-72 bg-[var(--color-fleet-panel)] border border-[var(--color-fleet-border)] rounded-lg shadow-xl p-3 z-50 flex flex-col gap-3"
    >
      <div className="text-xs text-[var(--color-fleet-text-muted)] font-medium tracking-wider uppercase pb-1 border-b border-[var(--color-fleet-border)]">
        WORKERS
      </div>
      
      <div className="flex flex-col gap-3 max-h-96 overflow-y-auto">
        {workers.map((worker) => (
          <div key={worker.id} className="flex items-start gap-3">
            <div className="pt-1">
              <span className={`text-[10px] ${worker.status === 'running' ? 'text-green-500' : 'text-gray-500'}`}>
                {worker.status === 'running' ? '●' : '○'}
              </span>
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <div className="text-sm text-[var(--color-fleet-text)] font-medium line-clamp-1">
                {worker.taskTitle}
              </div>
              
              {worker.status === 'running' ? (
                <div className="text-xs text-[var(--color-fleet-text-secondary)] flex items-center justify-between">
                  <span>{worker.agent}</span>
                  <span>Running {formatRuntime(worker.runtime || 0)}</span>
                </div>
              ) : (
                <div className="text-xs text-[var(--color-fleet-text-muted)]">
                  Waiting
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

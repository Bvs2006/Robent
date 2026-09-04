import { useState, useEffect, useRef } from 'react';
import { Search, Plus, Layout, GitBranch, Terminal, Monitor, Settings, Wrench, Key, OctagonAlert, Shield, FolderPlus, Keyboard, RefreshCw } from 'lucide-react';
import { useFleetStore } from '../../store/fleetStore';

export default function CommandPalette() {
  const {
    setShowCommandPalette,
    setShowNewTaskModal,
    setCurrentPage,
    setShowWorkerPanel,
    setShowToolSetupModal,
    setShowOrchestrator,
    setShowProjectSetupModal,
    setShowShortcutsModal,
    killAll,
    approvalMode,
    setApprovalMode,
    addNotification,
  } = useFleetStore();
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const allCommands = [
    { id: 'new-task', title: 'Create new task', icon: Plus, action: () => setShowNewTaskModal(true) },
    { id: 'dashboard', title: 'Dashboard', icon: Layout, action: () => setCurrentPage('dashboard') },
    {
      id: 'check-updates',
      title: 'Check for Application Updates',
      icon: RefreshCw,
      action: async () => {
        if (!window.electronAPI?.checkForUpdates) {
          addNotification('info', 'Running in local dev mode — updates only available in desktop build');
          return;
        }
        addNotification('info', 'Checking for updates...');
        const res = await window.electronAPI.checkForUpdates();
        if (res?.isPackaged === false) {
          addNotification('info', 'Running in local dev mode — updates only run in desktop build');
        } else if (res?.success === false) {
          addNotification('error', `Update check: ${res.error || 'No update available'}`);
        } else {
          addNotification('success', 'Checking GitHub for newer releases...');
        }
      },
    },
    { id: 'shortcuts', title: 'Keyboard Shortcuts & Quick Help', icon: Keyboard, action: () => setShowShortcutsModal(true) },
    { id: 'tool-setup', title: 'CLI Tool Setup & Diagnostics', icon: Wrench, action: () => setShowToolSetupModal(true) },
    { id: 'orchestrator', title: 'Orchestrator Credentials & Auth', icon: Key, action: () => setShowOrchestrator(true) },
    { id: 'new-project', title: 'Create or Open Project', icon: FolderPlus, action: () => setShowProjectSetupModal(true) },
    { id: 'approval-mode', title: `Toggle Approval Mode (${approvalMode ? 'ON' : 'OFF'})`, icon: Shield, action: () => setApprovalMode(!approvalMode) },
    { id: 'kill-all', title: 'Kill All Active Agents', icon: OctagonAlert, action: () => void killAll() },
    { id: 'sessions', title: 'Open sessions', icon: Terminal, action: () => setCurrentPage('sessions') },
    { id: 'projects', title: 'Open projects', icon: Monitor, action: () => setCurrentPage('projects') },
    { id: 'worktrees', title: 'Open worktrees', icon: GitBranch, action: () => setCurrentPage('worktrees') },
    { id: 'prs', title: 'Open reviews', icon: GitBranch, action: () => setCurrentPage('pullRequests') },
    { id: 'workers', title: 'Show running workers', icon: Monitor, action: () => setShowWorkerPanel(true) },
    { id: 'settings', title: 'Settings', icon: Settings, action: () => setCurrentPage('settings') },
  ];

  const filteredCommands = allCommands.filter(cmd => 
    cmd.title.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  useEffect(() => {
    inputRef.current?.focus();
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowCommandPalette(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (filteredCommands.length > 0) {
          setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (filteredCommands.length > 0) {
          setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          setShowCommandPalette(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredCommands, selectedIndex, setShowCommandPalette]);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-[20vh]" onClick={() => setShowCommandPalette(false)}>
      <div 
        className="bg-[var(--color-fleet-surface)] border border-[var(--color-fleet-border)] rounded-lg w-[520px] shadow-2xl overflow-hidden cmd-palette"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 border-b border-[var(--color-fleet-border)]">
          <Search className="w-4 h-4 text-[var(--color-fleet-text-muted)] mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Robent..."
            className="w-full bg-transparent text-sm text-[var(--color-fleet-text)] outline-none"
          />
        </div>
        
        <div className="max-h-[300px] overflow-y-auto py-2">
          {filteredCommands.length === 0 ? (
            <div className="px-4 py-3 text-sm text-[var(--color-fleet-text-muted)] text-center">
              No commands found
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  className={`px-4 py-2.5 flex items-center gap-3 text-sm cursor-pointer ${
                    isSelected ? 'bg-[var(--color-fleet-sidebar-hover)]' : 'hover:bg-[var(--color-fleet-sidebar-hover)]'
                  }`}
                  onClick={() => {
                    cmd.action();
                    setShowCommandPalette(false);
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <Icon className="text-[var(--color-fleet-text-muted)] w-4 h-4" />
                  <span className="text-[var(--color-fleet-text)]">{cmd.title}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

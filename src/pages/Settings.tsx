import { useState } from 'react';
import { useFleetStore } from '../store/fleetStore';
import PageHeader from '../components/layout/PageHeader';
import { Trash2, Plus, Edit2 } from 'lucide-react';
import type { Skill, Plugin } from '../types';
import ToolSetupChecklist from '../components/setup/ToolSetupChecklist';
import CapabilitiesScreen from '../components/capabilities/CapabilitiesScreen';

type SettingsTab = 'general' | 'tools' | 'capabilities' | 'mcp' | 'credentials' | 'skills' | 'plugins';

export default function Settings() {
  const {
    settings, updateSettings, projectDirectory, setProjectDirectory, approvalMode, setApprovalMode,
    mcpServers, loadMcpServers, addMcpServer, deleteMcpServer,
    credentials, loadCredentials, addCredential, deleteCredential,
    skills, loadSkills, addSkill, deleteSkill,
    plugins, loadPlugins, addPlugin, deletePlugin, togglePlugin,
    addNotification,
  } = useFleetStore();

  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [showAddMcp, setShowAddMcp] = useState(false);
  const [showAddCred, setShowAddCred] = useState(false);
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [showAddPlugin, setShowAddPlugin] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);

  // New MCP server form
  const [mcpForm, setMcpForm] = useState({ name: '', command: '', args: '', env: '' });
  // New credential form
  const [credForm, setCredForm] = useState({ agent: '', label: '', secret: '' });
  // New skill form
  const [skillForm, setSkillForm] = useState({ name: '', content: '' });
  // New plugin form
  const [pluginForm, setPluginForm] = useState({ name: '', type: 'linter' as Plugin['type'], command: '', args: '', env: '' });

  const handleChange = (key: string, value: any) => {
    updateSettings({ [key]: value });
  };

  const handleAddMcp = async () => {
    if (!mcpForm.name || !mcpForm.command) return;
    await addMcpServer({
      name: mcpForm.name,
      command: mcpForm.command,
      args: mcpForm.args || '[]',
      env: mcpForm.env || '{}',
    });
    addNotification('success', `MCP server "${mcpForm.name}" added`);
    setMcpForm({ name: '', command: '', args: '', env: '' });
    setShowAddMcp(false);
    await loadMcpServers();
  };

  const handleAddCred = async () => {
    if (!credForm.agent || !credForm.label || !credForm.secret) return;
    await addCredential(credForm);
    setCredForm({ agent: '', label: '', secret: '' });
    setShowAddCred(false);
    await loadCredentials();
  };

  const handleAddSkill = async () => {
    if (!skillForm.name || !skillForm.content) return;
    await addSkill(skillForm);
    setSkillForm({ name: '', content: '' });
    setShowAddSkill(false);
    await loadSkills();
  };

  const handleEditSkill = async (_id?: string) => {
    if (!skillForm.name || !skillForm.content) return;
    if (editingSkill) {
      // Update would go here - for now, delete + re-add
      await deleteSkill(editingSkill.id);
      await addSkill(skillForm);
      setEditingSkill(null);
    }
    setSkillForm({ name: '', content: '' });
    setShowAddSkill(false);
    await loadSkills();
  };

  const handleAddPlugin = async () => {
    if (!pluginForm.name || !pluginForm.type) return;
    await addPlugin({
      name: pluginForm.name,
      type: pluginForm.type,
      command: pluginForm.command || '',
      args: pluginForm.args || '[]',
      env: pluginForm.env || '{}',
    });
    setPluginForm({ name: '', type: 'linter', command: '', args: '', env: '' });
    setShowAddPlugin(false);
    await loadPlugins();
  };

  const tabs: { id: SettingsTab; label: string }[] = [
    { id: 'general', label: 'General' },
    { id: 'tools', label: 'Tool Setup' },
    { id: 'capabilities', label: 'Capabilities' },
    { id: 'mcp', label: 'MCP Servers' },
    { id: 'credentials', label: 'Agents & Credentials' },
    { id: 'plugins', label: 'Plugins' },
    { id: 'skills', label: 'Skill Library' },
  ];

  return (
    <div className="w-full h-full flex flex-col overflow-y-auto bg-[#09090b]">
      <PageHeader title="Settings" description="Configure Fleet application preferences" />

      <div className="px-8 py-6 max-w-4xl">
        {/* Tab nav */}
        <div className="flex gap-2 border-b border-[#1a1a20] mb-6">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setActiveTab(t.id);
                setShowAddMcp(false);
                setShowAddCred(false);
                setShowAddSkill(false);
                setShowAddPlugin(false);
                setEditingSkill(null);
              }}
              className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === t.id
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* General tab */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            {/* General */}
            <section>
              <h2 className="text-sm font-semibold text-zinc-300 mb-4">General</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-zinc-500 mb-1.5 block">Project Directory</label>
                  <input
                    type="text"
                    value={projectDirectory || ''}
                    onChange={(e) => setProjectDirectory(e.target.value)}
                    className="bg-[#0f0f12] border border-[#1c1c22] rounded-md px-3 py-2 text-sm text-zinc-100 w-full max-w-md focus:border-purple-500 outline-none"
                    placeholder="/path/to/project"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1.5 block">Default Agent</label>
                  <select
                    value={settings.defaultAgent || 'claude-code'}
                    onChange={(e) => handleChange('defaultAgent', e.target.value)}
                    className="bg-[#0f0f12] border border-[#1c1c22] rounded-md px-3 py-2 text-sm text-zinc-100 w-full max-w-md focus:border-purple-500 outline-none"
                  >
                    <option value="claude-code">Claude Code</option>
                    <option value="aider">Aider</option>
                    <option value="codex">Codex</option>
                    <option value="opencode">OpenCode</option>
                    <option value="antigravity">Antigravity</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Appearance */}
            <section>
              <h2 className="text-sm font-semibold text-zinc-300 mb-4">Appearance</h2>
              <div>
                <label className="text-xs text-zinc-500 mb-2 block">Theme</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm text-zinc-100 cursor-pointer">
                    <input
                      type="radio"
                      name="theme"
                      value="dark"
                      checked={settings.theme === 'dark' || !settings.theme}
                      onChange={(e) => handleChange('theme', e.target.value)}
                      className="accent-purple-500 cursor-pointer"
                    />
                    Dark
                  </label>
                  <label className="flex items-center gap-2 text-sm text-zinc-100 cursor-pointer">
                    <input
                      type="radio"
                      name="theme"
                      value="light"
                      checked={settings.theme === 'light'}
                      onChange={(e) => handleChange('theme', e.target.value)}
                      className="accent-purple-500 cursor-pointer"
                    />
                    Light
                  </label>
                </div>
              </div>
            </section>

            {/* Agent */}
            <section>
              <h2 className="text-sm font-semibold text-zinc-300 mb-4">Agent</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-zinc-500 mb-1.5 block">Agent Command</label>
                  <input
                    type="text"
                    value={settings.agentCommand || ''}
                    onChange={(e) => handleChange('agentCommand', e.target.value)}
                    className="bg-[#0f0f12] border border-[#1c1c22] rounded-md px-3 py-2 text-sm text-zinc-100 w-full max-w-md focus:border-purple-500 outline-none"
                    placeholder="claude"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1.5 block">Default Timeout (minutes)</label>
                  <input
                    type="number"
                    value={settings.defaultTimeout || 30}
                    onChange={(e) => handleChange('defaultTimeout', Number(e.target.value))}
                    className="bg-[#0f0f12] border border-[#1c1c22] rounded-md px-3 py-2 text-sm text-zinc-100 w-full max-w-md focus:border-purple-500 outline-none"
                  />
                </div>
              </div>
            </section>

            {/* Approval Mode */}
            <section>
              <h2 className="text-sm font-semibold text-zinc-300 mb-4">Approval Mode</h2>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="approval-mode"
                  checked={approvalMode}
                  onChange={(e) => setApprovalMode(e.target.checked)}
                  className="w-4 h-4 accent-purple-500 border-zinc-700 rounded"
                />
                <label htmlFor="approval-mode" className="text-sm text-zinc-100 cursor-pointer">
                  Ask before running commands (requires confirmation for each agent action)
                </label>
              </div>
            </section>
          </div>
        )}

        {/* Tool setup tab */}
        {activeTab === 'tools' && (
          <div className="space-y-4">
            <ToolSetupChecklist variant="settings" />
          </div>
        )}

        {/* Capabilities tab */}
        {activeTab === 'capabilities' && (
          <div className="space-y-4">
            <CapabilitiesScreen />
          </div>
        )}

        {/* MCP Servers tab */}
        {activeTab === 'mcp' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-300">MCP Servers</h2>
              <button
                onClick={() => setShowAddMcp(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500 hover:bg-purple-400 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Server
              </button>
            </div>

            {showAddMcp && (
              <div className="bg-[#0f0f12] border border-[#1c1c22] rounded-xl p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Name"
                    value={mcpForm.name}
                    onChange={(e) => setMcpForm({...mcpForm, name: e.target.value})}
                    className="bg-[#131318] border border-[#1e1e26] rounded-md px-2.5 py-1.5 text-sm text-zinc-100 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Command"
                    value={mcpForm.command}
                    onChange={(e) => setMcpForm({...mcpForm, command: e.target.value})}
                    className="bg-[#131318] border border-[#1e1e26] rounded-md px-2.5 py-1.5 text-sm text-zinc-100 outline-none"
                  />
                </div>
                <input
                  type="text"
                  placeholder='Args (JSON array, e.g. ["-y", "@modelcontextprotocol/server-filesystem", "."])'
                  value={mcpForm.args}
                  onChange={(e) => setMcpForm({...mcpForm, args: e.target.value})}
                  className="w-full bg-[#131318] border border-[#1e1e26] rounded-md px-2.5 py-1.5 text-sm text-zinc-100 outline-none"
                />
                <input
                  type="text"
                  placeholder='Env (JSON object, e.g. {"GITHUB_TOKEN": "xxx"})'
                  value={mcpForm.env}
                  onChange={(e) => setMcpForm({...mcpForm, env: e.target.value})}
                  className="w-full bg-[#131318] border border-[#1e1e26] rounded-md px-2.5 py-1.5 text-sm text-zinc-100 outline-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddMcp}
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-lg"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setShowAddMcp(false)}
                    className="px-3 py-1.5 bg-[#1a1a22] hover:bg-[#22222a] text-zinc-300 text-xs font-semibold rounded-lg border border-zinc-800"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {mcpServers.length === 0 ? (
              <p className="text-xs text-zinc-600 py-4">No MCP servers configured. Add one to get started.</p>
            ) : (
              <div className="space-y-2">
                {mcpServers.map((srv) => (
                  <div key={srv.id} className="bg-[#0f0f12] border border-[#1c1c22] rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-zinc-100">{srv.name}</div>
                      <div className="text-xs font-mono text-zinc-500">{srv.command} {srv.args}</div>
                    </div>
                    <button
                      onClick={() => deleteMcpServer(srv.id)}
                      className="p-1.5 text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Credentials tab */}
        {activeTab === 'credentials' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-300">Agent Credentials</h2>
              <button
                onClick={() => setShowAddCred(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500 hover:bg-purple-400 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Credential
              </button>
            </div>

            {showAddCred && (
              <div className="bg-[#0f0f12] border border-[#1c1c22] rounded-xl p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Agent (e.g. Claude Code)"
                    value={credForm.agent}
                    onChange={(e) => setCredForm({...credForm, agent: e.target.value})}
                    className="bg-[#131318] border border-[#1e1e26] rounded-md px-2.5 py-1.5 text-sm text-zinc-100 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Label (e.g. Production API key)"
                    value={credForm.label}
                    onChange={(e) => setCredForm({...credForm, label: e.target.value})}
                    className="bg-[#131318] border border-[#1e1e26] rounded-md px-2.5 py-1.5 text-sm text-zinc-100 outline-none"
                  />
                </div>
                <input
                  type="password"
                  placeholder="Secret (API key, token, etc.)"
                  value={credForm.secret}
                  onChange={(e) => setCredForm({...credForm, secret: e.target.value})}
                  className="w-full bg-[#131318] border border-[#1e1e26] rounded-md px-2.5 py-1.5 text-sm text-zinc-100 outline-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddCred}
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-lg"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setShowAddCred(false)}
                    className="px-3 py-1.5 bg-[#1a1a22] hover:bg-[#22222a] text-zinc-300 text-xs font-semibold rounded-lg border border-zinc-800"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {credentials.length === 0 ? (
              <p className="text-xs text-zinc-600 py-4">No credentials saved. Add one to authenticate agents.</p>
            ) : (
              <div className="space-y-2">
                {credentials.map((cred) => (
                  <div key={cred.id} className="bg-[#0f0f12] border border-[#1c1c22] rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-zinc-100">{cred.label}</div>
                      <div className="text-xs text-zinc-500">Agent: {cred.agent}</div>
                    </div>
                    <button
                      onClick={() => deleteCredential(cred.id)}
                      className="p-1.5 text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Skills tab */}
        {activeTab === 'skills' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-300">Skill Library</h2>
              <button
                onClick={() => { setShowAddSkill(true); setEditingSkill(null); setSkillForm({ name: '', content: '' }) }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500 hover:bg-purple-400 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Skill
              </button>
            </div>

            {showAddSkill && (
              <div className="bg-[#0f0f12] border border-[#1c1c22] rounded-xl p-4 space-y-3">
                <input
                  type="text"
                  placeholder="Skill name (e.g. React Hook Patterns)"
                  value={skillForm.name}
                  onChange={(e) => setSkillForm({...skillForm, name: e.target.value})}
                  className="w-full bg-[#131318] border border-[#1e1e26] rounded-md px-2.5 py-1.5 text-sm text-zinc-100 outline-none"
                />
                <textarea
                  placeholder="Skill content (Markdown snippets, instructions, templates)"
                  value={skillForm.content}
                  onChange={(e) => setSkillForm({...skillForm, content: e.target.value})}
                  className="w-full bg-[#131318] border border-[#1e1e26] rounded-md px-2.5 py-2 text-sm text-zinc-100 outline-none h-32 resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (editingSkill) {
                        handleEditSkill()
                      } else {
                        handleAddSkill()
                      }
                    }}
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-lg"
                  >
                    {editingSkill ? 'Update' : 'Save'}
                  </button>
                  <button
                    onClick={() => { setShowAddSkill(false); setEditingSkill(null); setSkillForm({ name: '', content: '' }) }}
                    className="px-3 py-1.5 bg-[#1a1a22] hover:bg-[#22222a] text-zinc-300 text-xs font-semibold rounded-lg border border-zinc-800"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {skills.length === 0 ? (
              <p className="text-xs text-zinc-600 py-4">No skills saved. Add reusable markdown snippets for your agents.</p>
            ) : (
              <div className="space-y-2">
                {skills.map((skill) => (
                  <div key={skill.id} className="bg-[#0f0f12] border border-[#1c1c22] rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-semibold text-zinc-100">{skill.name}</h3>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setEditingSkill(skill);
                            setSkillForm({ name: skill.name, content: skill.content });
                            setShowAddSkill(true);
                          }}
                          className="p-1 text-zinc-400 hover:text-purple-400 hover:bg-[#1a1a22] rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteSkill(skill.id)}
                          className="p-1 text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <pre className="text-xs text-zinc-500 font-mono whitespace-pre-wrap line-clamp-3">
                      {skill.content}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Plugins tab */}
        {activeTab === 'plugins' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-300">Plugins</h2>
              <button
                onClick={() => setShowAddPlugin(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500 hover:bg-purple-400 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Plugin
              </button>
            </div>

            {showAddPlugin && (
              <div className="bg-[#0f0f12] border border-[#1c1c22] rounded-xl p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Plugin name"
                    value={pluginForm.name}
                    onChange={(e) => setPluginForm({...pluginForm, name: e.target.value})}
                    className="bg-[#131318] border border-[#1e1e26] rounded-md px-2.5 py-1.5 text-sm text-zinc-100 outline-none"
                  />
                  <select
                    value={pluginForm.type}
                    onChange={(e) => setPluginForm({...pluginForm, type: e.target.value as Plugin['type']})}
                    className="bg-[#131318] border border-[#1e1e26] rounded-md px-2.5 py-1.5 text-sm text-zinc-100 outline-none"
                  >
                    <option value="linter">Linter</option>
                    <option value="formatter">Formatter</option>
                    <option value="checker">Checker</option>
                    <option value="tester">Tester</option>
                    <option value="analyzer">Analyzer</option>
                  </select>
                </div>
                <input
                  type="text"
                  placeholder="Command (e.g. npx)"
                  value={pluginForm.command}
                  onChange={(e) => setPluginForm({...pluginForm, command: e.target.value})}
                  className="w-full bg-[#131318] border border-[#1e1e26] rounded-md px-2.5 py-1.5 text-sm text-zinc-100 outline-none"
                />
                <input
                  type="text"
                  placeholder='Args (JSON array, e.g. ["lint", "."])'
                  value={pluginForm.args}
                  onChange={(e) => setPluginForm({...pluginForm, args: e.target.value})}
                  className="w-full bg-[#131318] border border-[#1e1e26] rounded-md px-2.5 py-1.5 text-sm text-zinc-100 outline-none"
                />
                <input
                  type="text"
                  placeholder='Env (JSON object, e.g. {"DEBUG": "1"})'
                  value={pluginForm.env}
                  onChange={(e) => setPluginForm({...pluginForm, env: e.target.value})}
                  className="w-full bg-[#131318] border border-[#1e1e26] rounded-md px-2.5 py-1.5 text-sm text-zinc-100 outline-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddPlugin}
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-lg"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setShowAddPlugin(false)}
                    className="px-3 py-1.5 bg-[#1a1a22] hover:bg-[#22222a] text-zinc-300 text-xs font-semibold rounded-lg border border-zinc-800"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {plugins.length === 0 ? (
              <p className="text-xs text-zinc-600 py-4">No plugins configured. Pre-seeded with: Ruff, ESLint, TSC, Prettier, Vitest, Semgrep and more.</p>
            ) : (
              <div className="space-y-2">
                {plugins.map((plugin) => (
                  <div key={plugin.id} className="bg-[#0f0f12] border border-[#1c1c22] rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        plugin.type === 'linter' ? 'bg-yellow-950/30 text-yellow-400' :
                        plugin.type === 'formatter' ? 'bg-blue-950/30 text-blue-400' :
                        plugin.type === 'checker' ? 'bg-purple-950/30 text-purple-400' :
                        plugin.type === 'tester' ? 'bg-emerald-950/30 text-emerald-400' :
                        'bg-sky-950/30 text-sky-400'
                      }`}>
                        {plugin.type}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-zinc-100">{plugin.name}</div>
                        {plugin.command && (
                          <div className="text-xs font-mono text-zinc-500">{plugin.command} {plugin.args}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="relative inline-flex h-5 w-9 items-center rounded-full">
                        <input
                          type="checkbox"
                          checked={plugin.isEnabled}
                          onChange={(e) => togglePlugin(plugin.id, e.target.checked)}
                          className="sr-only"
                        />
                        <span className={`inline-block h-5 w-9 rounded-full transition ${plugin.isEnabled ? 'bg-emerald-500' : 'bg-zinc-700'}`}>
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white m-0.5 transition ${plugin.isEnabled ? 'translate-x-4' : ''}`} />
                        </span>
                      </label>
                      <button
                        onClick={() => deletePlugin(plugin.id)}
                        className="p-1 text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react'
import { Edit2, FolderOpen, Plus, RefreshCcw, TestTube2, Trash2 } from 'lucide-react'
import type { HookEvent, HookScope } from '../../types'

type Registry = {
  mcpServers: any[]
  skills: any[]
  plugins: any[]
  hooks: any[]
}

const EMPTY_MCP = { id: '', name: '', transport: 'stdio', command: '', url: '', args: '[]', env: '{}', enabled: true }
const EMPTY_SKILL = { id: '', name: '', description: '', content: '', tags: '[]', enabled: true }
const EMPTY_PLUGIN = { id: '', name: '', source: '', version: '', enabled: true }
const EMPTY_HOOK = { id: '', name: '', event: 'pre-task', command: '', scope: 'global', enabled: false }

export default function CapabilitiesScreen() {
  const [registry, setRegistry] = useState<Registry>({ mcpServers: [], skills: [], plugins: [], hooks: [] })
  const [mcpForm, setMcpForm] = useState(EMPTY_MCP)
  const [skillForm, setSkillForm] = useState(EMPTY_SKILL)
  const [pluginForm, setPluginForm] = useState(EMPTY_PLUGIN)
  const [hookForm, setHookForm] = useState(EMPTY_HOOK)
  const [testResults, setTestResults] = useState<Record<string, string>>({})

  const loadRegistry = async () => {
    const rows = await window.electronAPI?.getCapabilityRegistry()
    if (rows) setRegistry(rows)
  }

  useEffect(() => {
    loadRegistry()
  }, [])

  const saveMcp = async () => {
    const payload = { ...mcpForm }
    if (payload.id) {
      await window.electronAPI?.updateMcpServer(payload.id, {
        name: payload.name,
        transport: payload.transport,
        command: payload.command,
        url: payload.url,
        args: payload.args,
        env: payload.env,
        enabled: payload.enabled ? 1 : 0,
        is_enabled: payload.enabled ? 1 : 0,
      })
    } else {
      await window.electronAPI?.addMcpServer(payload)
    }
    setMcpForm(EMPTY_MCP)
    await loadRegistry()
  }

  const saveSkill = async () => {
    const payload = { ...skillForm }
    if (payload.id) {
      await window.electronAPI?.updateSkill(payload.id, {
        name: payload.name,
        description: payload.description,
        content: payload.content,
        tags: payload.tags,
        enabled: payload.enabled ? 1 : 0,
      })
    } else {
      await window.electronAPI?.addSkill(payload)
    }
    setSkillForm(EMPTY_SKILL)
    await loadRegistry()
  }

  const savePlugin = async () => {
    const payload = { ...pluginForm }
    if (payload.id) {
      await window.electronAPI?.updatePlugin(payload.id, {
        name: payload.name,
        source: payload.source,
        version: payload.version,
        enabled: payload.enabled ? 1 : 0,
        is_enabled: payload.enabled ? 1 : 0,
      })
    } else {
      await window.electronAPI?.addPlugin(payload)
    }
    setPluginForm(EMPTY_PLUGIN)
    await loadRegistry()
  }

  const saveHook = async () => {
    const payload = {
      name: hookForm.name,
      event: hookForm.event as HookEvent,
      command: hookForm.command,
      scope: hookForm.scope as HookScope,
      enabled: hookForm.enabled,
    }
    if (hookForm.id) {
      await window.electronAPI?.updateHook(hookForm.id, payload)
    } else {
      await window.electronAPI?.addHook(payload)
    }
    setHookForm(EMPTY_HOOK)
    await loadRegistry()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400 mb-2">Capabilities</div>
          <h2 className="text-lg font-bold text-zinc-100">Shared registry for MCP servers, skills, plugins, and hooks</h2>
          <p className="text-sm text-zinc-500 mt-1 max-w-2xl">Edit once here and the sync adapters will project the registry into each driver's own config on demand.</p>
        </div>
        <button onClick={loadRegistry} className="inline-flex items-center gap-2 rounded-lg border border-[#23232a] bg-[#111115] px-3 py-2 text-xs font-semibold text-zinc-300 hover:text-white transition-colors">
          <RefreshCcw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Hooks Section */}
      <section className="rounded-2xl border border-[#1d1d24] bg-[#0f0f12] p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-zinc-100">Hooks</div>
            <div className="text-xs text-zinc-500">Run scripts/commands at defined lifecycle points (pre-task, post-task, on-failure). Default disabled for safety.</div>
          </div>
          <button onClick={() => setHookForm(EMPTY_HOOK)} className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-3 py-2 text-xs font-bold text-sky-950 hover:bg-sky-400">
            <Plus className="w-3.5 h-3.5" /> New Hook
          </button>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <div className="space-y-2 rounded-xl border border-[#1d1d24] bg-[#0b0b0d] p-3">
            <input value={hookForm.name} onChange={(e) => setHookForm({ ...hookForm, name: e.target.value })} placeholder="Hook name (e.g. Run tests post-task)" className="w-full rounded-lg border border-[#22222a] bg-[#111115] px-3 py-2 text-xs text-zinc-100 outline-none" />
            <div className="grid gap-2 md:grid-cols-2">
              <select value={hookForm.event} onChange={(e) => setHookForm({ ...hookForm, event: e.target.value })} className="rounded-lg border border-[#22222a] bg-[#111115] px-3 py-2 text-xs text-zinc-100 outline-none">
                <option value="pre-task">pre-task</option>
                <option value="post-task">post-task</option>
                <option value="pre-command">pre-command</option>
                <option value="post-command">post-command</option>
                <option value="on-failure">on-failure</option>
              </select>
              <select value={hookForm.scope} onChange={(e) => setHookForm({ ...hookForm, scope: e.target.value })} className="rounded-lg border border-[#22222a] bg-[#111115] px-3 py-2 text-xs text-zinc-100 outline-none">
                <option value="global">Global (all tools)</option>
                <option value="claude-code">Claude Code</option>
                <option value="codex">Codex</option>
                <option value="opencode">OpenCode</option>
                <option value="antigravity">Antigravity</option>
                <option value="aider">Aider</option>
              </select>
            </div>
            <input value={hookForm.command} onChange={(e) => setHookForm({ ...hookForm, command: e.target.value })} placeholder="Shell command (e.g. npm test or uv run ruff check)" className="w-full rounded-lg border border-[#22222a] bg-[#111115] px-3 py-2 text-xs text-zinc-100 outline-none font-mono" />
            <label className="flex items-center gap-2 text-xs text-zinc-400"><input type="checkbox" checked={hookForm.enabled} onChange={(e) => setHookForm({ ...hookForm, enabled: e.target.checked })} /> Enabled (Explicit user opt-in required)</label>
            <div className="flex gap-2">
              <button onClick={saveHook} className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-bold text-black hover:bg-emerald-400">{hookForm.id ? 'Update' : 'Add'}</button>
              <button onClick={() => setHookForm(EMPTY_HOOK)} className="rounded-lg border border-[#22222a] bg-[#111115] px-3 py-2 text-xs font-semibold text-zinc-400 hover:text-white">Clear</button>
            </div>
          </div>

          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {(registry.hooks || []).map((hook) => (
              <div key={hook.id} className="rounded-xl border border-[#202028] bg-[#0b0b0d] p-3 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-zinc-100">{hook.name}</div>
                    <div className="text-[11px] text-purple-400 font-mono">{hook.event} · Scope: {hook.scope}</div>
                    <div className="text-[11px] font-mono text-zinc-400 bg-[#141418] px-2 py-1 rounded border border-[#22222a] mt-1">$ {hook.command}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={async () => { await window.electronAPI?.toggleHook(hook.id, !hook.enabled); await loadRegistry(); }} className="rounded-lg border border-[#23232a] bg-[#111115] px-2 py-2 text-[10px] font-semibold text-zinc-400 hover:text-white" title={hook.enabled ? 'Disable' : 'Enable'}>{hook.enabled ? 'On' : 'Off'}</button>
                    <button onClick={async () => { setTestResults((c) => ({ ...c, [hook.id]: 'Running test...' })); const res = await window.electronAPI?.testHookCommand(hook.command); setTestResults((c) => ({ ...c, [hook.id]: res?.output || 'No output' })); }} className="rounded-lg border border-[#23232a] bg-[#111115] p-2 text-zinc-400 hover:text-white" title="Test Run Command"><TestTube2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setHookForm(hook)} className="rounded-lg border border-[#23232a] bg-[#111115] p-2 text-zinc-400 hover:text-white" title="Edit"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={async () => { await window.electronAPI?.deleteHook(hook.id); await loadRegistry(); }} className="rounded-lg border border-[#23232a] bg-[#111115] p-2 text-red-400 hover:text-red-300" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                {testResults[hook.id] && (
                  <pre className="max-h-28 overflow-auto whitespace-pre-wrap rounded-lg border border-[#202028] bg-[#111115] p-2.5 text-[10px] font-mono text-sky-300">{testResults[hook.id]}</pre>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[#1d1d24] bg-[#0f0f12] p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-zinc-100">MCP Servers</div>
            <div className="text-xs text-zinc-500">Transport, command/url, args, env, and enabled state are stored centrally.</div>
          </div>
          <button onClick={() => setMcpForm(EMPTY_MCP)} className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-3 py-2 text-xs font-bold text-sky-950 hover:bg-sky-400">
            <Plus className="w-3.5 h-3.5" /> New
          </button>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <div className="space-y-2 rounded-xl border border-[#1d1d24] bg-[#0b0b0d] p-3">
            <div className="grid gap-2 md:grid-cols-2">
              <input value={mcpForm.name} onChange={(e) => setMcpForm({ ...mcpForm, name: e.target.value })} placeholder="Server name" className="rounded-lg border border-[#22222a] bg-[#111115] px-3 py-2 text-xs text-zinc-100 outline-none" />
              <select value={mcpForm.transport} onChange={(e) => setMcpForm({ ...mcpForm, transport: e.target.value })} className="rounded-lg border border-[#22222a] bg-[#111115] px-3 py-2 text-xs text-zinc-100 outline-none">
                <option value="stdio">stdio</option>
                <option value="http">http</option>
                <option value="sse">sse</option>
              </select>
            </div>
            {mcpForm.transport === 'stdio' ? (
              <input value={mcpForm.command} onChange={(e) => setMcpForm({ ...mcpForm, command: e.target.value })} placeholder="Command" className="w-full rounded-lg border border-[#22222a] bg-[#111115] px-3 py-2 text-xs text-zinc-100 outline-none" />
            ) : (
              <input value={mcpForm.url} onChange={(e) => setMcpForm({ ...mcpForm, url: e.target.value })} placeholder="URL" className="w-full rounded-lg border border-[#22222a] bg-[#111115] px-3 py-2 text-xs text-zinc-100 outline-none" />
            )}
            <input value={mcpForm.args} onChange={(e) => setMcpForm({ ...mcpForm, args: e.target.value })} placeholder='Args JSON e.g. ["-y"]' className="w-full rounded-lg border border-[#22222a] bg-[#111115] px-3 py-2 text-xs text-zinc-100 outline-none" />
            <input value={mcpForm.env} onChange={(e) => setMcpForm({ ...mcpForm, env: e.target.value })} placeholder='Env JSON e.g. {"TOKEN":"..."}' className="w-full rounded-lg border border-[#22222a] bg-[#111115] px-3 py-2 text-xs text-zinc-100 outline-none" />
            <label className="flex items-center gap-2 text-xs text-zinc-400"><input type="checkbox" checked={mcpForm.enabled} onChange={(e) => setMcpForm({ ...mcpForm, enabled: e.target.checked })} /> Enabled</label>
            <div className="flex gap-2">
              <button onClick={saveMcp} className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-bold text-black hover:bg-emerald-400">{mcpForm.id ? 'Update' : 'Add'}</button>
              <button onClick={() => setMcpForm(EMPTY_MCP)} className="rounded-lg border border-[#22222a] bg-[#111115] px-3 py-2 text-xs font-semibold text-zinc-400 hover:text-white">Clear</button>
            </div>
          </div>

          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {(registry.mcpServers || []).map((server) => (
              <div key={server.id} className="rounded-xl border border-[#202028] bg-[#0b0b0d] p-3 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-zinc-100">{server.name}</div>
                    <div className="text-[11px] text-zinc-500 font-mono">{server.transport} {server.command || server.url}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={async () => { await window.electronAPI?.updateMcpServer(server.id, { enabled: server.enabled ? 0 : 1, is_enabled: server.enabled ? 0 : 1 }); await loadRegistry(); }} className="rounded-lg border border-[#23232a] bg-[#111115] px-2 py-2 text-[10px] font-semibold text-zinc-400 hover:text-white" title={server.enabled ? 'Disable' : 'Enable'}>{server.enabled ? 'Off' : 'On'}</button>
                    <button onClick={async () => { const result = await window.electronAPI?.testMcpServerConnection(server); setTestResults((current) => ({ ...current, [server.id]: result?.message || 'Connection failed' })); }} className="rounded-lg border border-[#23232a] bg-[#111115] p-2 text-zinc-400 hover:text-white" title="Test connection"><TestTube2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setMcpForm(server)} className="rounded-lg border border-[#23232a] bg-[#111115] p-2 text-zinc-400 hover:text-white" title="Edit"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={async () => { await window.electronAPI?.deleteMcpServer(server.id); await loadRegistry(); }} className="rounded-lg border border-[#23232a] bg-[#111115] p-2 text-red-400 hover:text-red-300" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <div className="text-[11px] text-zinc-600">{server.enabled ? 'Enabled' : 'Disabled'}</div>
                {testResults[server.id] && <div className="text-[11px] text-sky-400">{testResults[server.id]}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[#1d1d24] bg-[#0f0f12] p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-zinc-100">Skills</div>
            <div className="text-xs text-zinc-500">Markdown content and tags are stored centrally and synced per driver.</div>
          </div>
          <button onClick={() => setSkillForm(EMPTY_SKILL)} className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-3 py-2 text-xs font-bold text-sky-950 hover:bg-sky-400"><Plus className="w-3.5 h-3.5" /> New</button>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <div className="space-y-2 rounded-xl border border-[#1d1d24] bg-[#0b0b0d] p-3">
            <input value={skillForm.name} onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })} placeholder="Skill name" className="w-full rounded-lg border border-[#22222a] bg-[#111115] px-3 py-2 text-xs text-zinc-100 outline-none" />
            <input value={skillForm.description} onChange={(e) => setSkillForm({ ...skillForm, description: e.target.value })} placeholder="Description" className="w-full rounded-lg border border-[#22222a] bg-[#111115] px-3 py-2 text-xs text-zinc-100 outline-none" />
            <input value={skillForm.tags} onChange={(e) => setSkillForm({ ...skillForm, tags: e.target.value })} placeholder='Tags JSON e.g. ["refactor","ui"]' className="w-full rounded-lg border border-[#22222a] bg-[#111115] px-3 py-2 text-xs text-zinc-100 outline-none" />
            <textarea value={skillForm.content} onChange={(e) => setSkillForm({ ...skillForm, content: e.target.value })} placeholder="Markdown content" className="h-40 w-full rounded-lg border border-[#22222a] bg-[#111115] px-3 py-2 text-xs text-zinc-100 outline-none resize-none" />
            <label className="flex items-center gap-2 text-xs text-zinc-400"><input type="checkbox" checked={skillForm.enabled} onChange={(e) => setSkillForm({ ...skillForm, enabled: e.target.checked })} /> Enabled</label>
            <div className="flex gap-2">
              <button onClick={saveSkill} className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-bold text-black hover:bg-emerald-400">{skillForm.id ? 'Update' : 'Add'}</button>
              <button onClick={() => setSkillForm(EMPTY_SKILL)} className="rounded-lg border border-[#22222a] bg-[#111115] px-3 py-2 text-xs font-semibold text-zinc-400 hover:text-white">Clear</button>
            </div>
          </div>

          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {(registry.skills || []).map((skill) => (
              <div key={skill.id} className="rounded-xl border border-[#202028] bg-[#0b0b0d] p-3 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-zinc-100">{skill.name}</div>
                    <div className="text-[11px] text-zinc-500">{skill.description}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={async () => { await window.electronAPI?.updateSkill(skill.id, { enabled: skill.enabled ? 0 : 1 }); await loadRegistry(); }} className="rounded-lg border border-[#23232a] bg-[#111115] px-2 py-2 text-[10px] font-semibold text-zinc-400 hover:text-white" title={skill.enabled ? 'Disable' : 'Enable'}>{skill.enabled ? 'Off' : 'On'}</button>
                    <button onClick={() => setSkillForm(skill)} className="rounded-lg border border-[#23232a] bg-[#111115] p-2 text-zinc-400 hover:text-white" title="Edit"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={async () => { await window.electronAPI?.deleteSkill(skill.id); await loadRegistry(); }} className="rounded-lg border border-[#23232a] bg-[#111115] p-2 text-red-400 hover:text-red-300" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <pre className="max-h-28 overflow-auto whitespace-pre-wrap rounded-lg border border-[#202028] bg-[#111115] p-3 text-[11px] text-zinc-400">{skill.content}</pre>
                <div className="text-[11px] text-zinc-600">{skill.enabled ? 'Enabled' : 'Disabled'}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[#1d1d24] bg-[#0f0f12] p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-zinc-100">Plugins</div>
            <div className="text-xs text-zinc-500">Install by npm package, git URL, or local path, then let the driver sync layer expose it.</div>
          </div>
          <button onClick={() => setPluginForm(EMPTY_PLUGIN)} className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-3 py-2 text-xs font-bold text-sky-950 hover:bg-sky-400"><Plus className="w-3.5 h-3.5" /> New</button>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <div className="space-y-2 rounded-xl border border-[#1d1d24] bg-[#0b0b0d] p-3">
            <input value={pluginForm.name} onChange={(e) => setPluginForm({ ...pluginForm, name: e.target.value })} placeholder="Plugin name" className="w-full rounded-lg border border-[#22222a] bg-[#111115] px-3 py-2 text-xs text-zinc-100 outline-none" />
            <input value={pluginForm.source} onChange={(e) => setPluginForm({ ...pluginForm, source: e.target.value })} placeholder="npm package / git url / local path" className="w-full rounded-lg border border-[#22222a] bg-[#111115] px-3 py-2 text-xs text-zinc-100 outline-none" />
            <input value={pluginForm.version} onChange={(e) => setPluginForm({ ...pluginForm, version: e.target.value })} placeholder="Version or ref" className="w-full rounded-lg border border-[#22222a] bg-[#111115] px-3 py-2 text-xs text-zinc-100 outline-none" />
            <label className="flex items-center gap-2 text-xs text-zinc-400"><input type="checkbox" checked={pluginForm.enabled} onChange={(e) => setPluginForm({ ...pluginForm, enabled: e.target.checked })} /> Enabled</label>
            <div className="flex gap-2">
              <button onClick={savePlugin} className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-bold text-black hover:bg-emerald-400">{pluginForm.id ? 'Update' : 'Add'}</button>
              <button onClick={() => setPluginForm(EMPTY_PLUGIN)} className="rounded-lg border border-[#22222a] bg-[#111115] px-3 py-2 text-xs font-semibold text-zinc-400 hover:text-white">Clear</button>
            </div>
          </div>

          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {(registry.plugins || []).map((plugin) => (
              <div key={plugin.id} className="rounded-xl border border-[#202028] bg-[#0b0b0d] p-3 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-zinc-100">{plugin.name}</div>
                    <div className="text-[11px] text-zinc-500">{plugin.source}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={async () => { await window.electronAPI?.updatePlugin(plugin.id, { enabled: plugin.enabled ? 0 : 1, is_enabled: plugin.enabled ? 0 : 1 }); await loadRegistry(); }} className="rounded-lg border border-[#23232a] bg-[#111115] px-2 py-2 text-[10px] font-semibold text-zinc-400 hover:text-white" title={plugin.enabled ? 'Disable' : 'Enable'}>{plugin.enabled ? 'Off' : 'On'}</button>
                    <button onClick={() => setPluginForm(plugin)} className="rounded-lg border border-[#23232a] bg-[#111115] p-2 text-zinc-400 hover:text-white" title="Edit"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={async () => { await window.electronAPI?.deletePlugin(plugin.id); await loadRegistry(); }} className="rounded-lg border border-[#23232a] bg-[#111115] p-2 text-red-400 hover:text-red-300" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <div className="text-[11px] text-zinc-600">{plugin.enabled ? 'Enabled' : 'Disabled'}{plugin.version ? ` · ${plugin.version}` : ''}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="text-xs text-zinc-600 flex items-center gap-2">
        <FolderOpen className="w-3.5 h-3.5" />
        Changes here are synced into each driver's working directory right before it runs.
      </div>
    </div>
  )
}

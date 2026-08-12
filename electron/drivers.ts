/**
 * electron/drivers.ts — Agent Driver Layer
 * 
 * BaseDriver: abstract class with run/cancel interface
 * Each concrete driver spawns the actual CLI via node-pty.
 * All drivers normalize output to { status, summary, raw, tokenCount, cost }
 */
import { spawn } from 'node-pty'
import type { IPty } from 'node-pty'
import * as os from 'os'

export interface TaskResult {
  status: 'success' | 'failed'
  summary: string
  raw: string
  tokenCount?: number
  cost?: number
}

type OutputCallback = (chunk: string) => void

export abstract class BaseDriver {
  protected ptyProcess: IPty | null = null
  protected rawOutput: string = ''

  /** Return the command + args for this agent */
  abstract getCommandAndArgs(task: string): { command: string; args: string[] }

  /** Parse raw output to extract summary, tokens, cost */
  protected parseResult(_raw: string): Partial<TaskResult> {
    return {}
  }

  run(task: string, workdir: string, onOutput: OutputCallback): { jobId: string; promise: Promise<TaskResult> } {
    const jobId = Math.random().toString(36).substring(7)
    this.rawOutput = ''

    const promise = new Promise<TaskResult>((resolve) => {
      const { command, args } = this.getCommandAndArgs(task)
      const isWin = os.platform() === 'win32'
      const shell = isWin ? 'cmd.exe' : 'bash'
      const fullCmd = [command, ...args].join(' ')
      const shellArgs = isWin
        ? ['/c', fullCmd]
        : ['-c', fullCmd]

      this.ptyProcess = spawn(shell, shellArgs, {
        name: 'xterm-color',
        cols: 120,
        rows: 40,
        cwd: workdir,
        env: { ...(process.env as Record<string, string>) },
      })

      this.ptyProcess.onData((data) => {
        this.rawOutput += data
        onOutput(data)
      })

      this.ptyProcess.onExit(({ exitCode }) => {
        const parsed = this.parseResult(this.rawOutput)
        resolve({
          status: exitCode === 0 ? 'success' : 'failed',
          summary: parsed.summary || (exitCode === 0 ? 'Task completed.' : `Process exited with code ${exitCode}`),
          raw: this.rawOutput,
          tokenCount: parsed.tokenCount,
          cost: parsed.cost,
        })
      })
    })

    return { jobId, promise }
  }

  cancel(_jobId: string): void {
    if (this.ptyProcess) {
      this.ptyProcess.kill()
      this.ptyProcess = null
    }
  }
}

// ─── Claude Code ────────────────────────────────────────────────────────────
export class ClaudeCodeDriver extends BaseDriver {
  getCommandAndArgs(task: string) {
    return { command: 'claude', args: ['-p', `"${task}"`, '--output-format', 'json'] }
  }
  protected parseResult(raw: string): Partial<TaskResult> {
    try {
      const json = JSON.parse(raw.trim().split('\n').filter(l => l.startsWith('{')).join(''))
      return {
        summary: json.result || json.summary || 'Done',
        tokenCount: json.usage?.input_tokens,
        cost: json.usage?.input_tokens ? json.usage.input_tokens * 0.000003 : 0,
      }
    } catch { return {} }
  }
}

// ─── Codex ──────────────────────────────────────────────────────────────────
export class CodexDriver extends BaseDriver {
  getCommandAndArgs(task: string) {
    return { command: 'codex', args: ['exec', `"${task}"`, '--full-auto'] }
  }
}

// ─── Antigravity ─────────────────────────────────────────────────────────────
export class AntigravityDriver extends BaseDriver {
  getCommandAndArgs(task: string) {
    return { command: 'agy', args: ['-p', `"${task}"`, '--output-format', 'json'] }
  }
  protected parseResult(raw: string): Partial<TaskResult> {
    if (raw.includes('Authentication required') || raw.includes('not logged in')) {
      return { summary: '⚠️ Auth error: run `agy login` first', status: 'failed' as const }
    }
    return {}
  }
}

// ─── Aider ───────────────────────────────────────────────────────────────────
export class AiderDriver extends BaseDriver {
  getCommandAndArgs(task: string) {
    return { command: 'aider', args: ['--message', `"${task}"`, '--yes', '--no-auto-commits'] }
  }
  protected parseResult(raw: string): Partial<TaskResult> {
    const tokenMatch = raw.match(/Tokens:\s*([\d,]+)\s*sent/i)
    const costMatch = raw.match(/Cost:\s*\$?([\d.]+)/i)
    return {
      tokenCount: tokenMatch ? parseInt(tokenMatch[1].replace(',', '')) : undefined,
      cost: costMatch ? parseFloat(costMatch[1]) : undefined,
    }
  }
}

// ─── OpenCode ────────────────────────────────────────────────────────────────
export class OpenCodeDriver extends BaseDriver {
  getCommandAndArgs(task: string) {
    return { command: 'opencode', args: ['run', `"${task}"`, '--yes'] }
  }
}

// ─── Cursor ──────────────────────────────────────────────────────────────────
export class CursorDriver extends BaseDriver {
  getCommandAndArgs(task: string) {
    return { command: 'cursor', args: ['--task', `"${task}"`, '--headless'] }
  }
}

// ─── GitHub Copilot ────────────────────────────────────────────────────────────
export class GithubCopilotDriver extends BaseDriver {
  getCommandAndArgs(task: string) {
    return { command: 'gh', args: ['api', 'copilot/chat', '-f', `message="${task}"`, '--method', 'POST'] }
  }
  protected parseResult(raw: string): Partial<TaskResult> {
    try {
      const json = JSON.parse(raw.trim().split('\n').filter(l => l.startsWith('{')).join(''))
      return { summary: json.content || json.message || 'Done' }
    } catch { return {} }
  }
}

// ─── Dummy (fallback / test) ──────────────────────────────────────────────────
export class DummyDriver extends BaseDriver {
  getCommandAndArgs(task: string) {
    return { command: 'echo', args: [`"[Robent] Running: ${task.substring(0, 80)}..."`] }
  }
}

// ─── Factory ──────────────────────────────────────────────────────────────────
export function createDriver(agentName: string): BaseDriver {
  switch (agentName?.toLowerCase().replace(/\s+/g, '-')) {
    case 'claude-code':
    case 'claude code': return new ClaudeCodeDriver()
    case 'codex': return new CodexDriver()
    case 'antigravity': return new AntigravityDriver()
    case 'aider': return new AiderDriver()
    case 'opencode': return new OpenCodeDriver()
    case 'cursor': return new CursorDriver()
    case 'github copilot':
    case 'github-copilot': return new GithubCopilotDriver()
    default: return new DummyDriver()
  }
}

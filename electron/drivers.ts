/**
 * electron/drivers.ts — Agent Driver Layer
 *
 * Each concrete driver spawns the actual CLI via node-pty.
 * All drivers normalize output to { status, summary, raw, tokenCount, cost }
 */
import { spawnPty } from './pty.js'
import type { IPty } from './pty.js'
import * as os from 'os'
import { execSync } from 'child_process'
import { toolEnv, resolveToolBinary } from './tool-setup.js'

export interface TaskResult {
  status: 'success' | 'failed'
  summary: string
  raw: string
  tokenCount?: number
  cost?: number
}

type OutputCallback = (chunk: string) => void

export interface DriverOptions {
  model?: string
  approvalMode?: boolean
}

export abstract class BaseDriver {
  protected ptyProcess: IPty | null = null
  protected rawOutput: string = ''
  private timeoutHandle: ReturnType<typeof setTimeout> | null = null

  abstract getCommandAndArgs(task: string, options?: DriverOptions): { command: string; args: string[] }

  protected parseResult(_raw: string): Partial<TaskResult> {
    return {}
  }

  run(
    task: string,
    workdir: string,
    onOutput: OutputCallback,
    extraEnv: Record<string, string> = {},
    timeoutMs = 30 * 60 * 1000,
    options?: DriverOptions,
  ): { jobId: string; promise: Promise<TaskResult> } {
    const jobId = Math.random().toString(36).substring(7)
    this.rawOutput = ''

    const promise = new Promise<TaskResult>((resolve) => {
      const { command, args } = this.getCommandAndArgs(task, options)
      const resolvedBinary = resolveToolBinary(command)
      let settled = false

      const finish = (result: TaskResult) => {
        if (settled) return
        settled = true
        if (this.timeoutHandle) {
          clearTimeout(this.timeoutHandle)
          this.timeoutHandle = null
        }
        resolve(result)
      }

      this.ptyProcess = spawnPty(resolvedBinary, args, {
        name: 'xterm-color',
        cols: 120,
        rows: 40,
        cwd: workdir,
        env: { ...toolEnv(), ...extraEnv },
      })

      this.ptyProcess.onData((data) => {
        this.rawOutput += data
        onOutput(data)
      })

      this.ptyProcess.onExit(({ exitCode }) => {
        const parsed = this.parseResult(this.rawOutput)
        finish({
          status: exitCode === 0 ? 'success' : 'failed',
          summary: parsed.summary || (exitCode === 0 ? 'Task completed.' : `Process exited with code ${exitCode}`),
          raw: this.rawOutput,
          tokenCount: parsed.tokenCount,
          cost: parsed.cost,
        })
      })

      if (timeoutMs > 0) {
        this.timeoutHandle = setTimeout(() => {
          this.cancel(jobId)
          finish({
            status: 'failed',
            summary: `Timed out after ${Math.round(timeoutMs / 60000)} minutes.`,
            raw: this.rawOutput,
          })
        }, timeoutMs)
      }
    })

    return { jobId, promise }
  }

  write(data: string): boolean {
    if (!this.ptyProcess) return false
    try {
      this.ptyProcess.write(data)
      return true
    } catch {
      return false
    }
  }

  cancel(_jobId: string): void {
    if (this.timeoutHandle) {
      clearTimeout(this.timeoutHandle)
      this.timeoutHandle = null
    }
    if (this.ptyProcess) {
      try {
        if (os.platform() === 'win32' && this.ptyProcess.pid) {
          execSync(`taskkill /PID ${this.ptyProcess.pid} /T /F`, { stdio: 'ignore' })
        }
      } catch {
        /* ignore if process already terminated */
      }
      try {
        this.ptyProcess.kill()
      } catch {
        /* already exited */
      }
      this.ptyProcess = null
    }
  }
}

export class ClaudeCodeDriver extends BaseDriver {
  getCommandAndArgs(task: string, options?: DriverOptions) {
    const args = ['-p', task]
    if (!options?.approvalMode) {
      args.push('--dangerously-skip-permissions')
    }
    if (options?.model) {
      args.push('--model', options.model)
    }
    return { command: 'claude', args }
  }
  protected parseResult(raw: string): Partial<TaskResult> {
    try {
      const json = JSON.parse(raw.trim().split('\n').filter((l) => l.startsWith('{')).join(''))
      return {
        summary: json.result || json.summary || 'Done',
        tokenCount: json.usage?.input_tokens,
        cost: json.usage?.input_tokens ? json.usage.input_tokens * 0.000003 : 0,
      }
    } catch {
      return {}
    }
  }
}

export class CodexDriver extends BaseDriver {
  getCommandAndArgs(task: string, options?: DriverOptions) {
    const args = ['exec', task]
    if (!options?.approvalMode) {
      args.push('--full-auto')
    }
    if (options?.model) {
      args.push('--model', options.model)
    }
    return { command: 'codex', args }
  }
}

export class AntigravityDriver extends BaseDriver {
  getCommandAndArgs(task: string, options?: DriverOptions) {
    const args = ['-p', task]
    if (!options?.approvalMode) {
      args.push('--dangerously-skip-permissions')
    }
    if (options?.model) {
      args.push('--model', options.model)
    }
    return { command: 'agy', args }
  }
  protected parseResult(raw: string): Partial<TaskResult> {
    if (raw.includes('Authentication required') || raw.includes('not logged in')) {
      return { summary: 'Auth error: run `agy login` first', status: 'failed' as const }
    }
    return {}
  }
}

export class AiderDriver extends BaseDriver {
  getCommandAndArgs(task: string, options?: DriverOptions) {
    const args = ['--message', task, '--no-auto-commits']
    if (!options?.approvalMode) {
      args.push('--yes')
    }
    if (options?.model) {
      args.push('--model', options.model)
    }
    return { command: 'aider', args }
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

export class OpenCodeDriver extends BaseDriver {
  getCommandAndArgs(task: string, options?: DriverOptions) {
    const args = ['run', task]
    if (!options?.approvalMode) {
      args.push('--auto')
    }
    if (options?.model) {
      args.push('--model', options.model)
    }
    return { command: 'opencode', args }
  }
}

export class CursorDriver extends BaseDriver {
  getCommandAndArgs(task: string, options?: DriverOptions) {
    const args = ['-p', task]
    if (!options?.approvalMode) {
      args.push('--force')
    }
    if (options?.model) {
      args.push('--model', options.model)
    }
    return { command: 'agent', args }
  }
}

export class GithubCopilotDriver extends BaseDriver {
  getCommandAndArgs(task: string, _options?: DriverOptions) {
    return { command: 'gh', args: ['copilot', 'suggest', '-t', 'shell', task] }
  }
  protected parseResult(raw: string): Partial<TaskResult> {
    try {
      const json = JSON.parse(raw.trim().split('\n').filter((l) => l.startsWith('{')).join(''))
      return { summary: json.content || json.message || 'Done' }
    } catch {
      return { summary: raw.trim().slice(-400) || 'Done' }
    }
  }
}

export class DummyDriver extends BaseDriver {
  getCommandAndArgs(task: string, _options?: DriverOptions) {
    return { command: 'echo', args: [`[Robent] Running: ${task.substring(0, 80)}...`] }
  }
}

export function createDriver(agentName: string): BaseDriver {
  switch (agentName?.toLowerCase().replace(/\s+/g, '-')) {
    case 'claude-code':
    case 'claude':
      return new ClaudeCodeDriver()
    case 'codex':
      return new CodexDriver()
    case 'antigravity':
    case 'agy':
      return new AntigravityDriver()
    case 'aider':
      return new AiderDriver()
    case 'opencode':
      return new OpenCodeDriver()
    case 'cursor':
      return new CursorDriver()
    case 'github-copilot':
    case 'github copilot':
      return new GithubCopilotDriver()
    default:
      return new DummyDriver()
  }
}

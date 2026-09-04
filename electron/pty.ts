/**
 * electron/pty.ts — Resilient PTY loader and process manager
 *
 * Uses createRequire to load node-pty from node_modules at runtime, ensuring
 * that native binaries (conpty.node, pty.node) are resolved from node-pty's
 * installed directory rather than being corrupted by Vite/Rolldown bundling.
 *
 * Includes a robust fallback using Node child_process if native PTY fails.
 */
import { createRequire } from 'node:module'
import { spawn as cpSpawn, execSync } from 'node:child_process'
import type { ChildProcess } from 'node:child_process'
import * as os from 'os'
import type { IPty, IPtyForkOptions, IWindowsPtyForkOptions } from 'node-pty'

const require = createRequire(import.meta.url)

let nodePty: typeof import('node-pty') | null = null
try {
  nodePty = require('node-pty')
} catch (err) {
  console.warn('[PTY] Native node-pty require failed, fallback will be used if needed:', err)
}

/**
 * Fallback PTY wrapper implementing IPty using Node's child_process.
 */
class ChildProcessPtyFallback {
  public pid: number
  private proc: ChildProcess
  private dataListeners: ((data: string) => void)[] = []
  private exitListeners: ((event: { exitCode: number; signal?: number }) => void)[] = []

  constructor(file: string, args: string[] | string, opt: any) {
    const isWin = os.platform() === 'win32'
    const shell = isWin ? 'cmd.exe' : 'bash'
    const fullCmd = Array.isArray(args) ? [file, ...args].join(' ') : `${file} ${args}`
    const shellArgs = isWin ? ['/d', '/s', '/c', fullCmd] : ['-lc', fullCmd]

    this.proc = cpSpawn(shell, shellArgs, {
      cwd: opt.cwd,
      env: opt.env,
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true,
    })

    this.pid = this.proc.pid || 0

    this.proc.stdout?.on('data', (d: Buffer) => {
      const text = d.toString('utf8')
      this.dataListeners.forEach((fn) => fn(text))
    })
    this.proc.stderr?.on('data', (d: Buffer) => {
      const text = d.toString('utf8')
      this.dataListeners.forEach((fn) => fn(text))
    })
    this.proc.on('exit', (code, signal) => {
      this.exitListeners.forEach((fn) => fn({ exitCode: code ?? 0, signal: signal ? 1 : undefined }))
    })
    this.proc.on('error', (err) => {
      const msg = `\r\n\x1b[31m[Process Error: ${err.message}]\x1b[0m\r\n`
      this.dataListeners.forEach((fn) => fn(msg))
      this.exitListeners.forEach((fn) => fn({ exitCode: 1 }))
    })
  }

  onData(fn: (data: string) => void) {
    this.dataListeners.push(fn)
  }

  onExit(fn: (e: { exitCode: number; signal?: number }) => void) {
    this.exitListeners.push(fn)
  }

  write(data: string): void {
    try {
      this.proc.stdin?.write(data)
    } catch {
      /* ignore */
    }
  }

  resize(_cols: number, _rows: number): void {
    /* child_process stdio pipe has no resize */
  }

  kill(signal?: string): void {
    try {
      if (os.platform() === 'win32' && this.proc.pid) {
        execSync(`taskkill /PID ${this.proc.pid} /T /F`, { stdio: 'ignore' })
      } else {
        this.proc.kill(signal as NodeJS.Signals | undefined)
      }
    } catch {
      /* process may already be dead */
    }
  }
}

/**
 * Spawns a process in a PTY (ConPTY on Windows) with automatic fallback.
 */
export function spawnPty(
  file: string,
  args: string[] | string,
  options: IPtyForkOptions | IWindowsPtyForkOptions
): IPty {
  if (nodePty && typeof nodePty.spawn === 'function') {
    try {
      return nodePty.spawn(file, args, options)
    } catch (err) {
      console.warn('[PTY] node-pty.spawn failed, switching to ChildProcess fallback:', err)
    }
  }

  return new ChildProcessPtyFallback(file, args, options) as unknown as IPty
}

export type { IPty }

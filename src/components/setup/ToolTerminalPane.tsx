import { useEffect, useRef } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from '@xterm/addon-fit'
import 'xterm/css/xterm.css'

interface ToolTerminalPaneProps {
  output: string
  visible: boolean
  /** When true, keystrokes are forwarded via onInput (for interactive CLI auth). */
  interactive?: boolean
  onInput?: (data: string) => void
  /** Extra classes for the terminal container (e.g. taller auth pane). */
  className?: string
}

export default function ToolTerminalPane({
  output,
  visible,
  interactive = false,
  onInput,
  className,
}: ToolTerminalPaneProps) {
  const terminalRef = useRef<HTMLDivElement>(null)
  const termRef = useRef<Terminal | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const lastOutputLengthRef = useRef(0)
  const onInputRef = useRef(onInput)
  onInputRef.current = onInput

  useEffect(() => {
    if (!visible || !terminalRef.current || termRef.current) return

    const term = new Terminal({
      theme: { background: '#09090b', foreground: '#d4d4d8' },
      fontFamily: 'monospace',
      fontSize: 11,
      cursorBlink: true,
      scrollback: 2000,
      disableStdin: !interactive,
    })
    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)
    term.open(terminalRef.current)
    fitAddon.fit()

    let dataDisposable: { dispose: () => void } | null = null
    if (interactive) {
      dataDisposable = term.onData((data) => {
        onInputRef.current?.(data)
      })
    }

    termRef.current = term
    fitAddonRef.current = fitAddon

    const resizeObserver = new ResizeObserver(() => fitAddon.fit())
    resizeObserver.observe(terminalRef.current)

    return () => {
      dataDisposable?.dispose()
      resizeObserver.disconnect()
      term.dispose()
      termRef.current = null
      fitAddonRef.current = null
      lastOutputLengthRef.current = 0
    }
  }, [visible, interactive])

  useEffect(() => {
    if (!termRef.current) return
    const previousLength = lastOutputLengthRef.current
    if (output.length < previousLength) {
      termRef.current.reset()
      termRef.current.write(output)
      lastOutputLengthRef.current = output.length
      return
    }

    if (output.length > previousLength) {
      termRef.current.write(output.slice(previousLength))
      lastOutputLengthRef.current = output.length
    }
  }, [output])

  if (!visible) return null

  return (
    <div
      ref={terminalRef}
      className={className || 'h-28 w-full rounded-lg overflow-hidden border border-[#1f1f25] bg-[#09090b]'}
      onClick={() => termRef.current?.focus()}
    />
  )
}

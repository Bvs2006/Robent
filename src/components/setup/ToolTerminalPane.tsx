import { useEffect, useRef } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from '@xterm/addon-fit'
import 'xterm/css/xterm.css'

interface ToolTerminalPaneProps {
  output: string
  visible: boolean
}

export default function ToolTerminalPane({ output, visible }: ToolTerminalPaneProps) {
  const terminalRef = useRef<HTMLDivElement>(null)
  const termRef = useRef<Terminal | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const lastOutputLengthRef = useRef(0)

  useEffect(() => {
    if (!visible || !terminalRef.current || termRef.current) return

    const term = new Terminal({
      theme: { background: '#09090b', foreground: '#d4d4d8' },
      fontFamily: 'monospace',
      fontSize: 11,
      cursorBlink: true,
      scrollback: 2000,
    })
    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)
    term.open(terminalRef.current)
    fitAddon.fit()

    termRef.current = term
    fitAddonRef.current = fitAddon

    const resizeObserver = new ResizeObserver(() => fitAddon.fit())
    resizeObserver.observe(terminalRef.current)

    return () => {
      resizeObserver.disconnect()
      term.dispose()
      termRef.current = null
      fitAddonRef.current = null
      lastOutputLengthRef.current = 0
    }
  }, [visible])

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

  return <div ref={terminalRef} className="h-28 w-full rounded-lg overflow-hidden border border-[#1f1f25] bg-[#09090b]" />
}

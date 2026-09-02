import { Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Robent] Uncaught render error:', error, errorInfo)
    this.setState({ errorInfo })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[300px] p-8 gap-4">
          <div className="flex items-center gap-3 text-red-400">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <span className="text-base font-semibold">Something went wrong</span>
          </div>

          {this.state.error && (
            <pre className="max-w-xl w-full bg-[#0f0f12] border border-red-900/40 rounded-lg px-4 py-3 text-xs text-red-300 font-mono overflow-auto max-h-40 whitespace-pre-wrap">
              {this.state.error.message}
            </pre>
          )}

          <button
            onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
            className="flex items-center gap-2 px-4 py-2 bg-[#18181e] hover:bg-[#22222a] border border-[#27272a] text-zinc-300 hover:text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

# Application Name

Robent is a local Electron desktop app for orchestrating coding agents across isolated Git worktrees.

## About

Create tasks, assign them to CLI agents (Claude Code, Codex, OpenCode, Aider, Antigravity), review diffs, and merge or discard results. Shared MCP servers, skills, and plugins sync into each agent worktree before a run.

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Git
- At least one coding-agent CLI installed and authenticated

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

This starts Vite and Electron together.

### Building for Production

```bash
npm run build
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `dev` | Start Electron + Vite with HMR |
| `build` | Typecheck, build renderer/main, package with electron-builder |
| `lint` | Run Oxlint |
| `preview` | Preview the renderer build |

## Project Structure

```
electron/   # Main process: SQLite, IPC, drivers, git worktrees
src/        # React renderer: board, sessions, projects, settings
```

## Technologies

- Electron
- React + TypeScript + Vite
- Zustand
- Tailwind CSS
- better-sqlite3
- simple-git
- node-pty / xterm

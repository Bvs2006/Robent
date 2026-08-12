# Application Name

A brief description of what this application does and its purpose.

## Table of Contents

- [About](#about)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Technologies](#technologies)
- [Configuration](#configuration)

## About

This application is built with React + TypeScript + Vite. It provides a modern development experience with hot module replacement (HMR), linting with Oxlint, and ready-to-use React Compiler configuration.

The application follows best practices for type safety, component organization, and build performance.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm, yarn, pnpm, or bun

### Installation

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

### Development

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

The app will be available at `http://localhost:5173`.

### Building for Production

```bash
npm run build
# or
yarn build
# or
pnpm build
# or
bun build
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `dev` | Start development server with HMR |
| `build` | Build for production |
| `lint` | Run Oxlint to check code quality |
| `preview` | Preview production build locally |

## Project Structure

```
src/
  ├── components/   # Reusable UI components
  ├── pages/        # Page components
  ├── hooks/        # Custom React hooks
  ├── utils/        # Utility functions
  ├── styles/       # Global styles
  └── types/        # TypeScript type definitions
```

## Technologies

- **React** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Oxlint** - Linting with type-aware rules
- **React Compiler** - Optional compilation optimizations

## Configuration

### Oxlint

To enable type-aware linting, install `oxlint-tsgolint` and configure `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

### React Compiler

The React Compiler is not enabled by default due to performance considerations. To add it, see the [React Compiler documentation](https://react.dev/learn/react-compiler/installation).
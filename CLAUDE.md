# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HyLove Demo is a React TypeScript application for brainwave analysis. It provides a web interface for uploading brainwave data files (CSV/XLSX), running various analysis plugins, and viewing reports. Data is persisted in the browser's localStorage.

## Commands

```bash
npm start          # Start development server (port 3000)
npm run build      # Production build
npm test           # Run tests with Jest (interactive watch mode)
npm test -- --watchAll=false  # Run tests once without watch mode
```

## Architecture

### Plugin System

The analysis functionality uses a plugin architecture located in `src/analysis/`:

- **`registry.ts`**: Core plugin registry with `registerPlugin()` and `getPlugins()` functions. Defines the `AnalysisPlugin` interface requiring: `id`, `name`, `description`, `requiredFiles`, `execute` function, and `renderReport` function.
- **`plugins/index.ts`**: Imports all plugin files to auto-register them
- **`plugins/*.tsx`**: Individual analysis plugins (e.g., `yuanshenyin.tsx`, `hengyunlai.tsx`)

To add a new analysis plugin:
1. Create a new file in `src/analysis/plugins/`
2. Define an `AnalysisPlugin` object with required fields
3. Call `registerPlugin(plugin)` at module level
4. Import the new file in `plugins/index.ts`

### Data Flow

1. **File Upload**: `useFileManager` hook parses CSV/XLSX files and stores in localStorage
2. **Analysis Execution**: Plugins call API endpoints via `src/services/api.ts` (base URL from `REACT_APP_ANALYSIS_API_BASE`)
3. **Results**: Stored in localStorage via `useAnalysisManager` hook
4. **Rendering**: Each plugin's `renderReport` function handles visualization

### Key Hooks

- `useFileManager` (`src/hooks/useFileManager.ts`): File CRUD with localStorage persistence
- `useUserManager` (`src/hooks/useUserManager.ts`): Multi-user management
- `useAnalysisManager` (`src/hooks/useAnalysisManager.ts`): Analysis history tracking

### User Context

`UserContext` (`src/context/UserContext.tsx`) provides global user state. Wrap components with `UserProvider` and access via `useUserContext()`.

## Tech Stack

- React 19 with TypeScript (strict mode)
- React Router v7 for routing
- DaisyUI/TailwindCSS for styling (use DaisyUI component classes)
- Highcharts for data visualization
- xlsx library for Excel file parsing
- Jest + React Testing Library for tests

## Backend API

- **Base URL**: Configured via `REACT_APP_ANALYSIS_API_BASE` in `.env`
- **API Documentation**: `{BASE_URL}/api-docs` (Swagger UI)
- **OpenAPI Spec**: `{BASE_URL}/api-docs/v1/swagger.yaml`

## Deployment

Uses Docker with multi-platform build (amd64/arm64). Nginx serves the built app with basic auth configured via `.htpasswd`.
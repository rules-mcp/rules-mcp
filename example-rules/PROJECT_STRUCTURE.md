---
name: PROJECT_STRUCTURE
description: Overview of the Rules MCP project structure.
alwaysApply: true
tags: ['project-overview', 'documentation']
---

# Project Structure: Rules MCP

This document outlines the main directories and their purposes within the Rules MCP project.

- **`bin/`**: Contains the compiled JavaScript output of the server.

  - `server.js`: The main executable for the Rules MCP server.

- **`example-rules/`**: Houses example rule files that demonstrate how to define rules for the AI agent. These are typically Markdown files with YAML front-matter.

- **`src/`**: Contains the TypeScript source code for the project.

  - `server.ts`: The primary TypeScript file for the Rules MCP server logic.
  - `prompts/`: Mostly contains prompts for the Rules MCP Tool descriptions and responses.
    - `list-always-rules.ts`
    - `list-agent-requested-rules.ts`
    - `list-glob-rules.ts`
    - `list-tag-rules.ts`

- **`logs/`**: Used for storing logs, scratch notes, and other development-related artifacts.

- **Root Files**:
  - `package.json`: Defines project dependencies and scripts.
  - `pnpm-lock.yaml`: Lockfile for pnpm package manager.
  - `tsconfig.json`: TypeScript compiler configuration.
  - `README.md`: Main project documentation.
  - `notes.md`: Additional notes.

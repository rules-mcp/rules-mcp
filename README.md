# Rules MCP

An MCP Server that makes user-defined rules accessible to any AI agent. Define rules in Markdown with front-matter—extending the Cursor rules format—and agents are provided context to load the right rules at the right time.

With context-aware loading, tags, and file pattern support, your standards and best practices are always loaded by the agent.

## Quick Setup

The fastest way to get started is with npx. Choose your platform:

<details>
<summary>Claude Code</summary>

1. Create a local `.mcp.json` file in your project directory or a global `~/.claude.json` file.
2. Add the following configuration:
   ```json
   {
     "mcpServers": {
       "rules-mcp": {
         "type": "stdio",
         "command": "npx",
         "args": ["-y", "rules-mcp", "<path-to-your-rules>"]
       }
     }
   }
   ```

</details>

<details>
<summary>Claude for Desktop</summary>

1. Create a global `~/Library/Application Support/Claude/claude_desktop_config.json` file.
2. Add the following configuration:
   ```json
   {
     "mcpServers": {
       "rules-mcp": {
         "command": "npx",
         "args": ["-y", "rules-mcp", "<path-to-your-rules>"]
       }
     }
   }
   ```

</details>

<details>
<summary>Cursor</summary>

1. Create a local `.cursor/mcp.json` file in your project directory or a global `~/.cursor/mcp.json` file.
2. Add the following configuration:
   ```json
   {
     "mcpServers": {
       "rules-mcp": {
         "command": "npx",
         "args": ["-y", "rules-mcp", "<path-to-your-rules>"]
       }
     }
   }
   ```

</details>

<details>
<summary>VS Code</summary>

1. Create a local `.vscode/mcp.json` file in your project directory.
2. Add the following configuration:
   ```json
   {
     "servers": {
       "rules-mcp": {
         "type": "stdio",
         "command": "npx",
         "args": ["-y", "rules-mcp", "<path-to-your-rules>"]
       }
     }
   }
   ```

</details>

## Quick Start

After completing the [setup](#quick-setup), create a `rules/` directory and add your first rule:

````markdown
---
name: MARKDOWN_FORMATTING_PRINCIPLES
description: 'Preferred markdown formatting for documentation and code comments'
alwaysApply: false
tags: ['markdown', 'documentation', 'style']
globs: ['**/*.md', '**/*.{js,ts}']
---

# Markdown Formatting Principles

- Use fenced code blocks with language identifiers (e.g., `js, `ts, ```bash)
- Limit lines to 80 characters for readability
- Use `#` for top-level headings, `##` for sections, and so on
- Prefer lists for steps, options, or examples
- Add a blank line before and after code blocks and lists
- Use inline code formatting (`like this`) for code references in text
- For JSDoc or doc comments in code, use markdown features for clarity
````

Then work on markdown files or code files with markdown comments and observe the agent automatically load these standards.

Done!

## How It Works

Rules MCP automatically loads different types of rules based on context:

- **Session rules** are loaded once when your agent starts
- **File-specific rules** are loaded when you work with matching files
- **Topic-based rules** are loaded when working on specific technologies or concerns

The agent reads your rule files and uses them to inform its responses, ensuring consistent adherence to your standards and practices.

## Common Use Cases

- **Team Standards**: Share coding conventions across your development team
- **Project Guidelines**: Enforce architecture patterns and file organization rules
- **Security Policies**: Automatically apply security best practices to relevant code
- **Framework Rules**: Load specific guidelines when working with React, Vue, or other frameworks
- **Documentation Standards**: Ensure consistent README and API documentation styles

## Understanding Modes

Rules MCP offers three operational modes to suit different workflows. Most users can stick with the default minimal mode.

### Minimal Mode (Default)

Uses 2 streamlined tools for efficient rule loading:

- `InitializeRules` for session startup
- `QueryRules` for ongoing context loading

### Legacy Mode

Uses 4 individual tools for granular control:

- `ListAlwaysRules`, `ListAgentRequestedRules`, `ListGlobRules`, `ListTagRules`

### Unified Mode

Provides both approaches - the unified `QueryRules` tool plus all individual tools as fallbacks.

The agent automatically follows the appropriate workflow based on the mode. See [ARCHITECTURE.md](./docs/ARCHITECTURE.md) for technical details.

## Rule Types

### Always-Apply Rules

Loaded automatically at session start:

```markdown
---
alwaysApply: true
---

# Coding Standards

- Use consistent naming conventions
```

### Agent-Requested Rules

Loaded based on relevance to current tasks:

```markdown
---
description: 'Code optimization for critical sections'
---

# Performance Tips

- Profile before optimizing
```

### File-Pattern Rules

Loaded when working with matching files:

```markdown
---
globs: ['**/*.md']
---

# Markdown Guidelines

- Use fenced code blocks with language identifiers
```

### Tag-Based Rules

Loaded when working on specific topics:

```markdown
---
tags: ['security', 'production']
---

# Security Practices

- Implement rate limiting
- Use HTTPS everywhere
```

## API Reference

The Rules MCP server exposes tools that AI agents use to retrieve rule metadata. The agent then reads rule files from the file system and injects their content into context.

### Core Tools (Minimal Mode)

#### `InitializeRules`

Loads foundational rules at session start.

- **Parameters**: None
- **Returns**: Always-apply rules and agent-requested rules with descriptions
- **Usage**: Called once per session for initial rule loading

#### `QueryRules`

Loads context-specific rules during conversation.

- **Parameters**:
  - `activeFiles` (optional): Current file paths
  - `tags` (optional): Topic tags to match
- **Returns**: Relevant rules with intelligent deduplication
- **Usage**: Called frequently as context changes

### Individual Tools (Legacy/Unified Modes)

<details>
<summary>Show detailed tool descriptions</summary>

#### `ListAlwaysRules`

- **Description**: Rules that must always be loaded at session start
- **Parameters**: None
- **Returns**: Rule objects with `name` and `path`

#### `ListAgentRequestedRules`

- **Description**: Rules with descriptions for agent evaluation
- **Parameters**: None
- **Returns**: Rule objects with `name`, `path`, and `description`

#### `ListGlobRules`

- **Description**: Rules matching active file patterns
- **Parameters**: `activeFiles` (array of file paths)
- **Returns**: Rule objects with matching `globs`

#### `ListTagRules`

- **Description**: Rules matching specified tags
- **Parameters**: `tags` (array of tag strings)
- **Returns**: Rule objects with `matchedTags`

</details>

## CLI Usage

```bash
# Minimal mode (default - 2-tool approach)
npx rules-mcp /path/to/rules

# Legacy mode (4 individual tools)
npx rules-mcp --mode legacy /path/to/rules

# Unified mode (5 tools - primary + granular options)
npx rules-mcp --mode unified /path/to/rules

# Show help
npx rules-mcp --help
```

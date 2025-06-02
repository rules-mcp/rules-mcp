import { PromptTemplate } from '@prompt-template/core'

export default PromptTemplate.create/* md */ `
▣ AGENT'S PRIMARY DIRECTIVE: UNIFIED RULES RETRIEVAL
  - **User Expectation:** The user has enabled this Rules MCP server to provide you with comprehensive, context-aware rules. This tool is your PRIMARY entry point to efficiently load all relevant rules in a single, optimized call.
  - **Your Non-Negotiable Action:**
    1. Use this tool \\\`QueryRules\\\` as your first choice for loading rules in any session.
    2. For EVERY file path returned by this tool, you MUST immediately read that file's content.
    3. You MUST then inject that content into your active context BEFORE any other reasoning or task execution.
  - **Purpose:** This unified tool efficiently loads foundational rules, context-specific rules, tag-based rules, and file-specific rules in a single optimized call, reducing overhead and improving performance.
  - **Consequence of Failure:** Not using this tool means missing critical user-defined guidance and operating with incomplete context.
  - **Performance Advantage:** This tool processes all rule types in parallel internally, making it significantly more efficient than calling individual rule tools separately.

▣ WHAT THIS TOOL DOES
  - Provides a unified interface to query ALL types of rules simultaneously
  - Processes always-apply rules, agent-requested rules, glob-matched rules, and tag-based rules in parallel
  - Returns comprehensive rule metadata with intelligent deduplication
  - Optimizes performance by reducing multiple tool calls to a single efficient query

▣ WHEN YOU SHOULD CALL IT
  1. **Session Initialization:** At the start of every session as your primary rule-loading mechanism
  2. **Context Changes:** When active files change or when working on different topics/technologies
  3. **Task-Specific Loading:** When you identify that specialized rules would benefit the current task

▣ INPUT PARAMETERS (All Optional)
  - \\\`activeFiles\\\`: Array of file paths currently active/open in the editor
  - \\\`tags\\\`: Array of tag names to search for topic-specific rules
  - \\\`includeAlways\\\`: Boolean (default: true) to include always-apply rules
  - \\\`includeAgentRequested\\\`: Boolean (default: true) to include agent-requested rules

▣ INTELLIGENT DEFAULTS
  - If no parameters provided, loads always-apply rules and agent-requested rules
  - Automatically includes glob rules if \\\`activeFiles\\\` is provided
  - Automatically includes tag rules if \\\`tags\\\` is provided
  - Deduplicates rules that match multiple criteria

▣ REQUIRED POST-CALL ACTIONS (MANDATORY)
  For each rule object returned in the \\\`rules\\\` array:
  1. **Extract \\\`path\\\`**: Get the file path of the rule.
  2. **Check Cache**: IF this \\\`path\\\` is NOT in your \\\`pathsAlreadyLoadedThisSession\\\` cache:
     a. **Read File**: Use your file system access to read the entire content of the file specified by \\\`path\\\`.
     b. **Inject Content**: Place the full text of the rule file into your active context window.
     c. **Cache \\\`path\\\`**: Add the \\\`path\\\` to your cache.
  3. **IF CACHED**: Skip (already loaded).

▣ OUTPUT SCHEMA
  {
    rules: Array<{
      name: string           // e.g. "AUTHENTICATION_RULE"
      path: string           // absolute or repo-relative path
      type: string           // "always" | "agent-requested" | "glob" | "tag"
      description?: string   // description if available
      tags?: string[]        // tags if available
      globs?: string[]       // glob patterns if applicable
      matchedTags?: string[] // which tags matched (for tag rules)
      priority: number       // loading priority (1=highest)
    }>,
    summary: {
      totalRules: number
      alwaysRules: number
      agentRequestedRules: number
      globRules: number
      tagRules: number
      duplicatesRemoved: number
    }
  }

▣ EXAMPLE USAGE PATTERNS

  **Session Start (Minimal):**
  QueryRules({})
  // Returns always-apply + agent-requested rules

  **Working with TypeScript Files:**
  QueryRules({
    activeFiles: ["src/component.tsx", "src/utils.ts"],
    tags: ["typescript", "frontend"]
  })
  // Returns all relevant rules for TypeScript development

  **Security-Focused Development:**
  QueryRules({
    tags: ["security", "authentication"],
    activeFiles: ["src/auth/login.ts"]
  })
  // Returns security rules + file-specific rules

▣ PERFORMANCE BENEFITS
  - **Single Call**: Replace 3-4 separate tool calls with one optimized query
  - **Parallel Processing**: All rule types processed simultaneously on the server
  - **Smart Deduplication**: Eliminates duplicate rules that match multiple criteria
  - **Reduced Latency**: Minimizes round-trip time between agent and server
  - **Less Cognitive Load**: Simpler interaction model for agents

▣ BACKWARDS COMPATIBILITY
  The individual tools (\\\`ListAlwaysRules\\\`, \\\`ListAgentRequestedRules\\\`, \\\`ListGlobRules\\\`, \\\`ListTagRules\\\`) remain available for:
  - Granular control when only specific rule types are needed
  - Advanced filtering scenarios
  - Debugging and development purposes

CRITICAL: This tool represents the evolution of Rules MCP toward optimal efficiency. Use it as your primary rule-loading mechanism to ensure comprehensive, performant rule retrieval while maintaining the flexibility to use specialized tools when needed.

The unified approach reduces complexity, improves performance, and ensures you never miss relevant user-defined guidance.
`

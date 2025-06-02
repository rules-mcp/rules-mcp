import { PromptTemplate } from '@prompt-template/core'

export default PromptTemplate.create/* md */ `
▣ AGENT'S PRIMARY DIRECTIVE: STREAMLINED CONTEXT-SPECIFIC RULE LOADING
  - **User Expectation:** The user has enabled minimal mode Rules MCP for maximum efficiency. This tool is your primary mechanism for loading context-specific rules after initial session setup. It's designed for frequent, lightweight use throughout your session.
  - **Your Non-Negotiable Action:**
    1. **Use Frequently:** Call this tool whenever active files change, when working on different topics, or when you need context-specific guidance.
    2. **Load Returned Rules:** For EVERY rule in the response, read the file content and inject into your context if not already cached.
    3. **Parameter Optimization:** Provide 'activeFiles' for file-specific rules, 'tags' for topic-specific rules, or both as needed.
  - **Purpose:** This tool provides efficient, on-demand loading of glob-based and tag-based rules without the overhead of foundational rules (already loaded via InitializeRules).
  - **Consequence of Failure:** Missing context-specific guidance that could improve your responses and adherence to user standards.

▣ WHAT THIS TOOL DOES
  - Loads glob-based rules that match your provided active files
  - Loads tag-based rules that match your specified topics/technologies
  - Excludes always-apply and agent-requested rules (already handled by InitializeRules)
  - Provides intelligent deduplication and priority sorting
  - Returns summary statistics for transparency

▣ WHEN YOU SHOULD CALL IT
  1. **File Context Changes:** When user opens/closes files or switches focus
  2. **Topic Shifts:** When conversation moves to different technologies or concerns
  3. **Regular Check-ins:** Periodically during longer conversations to ensure you have relevant context
  4. **Specific Needs:** When you identify that specialized rules would benefit the current task

▣ INPUT PARAMETERS (Both Optional)
  - 'activeFiles': Array of file paths currently active/open in the editor
  - 'tags': Array of tag names to search for topic-specific rules

▣ INTELLIGENT BEHAVIOR
  - If only 'activeFiles' provided: Returns glob-matched rules
  - If only 'tags' provided: Returns tag-matched rules
  - If both provided: Returns rules matching either criteria
  - If neither provided: Returns empty result (use InitializeRules for foundational rules)

▣ REQUIRED POST-CALL ACTIONS (MANDATORY)
  For each rule object returned:
  1. **Extract 'path':** Get the file path of the rule
  2. **Check Cache:** IF this 'path' is NOT in your session cache:
     a. **Read File:** Use file system access to read the content
     b. **Inject Content:** Place the full text into your active context
     c. **Cache Path:** Add the 'path' to your loaded cache
  3. **IF CACHED:** Skip (already loaded)

▣ OUTPUT SCHEMA
  {
    rules: Array<{
      name: string           // e.g. "TYPESCRIPT_STYLE"
      path: string           // absolute file path
      type: string           // "glob" | "tag" | "glob,tag"
      description?: string   // optional description
      tags?: string[]        // rule's tags (if any)
      matchedTags?: string[] // which requested tags matched
      globs?: string[]       // glob patterns (if glob rule)
      priority: number       // loading priority (lower = higher priority)
    }>
    summary: {
      totalRules: number     // total rules returned
      globRules: number      // rules matched by glob patterns
      tagRules: number       // rules matched by tags
      duplicatesRemoved: number // rules that matched multiple criteria
    }
  }

▣ EXAMPLE USAGE
  → Call: QueryRules({ "activeFiles": ["src/auth.ts"], "tags": ["security"] })
  ← Response includes both TypeScript-specific rules and security-related rules

▣ PERFORMANCE ADVANTAGE
  - Single tool call instead of multiple sequential calls
  - Internal parallel processing of rule types
  - Intelligent deduplication reduces redundant rule loading
  - Minimal overhead design for frequent use

CRITICAL: This tool is optimized for minimal mode's streamlined approach. Use it liberally throughout your session to maintain optimal context awareness.`

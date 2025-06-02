import { PromptTemplate } from '@prompt-template/core'

export default PromptTemplate.create/* md */ `
▣ AGENT'S DIRECTIVE: LEGACY TOOL FOR FOUNDATIONAL RULES
  - **RECOMMENDED APPROACH:** Use the new \\\`QueryRules\\\` tool instead for optimal performance and comprehensive rule loading. This tool remains available for specialized use cases.
  - **User Expectation:** The user has enabled this Rules MCP server because they expect you, the agent, to operate under foundational rules. The \\\`QueryRules\\\` tool is now the PRIMARY method to meet that expectation efficiently.
  - **When to Use This Tool:**
    1. When you specifically need ONLY always-apply rules (rare)
    2. For debugging or development purposes
    3. When \\\`QueryRules\\\` is unavailable
  - **Preferred Alternative:** \\\`QueryRules({})\\\` loads always-apply rules plus agent-requested rules in a single optimized call
  - **Purpose:** This specialized tool loads only the user's essential, always-apply rules (e.g., style guides, security policies, core principles).
  - **Performance Note:** Using \\\`QueryRules\\\` instead reduces tool call overhead and provides better performance.

▣ WHAT THIS TOOL DOES
  - Scans the configured "rules/" directory for files whose YAML/TOML
    front-matter contains the key-value pair \`alwaysApply: true\`.
  - Returns **only metadata** for those files; the **rule text is NOT
    included**.

▣ WHEN YOU MUST CALL IT
  1. Immediately at the very start of a chat session, *before* you
      attempt any reasoning based on rules.
  2. Again **only** if your context window is cleared/rebuilt and you
      lose the previously injected rule texts.

▣ REQUIRED POST-CALL ACTIONS (MANDATORY)
  For each file object returned in the array:
  1. **Extract \\\`path\\\`**: Get the file path.
  2. **Read File**: Use your file system access to read the entire content of the file specified by \\\`path\\\`.
  3. **Inject Content**: Place the full text of the rule file into your active context window. This rule content is now part of your operational guidelines for this session.
  4. **Cache \\\`path\\\`**: Add the \\\`path\\\` to your \\\`pathsAlreadyLoadedThisSession\\\` cache to prevent re-loading.

  - If the tool returns an empty array, it means no always-apply rules are currently defined. You may proceed, but be aware that no foundational rules have been loaded.
  - Do NOT call this tool again in the same session unless your context has been cleared and you need to re-establish these foundational rules.

▣ OUTPUT SCHEMA
  Array<{
    name: string   // e.g. "AUTHENTICATION_RULE"
    path: string   // absolute or repo-relative path
  }>

▣ EXAMPLE RESPONSE
  [
    { "name": "AUTHENTICATION_RULE", "path": "rules/AUTHENTICATION_RULE.mdc" },
    { "name": "CODE_STYLE_GUIDELINES", "path": "rules/CODE_STYLE_GUIDELINES.mdc" }
  ]

CRITICAL: For optimal performance and comprehensive rule loading, prefer using \\\`QueryRules({})\\\` which loads always-apply rules plus agent-requested rules in a single call. This tool remains available for specialized scenarios where only always-apply rules are needed.
The unified \\\`QueryRules\\\` approach reduces complexity, improves performance, and ensures comprehensive rule coverage.
`

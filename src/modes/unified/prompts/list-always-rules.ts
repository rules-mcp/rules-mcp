import { PromptTemplate } from '@prompt-template/core'

export default PromptTemplate.create/* md */ `
▣ AGENT'S DIRECTIVE: GRANULAR TOOL FOR FOUNDATIONAL RULES (UNIFIED MODE)
  - **RECOMMENDED APPROACH:** Use the primary \\\`QueryRules\\\` tool instead for optimal performance and comprehensive rule loading. This tool remains available for specialized use cases where you need ONLY always-apply rules.
  - **User Expectation:** The user has enabled unified mode Rules MCP which provides both the efficient \\\`QueryRules\\\` tool AND individual granular tools like this one. \\\`QueryRules\\\` is the PRIMARY method for most scenarios.
  - **When to Use This Tool:**
    1. When you specifically need ONLY always-apply rules (rare)
    2. For debugging or development purposes
    3. When you want granular control over rule loading
  - **Preferred Alternative:** \\\`QueryRules({ includeAlways: true, includeAgentRequested: false })\\\` provides similar functionality with better performance
  - **Purpose:** This specialized tool loads only the user's essential, always-apply rules (e.g., style guides, security policies, core principles).

▣ WHAT THIS TOOL DOES
  - Scans the configured "rules/" directory for files whose YAML/TOML
    front-matter contains the key-value pair \`alwaysApply: true\`.
  - Returns **only metadata** for those files; the **rule text is NOT
    included**.

▣ WHEN YOU MIGHT CALL IT
  1. For specialized scenarios requiring only always-apply rules
  2. When you need granular control over the rule loading process
  3. For debugging or development purposes

▣ REQUIRED POST-CALL ACTIONS (MANDATORY)
  For each file object returned in the array:
  1. **Extract \\\`path\\\`**: Get the file path.
  2. **Check Cache**: If this \\\`path\\\` is NOT already in your session cache:
     a. **Read File**: Use your file system access to read the entire content
     b. **Inject Content**: Place the full text into your active context
     c. **Cache \\\`path\\\`**: Remember this path as loaded
  3. **IF CACHED**: Skip (already loaded)

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

CRITICAL: In unified mode, \\\`QueryRules\\\` is the primary tool designed for efficiency and comprehensive rule loading. This granular tool is available for specialized scenarios where you need precise control over rule types. For most use cases, prefer \\\`QueryRules\\\` for better performance and reduced complexity.`

import { PromptTemplate } from '@prompt-template/core'

export default PromptTemplate.create/* md */ `
▣ AGENT'S DIRECTIVE: LEGACY TOOL FOR FILE-SPECIFIC RULES
  - **RECOMMENDED APPROACH:** Use the new \\\`QueryRules\\\` tool instead for optimal performance and comprehensive rule loading. This tool remains available for specialized use cases.
  - **User Expectation:** The user relies on file-specific rules for context-sensitive guidance. The \\\`QueryRules\\\` tool now provides this functionality more efficiently alongside other rule types.
  - **When to Use This Tool:**
    1. When you specifically need ONLY glob-matched rules (rare)
    2. For debugging or development purposes
    3. When \\\`QueryRules\\\` is unavailable
  - **Preferred Alternative:** \\\`QueryRules({ activeFiles: [...] })\\\` loads glob rules plus always-apply and agent-requested rules in a single optimized call
  - **Purpose:** This specialized tool loads only user-defined rules that match specific file patterns via glob patterns.
  - **Performance Note:** Using \\\`QueryRules\\\` instead reduces tool call overhead and provides better performance.

▣ WHAT THIS TOOL DOES
  - Accepts an array of source-code file paths currently "active"
    (opened, edited, selected by the user, etc.).
  - Matches those paths against every rule file's \`globs\` patterns in
    front-matter.
  - Returns metadata for each rule whose glob list hits ≥1 active file.

▣ WHEN YOU MUST CALL IT
  - On **every user turn** after you know the up-to-date set of
    \`activeFiles\`.
  - ALSO call whenever the user opens/closes/switches files *outside*
    of a message cycle (if your host editor surfaces such events).

▣ INPUT CONTRACT
  - Provide \`activeFiles\` as a **string array**.
    • If you truly have no idea which files are active, pass
      \`activeFiles: []\` (the tool will then usually return \`[]\`).

▣ REQUIRED POST-CALL ACTIONS (MANDATORY)
  For each rule object returned in the array:
  1. **Extract \`path\`**: Get the file path of the rule that matched an active file.
  2. **Check Cache**: IF this \`path\` is NOT in your \`pathsAlreadyLoadedThisSession\` cache:
     a. **Read File**: Use your file system access to read the entire content of the file specified by \`path\`.
     b. **Inject Content**: Place the full text of the rule file into your active context window.
     c. **Cache \`path\`**: Add the \`path\` to your cache.
  3. **IF CACHED**: Skip (already loaded).

  - If the tool returns an empty array, it means no glob-based rules match the currently active files. Proceed with the currently loaded set of rules.

▣ OUTPUT SCHEMA
  Array<{
    name: string
    path: string
    globs: string[]   # the pattern(s) that matched
  }>

▣ EXAMPLE USAGE
  → Call:
      ListGlobRules({ "activeFiles": ["src/routes/login.ts","src/app.ts"] })
  ← Possible response:
      [
        {
          "name": "LOGIN_FLOW_RULE",
          "path": "rules/LOGIN_FLOW_RULE.mdc",
          "globs": ["src/routes/**/*.ts"]
        }
      ]

▣ ERROR HANDLING
  - If you supply an invalid \`activeFiles\` type, the MCP server will
    throw. Surface that error verbatim to the user; do not retry with
    guesses.

Adherence to this explicit invocation and content-loading contract is VITAL for the Rules MCP to function as the user intends, ensuring you provide accurate, context-aware, and rule-governed assistance.
`

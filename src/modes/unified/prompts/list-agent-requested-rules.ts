import { PromptTemplate } from '@prompt-template/core'

export default PromptTemplate.create/* md */ `
▣ AGENT'S DIRECTIVE: LEGACY TOOL FOR AGENT-REQUESTED RULES
  - **RECOMMENDED APPROACH:** Use the new \\\`QueryRules\\\` tool instead for optimal performance and comprehensive rule loading. This tool remains available for specialized use cases.
  - **User Expectation:** The user expects selective loading of contextually relevant rules. The \\\`QueryRules\\\` tool now provides this functionality more efficiently alongside other rule types.
  - **When to Use This Tool:**
    1. When you specifically need ONLY agent-requested rules (rare)
    2. For debugging or development purposes
    3. When \\\`QueryRules\\\` is unavailable
  - **Preferred Alternative:** \\\`QueryRules({})\\\` loads agent-requested rules plus always-apply rules in a single optimized call
  - **Purpose:** This specialized tool loads only user-defined rules that require evaluation for relevance (not universally applied).
  - **Performance Note:** Using \\\`QueryRules\\\` instead reduces tool call overhead and provides better performance.

▣ WHAT THIS TOOL DOES
  - Enumerates rule files that:
      • do NOT have \`alwaysApply: true\`
      • do NOT define \`globs\`
    but *do* provide a human-written \`description\` field in
    front-matter.  These are "opt-in" rules; you, the agent, decide if
    each is relevant to the user's current goals.

▣ WHEN YOU MUST CALL IT
  - **Exactly once** during session bootstrap, *right after* completing
    \`ListAlwaysRules\`.

▣ REQUIRED POST-CALL ACTIONS (MANDATORY)
  For each rule object returned in the array:
  1. **Read \`description\`**: Carefully analyze the \`description\` to understand the rule's purpose.
  2. **Assess Relevance**: CRITICALLY evaluate if this rule is demonstrably relevant to the user's current goals or the ongoing conversation. If there is any doubt, or if the description is vague or does not strongly suggest direct applicability, you MUST err on the side of NOT loading the rule. Only load rules where relevance is clear and unambiguous.
  3. **IF RELEVANT** (meaning the description clearly and unambiguously indicates applicability to current or anticipated tasks):
     a. **Extract \`path\`**: Get the file path of the relevant rule.
     b. **Read File**: Use your file system access to read the entire content of the file specified by \`path\`.
     c. **Inject Content**: Place the full text of the rule file into your active context window.
     d. **Cache \`path\`**: Add the \`path\` to your \`pathsAlreadyLoadedThisSession\` cache.
  4. **IF NOT RELEVANT**: Do nothing with this rule for now. You may reconsider it if the context shifts.

  - Never re-load a path already in your cache.

▣ OUTPUT SCHEMA
  Array<{
    name: string
    path: string
    description: string
  }>

▣ EXAMPLE RESPONSE
  [
    {
      "name": "SECURITY_PRACTICES",
      "path": "rules/SECURITY_PRACTICES.mdc",
      "description": "Advise on OWASP-aligned hardening steps"
    }
  ]

CRITICAL: This tool MUST be called at session bootstrap, right after completing ListAlwaysRules to ensure the agent operates with user-defined foundational context. Failure to do so will result in degraded performance and potential misalignment with user requirements.
Adherence to this explicit invocation, evaluation, and content-loading contract is VITAL for the Rules MCP to function as the user intends, ensuring you provide accurate, context-aware, and rule-governed assistance.
`

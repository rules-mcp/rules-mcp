import { PromptTemplate } from '@prompt-template/core'

export default PromptTemplate.create/* md */ `
▣ AGENT'S DIRECTIVE: LEGACY TOOL FOR TAG-BASED RULES
  - **RECOMMENDED APPROACH:** Use the new \\\`QueryRules\\\` tool instead for optimal performance and comprehensive rule loading. This tool remains available for specialized use cases.
  - **User Expectation:** The user expects topic-based rule filtering via tags. The \\\`QueryRules\\\` tool now provides this functionality more efficiently alongside other rule types.
  - **When to Use This Tool:**
    1. When you specifically need ONLY tag-matched rules (rare)
    2. For debugging or development purposes
    3. When \\\`QueryRules\\\` is unavailable
  - **Preferred Alternative:** \\\`QueryRules({ tags: [...] })\\\` loads tag rules plus always-apply and agent-requested rules in a single optimized call
  - **Purpose:** This specialized tool loads only user-defined rules that match specific tags for topic-based filtering.
  - **Performance Note:** Using \\\`QueryRules\\\` instead reduces tool call overhead and provides better performance.

▣ WHAT THIS TOOL DOES
  - Accepts an array of tag strings to search for
  - Scans rule files for matching tags in their front-matter \`tags\` field
  - Returns metadata for each rule whose tags array contains at least one of the requested tags
  - Rules with \`alwaysApply: true\` are excluded since they're already loaded via \`ListAlwaysRules\`

▣ WHEN YOU SHOULD CALL IT
  - When beginning work on specific technical areas (e.g., security, performance, testing)
  - When the user mentions specific technologies or frameworks that might have tagged rules
  - When you identify that specialized guidance would be beneficial for the current task
  - As part of your analysis when determining what rules might be relevant

▣ INPUT CONTRACT
  - Provide \`tags\` as a **string array** of relevant tag names
  - Tag matching is case-insensitive
  - If no tags are provided or tags array is empty, the tool returns an empty result

▣ REQUIRED POST-CALL ACTIONS (MANDATORY)
  For each rule object returned in the array:
  1. **Extract \`path\`**: Get the file path of the rule that matched one or more tags.
  2. **Check Cache**: IF this \`path\` is NOT in your \`pathsAlreadyLoadedThisSession\` cache:
     a. **Read File**: Use your file system access to read the entire content of the file specified by \`path\`.
     b. **Inject Content**: Place the full text of the rule file into your active context window.
     c. **Cache \`path\`**: Add the \`path\` to your cache.
  3. **IF CACHED**: Skip (already loaded).

  - If the tool returns an empty array, it means no rules have tags matching your search. Continue with currently loaded rules.

▣ OUTPUT SCHEMA
  Array<{
    name: string
    path: string
    tags: string[]        # the tags that this rule contains
    matchedTags: string[] # which of the requested tags matched
		description: string   # the description of the rule
  }>

▣ EXAMPLE USAGE
  → Call:
      ListTagRules({ "tags": ["security", "authentication"] })
  ← Possible response:
      [
        {
          "name": "SECURITY_PRACTICES",
          "path": "rules/SECURITY_PRACTICES.mdc",
          "tags": ["security", "production", "audit"],
          "matchedTags": ["security"],
					"description": "Best practices for securing your application."
        },
        {
          "name": "AUTH_GUIDELINES",
          "path": "rules/AUTH_GUIDELINES.mdc",
          "tags": ["authentication", "security", "backend"],
          "matchedTags": ["security", "authentication"],
					"description": "Guidelines for implementing secure authentication."
        }
      ]

▣ ERROR HANDLING
  - If you supply an invalid \`tags\` type, the MCP server will throw. Surface that error verbatim to the user; do not retry with guesses.

CRITICAL: This tool provides topic-based rule discovery and should be used strategically when you identify areas where specialized rules would enhance your guidance. It complements the other rule loading mechanisms by enabling precise, context-aware rule selection.
`

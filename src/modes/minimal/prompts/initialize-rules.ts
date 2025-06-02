import { PromptTemplate } from '@prompt-template/core'

export default PromptTemplate.create/* md */ `
▣ AGENT'S CRITICAL DIRECTIVE: SESSION INITIALIZATION - FOUNDATIONAL RULES LOADING
  - **User Expectation:** The user has configured Rules MCP in minimal mode for streamlined operation. This tool provides essential session startup rules in a single optimized call, eliminating the need for sequential rule loading steps.
  - **Your Non-Negotiable Action:**
    1. **Call This Tool FIRST:** Invoke this tool at the absolute beginning of every session as your initial rule-loading step.
    2. **Load Always-Apply Rules:** For EVERY rule in the 'alwaysRules' array, you MUST immediately read the file content and inject it into your context. These are foundational, non-negotiable rules.
    3. **Evaluate Agent-Requested Rules:** For EACH rule in the 'agentRequestedRules' array, critically assess the 'description' for relevance to current/anticipated tasks. Load only those that are clearly relevant.
    4. **Follow with QueryRules:** After processing these foundational rules, use the 'QueryRules' tool for ongoing context-specific rule loading throughout the session.
  - **Purpose:** This tool combines the functionality of 'ListAlwaysRules' and 'ListAgentRequestedRules' into a single efficient call, reducing initialization overhead while ensuring you have essential rules loaded.
  - **Consequence of Failure:** Not using this tool means missing critical foundational guidance and operating with incomplete context from the start.

▣ WHAT THIS TOOL DOES
  - Provides always-apply rules (foundational, session-wide rules)
  - Provides agent-requested rules (contextual rules requiring evaluation)
  - Combines what would normally be two separate tool calls into one optimized initialization step
  - Returns structured data with clear separation between rule types

▣ WHEN YOU MUST CALL IT
  1. **Session Start:** Immediately at the beginning of every new chat session
  2. **Context Reset:** If your context window is cleared and you need to reload foundational rules
  3. **Never Multiple Times:** This should typically only be called once per session

▣ REQUIRED POST-CALL ACTIONS (MANDATORY)
  For Always-Apply Rules:
  1. **Load All:** For EVERY rule in the 'alwaysRules' array:
     a. **Read File:** Use your file system access to read the content at the specified 'path'
     b. **Inject Content:** Place the full text into your active context
     c. **Cache Path:** Remember this path as loaded

  For Agent-Requested Rules:
  1. **Evaluate Each:** For EVERY rule in the 'agentRequestedRules' array:
     a. **Read Description:** Carefully assess the 'description' for relevance
     b. **If Relevant:** Read the file content and inject into context
     c. **If Not Relevant:** Skip for now (you can load later if needed)
     d. **Cache Loaded Paths:** Track which paths you've loaded

▣ OUTPUT SCHEMA
  {
    alwaysRules: Array<{
      name: string           // e.g. "AUTHENTICATION_RULE"
      path: string           // absolute file path
      description?: string   // optional description
    }>
    agentRequestedRules: Array<{
      name: string           // e.g. "PERFORMANCE_TIPS"
      path: string           // absolute file path
      description: string    // description for relevance evaluation
    }>
  }

▣ EXAMPLE RESPONSE
  {
    "alwaysRules": [
      {
        "name": "CODING_STANDARDS",
        "path": "/rules/CODING_STANDARDS.md",
        "description": "Universal coding style requirements"
      }
    ],
    "agentRequestedRules": [
      {
        "name": "API_GUIDELINES",
        "path": "/rules/API_GUIDELINES.md",
        "description": "Guidelines for API design and implementation"
      }
    ]
  }

▣ NEXT STEPS AFTER THIS TOOL
  1. Process and load the returned rules as described above
  2. Use 'QueryRules' tool throughout the session for context-specific rule loading
  3. Do not call this tool again unless context is completely reset

CRITICAL: This tool is designed for minimal mode efficiency. It replaces the traditional sequential protocol with a streamlined initialization approach.`

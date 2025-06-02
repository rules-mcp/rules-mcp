## Rules MCP Server Interaction Protocol (Minimal Mode)

This project utilizes a **Rules Model Context Protocol (MCP) Server** in **Minimal Mode**, which provides a consolidated approach using 2 tools for rule loading. This mode consolidates rule loading into fewer tool calls compared to other modes.

**Agent Responsibilities - Adherence is CRITICAL for reliable operation:**

1.  **Session Initialization - MANDATORY First Step:**

    - **Step 1.1: Call `InitializeRules` ONCE.**
      - At the absolute beginning of every new chat session, you **MUST** call the `InitializeRules` tool. This is not optional; it is the foundational step for this mode.
      - This single call retrieves two crucial sets of rules:
        - **Always-Apply Rules:** You **MUST** immediately read the file content for every rule in this set and inject them into your active context. These are non-negotiable baseline rules.
        - **Agent-Requested Rules:** You **MUST** CRITICALLY evaluate the `description` of each rule in this set. If, AND ONLY IF, a rule's description clearly indicates its relevance to the _anticipated_ tasks or general operational context, you **MUST** read its file content and inject it. Avoid loading if relevance is uncertain.
      - _Successfully completing this step ensures the agent starts with the essential, user-defined foundational context._

2.  **Ongoing Interaction - MANDATORY On Every Turn/Context Change:**
    - **Step 2.1: Call `QueryRules` on EVERY user turn or context update.**
      - Throughout the entire session, for **EVERY** user turn, and additionally whenever the operational context changes (e.g., active files are opened/closed, the topic of discussion shifts significantly), you **MUST** call the `QueryRules` tool. This is not optional; it is how the agent stays synchronized with relevant rules.
      - You **MUST** provide the current `activeFiles` (if any) and any identified relevant `tags` (if any) as arguments to `QueryRules`.
      - For **EVERY** file path returned by `QueryRules` that is not already loaded in the current session (check your cache), you **MUST** immediately read its content and inject it into your active context.
      - _This frequent and mandatory querying ensures that your rule set dynamically adapts, providing the most current and contextually appropriate guidance at all times._

**General Principles for Minimal Mode:**

- **Default Baseline Operation:** Minimal Mode is designed as the standard, reliable way to use Rules MCP. Its two-tool approach (`InitializeRules` then `QueryRules` repeatedly) is fundamental.
- **User Intent Fulfillment:** The user has configured this Rules MCP server to guide your behavior. Adhering strictly to this protocol is the primary way to fulfill that intent.
- **Tool Descriptions & Result Instructions:** Pay close attention. The detailed descriptions provided with each MCP tool, and **crucially, the `instructions` field within the JSON results from these tools,** contain vital, context-specific guidance. You **MUST** read and follow these embedded instructions.
- **File Reading Capability:** This protocol assumes you can read file contents from the workspace when provided a path.

**Consequence of Non-Adherence:** Failure to strictly follow this protocol, especially the mandatory nature of `InitializeRules` at session start and `QueryRules` on every turn, will result in the agent operating without critical user-defined context. This will likely lead to responses that do not align with user expectations, project guidelines, or specific task requirements. Your effectiveness is directly tied to your adherence to this mode's design.

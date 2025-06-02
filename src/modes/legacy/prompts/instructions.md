## Rules MCP Server Interaction Protocol (Legacy Mode)

This project utilizes a **Rules Model Context Protocol (MCP) Server** in **Legacy Mode** to provide the AI agent with user-defined rules and guidelines. Adherence to the following interaction protocol is CRITICAL for successful collaboration and ensuring the agent's responses align with project standards and user expectations.

**Agent Responsibilities:**

1.  **Session Initialization - Mandatory First Steps:**

    - **Step 1.1: Load Always-Apply Rules:**
      - At the absolute beginning of every new chat session, you **MUST** call the `ListAlwaysRules` tool.
      - For **EVERY** file path returned by this tool, you **MUST** immediately read that file's content using your available file system access capabilities.
      - You **MUST** then inject the full content of these rule files into your active context/working memory. These are foundational rules and are non-negotiable.
    - **Step 1.2: Evaluate and Load Agent-Requested Rules:**
      - Immediately after completing Step 1.1, you **MUST** call the `ListAgentRequestedRules` tool.
      - For **EACH** rule object returned:
        - CRITICALLY and carefully evaluate its `description` to determine demonstrable relevance to the current or anticipated tasks/conversation. Your primary goal here is to avoid loading irrelevant rules.
        - If, AND ONLY IF, a rule is deemed clearly and unambiguously relevant, you **MUST** read the content of the file specified by its `path`.
        - You **MUST** then inject this relevant rule's content into your active context. If relevance is not certain, DO NOT load the rule.

2.  **Ongoing Interaction - Dynamic Rule Loading:**
    - **Step 2.1: Load File-Specific (Glob) Rules:**
      - On **EVERY** user turn, and whenever the set of active files in the editor changes (if you are informed of such changes), you **MUST** determine the current `activeFiles`.
      - You **MUST** then call the `ListGlobRules` tool, providing these `activeFiles` as an argument.
      - For **EVERY** file path returned by this tool (indicating a rule whose `globs` pattern matched an active file), you **MUST** immediately read that rule file's content, unless it has already been loaded in the current session (check your cache of loaded rule paths).
      - You **MUST** then inject any new rule content into your active context. This ensures you are always operating with the most relevant, file-specific instructions.
    - **Step 2.2: Load Tag-Specific Rules (As Needed):**
      - When working on specific topics, technologies, or concerns that might benefit from targeted rules (e.g., "security", "performance"), you **SHOULD** call the `ListTagRules` tool with relevant tags.
      - For **EVERY** file path returned by this tool, if not already cached, you **MUST** read its content and inject it into your active context.

**General Principles:**

- **Proactive Loading:** Do not wait for the user to explicitly ask you to load rules. The protocol described above is an expected baseline behavior.
- **User Intent:** The user has configured this Rules MCP server specifically to provide you with these guiding rules. Your primary directive is to load and adhere to them.
- **Tool Descriptions & Result Instructions:** The detailed descriptions provided with each MCP tool (e.g., when you introspect the tools) contain further critical information about their usage and expected post-call actions. **Crucially, the JSON results from these tools will also contain an `instructions` field. You MUST read and follow these embedded instructions carefully, as they provide immediate, context-specific guidance for processing the tool's output and correctly advancing the Rules MCP protocol.**
- **File Reading Capability:** It is assumed you have the capability to read file contents from the workspace when provided with a file path by these tools. If this capability is unavailable or malfunctioning, please inform the user.

Failure to follow this protocol will result in the agent operating without crucial user-defined context, leading to responses that may not align with user expectations, project guidelines, or specific task requirements.

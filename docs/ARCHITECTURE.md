# Rules MCP Server Architecture

This document describes the three architectural modes available in the Rules MCP server. Each mode provides a different approach to rule loading and agent interaction patterns.

## Architecture Overview

The Rules MCP server supports three distinct modes with different tool sets and interaction patterns:

### 1. Legacy Mode (`--mode legacy`)

**Architecture:** Sequential individual tool approach

**Tools Available:**

- `ListAlwaysRules` - Returns foundational always-apply rules
- `ListAgentRequestedRules` - Returns agent-requested rules with descriptions for evaluation
- `ListGlobRules` - Returns file-specific rules based on glob patterns
- `ListTagRules` - Returns topic-specific rules based on tags

**Agent Interaction Pattern:**

1. Start session by calling `ListAlwaysRules`
2. Load all returned rule files into context
3. Call `ListAgentRequestedRules` and evaluate relevance
4. Load relevant agent-requested rules
5. On every turn/file change, call `ListGlobRules` with active files
6. Use `ListTagRules` as needed for specific topics

**Characteristics:**

- 4 individual tools
- Sequential workflow
- Granular control over each rule type
- Multiple tool calls required for full rule loading
- Compatible with existing sequential workflows

### 2. Minimal Mode (`--mode minimal`)

**Architecture:** Consolidated tool approach

**Tools Available:**

- `InitializeRules` - Combined always-apply + agent-requested rules in one call
- `QueryRules` - Unified context-specific rule loading (glob + tag based)

**Agent Interaction Pattern:**

1. Start session by calling `InitializeRules` once
   - Load all **always-apply rules** returned
   - Evaluate `description` for **agent-requested rules** and load if relevant
2. Throughout session, call `QueryRules` on each user turn or context change
   - Provide current context (active files, tags)
   - Load any new, relevant rules returned

**Characteristics:**

- 2 tools total
- Consolidated initialization step
- Single tool for ongoing context loading
- Reduced tool call overhead
- Simplified agent implementation

### 3. Unified Mode (`--mode unified`)

**Architecture:** Hybrid approach with primary and granular options

**Tools Available:**

- `QueryRules` - Unified rule loading tool (same as Minimal mode)
- `ListAlwaysRules` - Granular always-apply rules
- `ListAgentRequestedRules` - Granular agent-requested rules
- `ListGlobRules` - Granular glob-based rules
- `ListTagRules` - Granular tag-based rules

**Agent Interaction Pattern:**
**Option A (Primary):**

1. Use `QueryRules` for most rule loading needs
2. Optionally use granular tools for specific scenarios

**Option B (Granular):**

1. Use individual tools as needed for precise control
2. Mix and match approaches based on context

**Option C (Hybrid):**

1. Combine `QueryRules` with individual tools as needed

**Characteristics:**

- 5 tools available
- Multiple interaction patterns possible
- Primary tool for efficiency + granular tools for control
- Maximum flexibility in agent implementation

## Technical Comparison

| Aspect           | Legacy       | Minimal     | Unified      |
| ---------------- | ------------ | ----------- | ------------ |
| Tool Count       | 4            | 2           | 5            |
| Initialization   | Sequential   | Single call | Flexible     |
| Session Calls    | 1-4 per turn | 1 per turn  | 1-5 per turn |
| Complexity       | Higher       | Lower       | Variable     |
| Granular Control | Full         | Limited     | Full         |
| Flexibility      | Limited      | Limited     | High         |

## Mode Selection Considerations

### Technical Factors

**Legacy Mode:**

- Explicit control over each rule type
- Predictable call patterns
- Compatible with existing sequential workflows
- Clear separation of concerns

**Minimal Mode:**

- Reduced network overhead (fewer calls)
- Simplified agent implementation
- Optimized for frequent context updates
- Consolidated session initialization

**Unified Mode:**

- Maximum implementation flexibility
- Supports multiple interaction patterns
- Allows experimentation with approaches
- Can adapt to different use cases

### Implementation Complexity

**For Agent Developers:**

- **Legacy:** Requires understanding 4 tools and their sequence
- **Minimal:** Requires understanding 2 tools and their timing
- **Unified:** Requires understanding all tools but allows choice of approach

**For Rule Authors:**

- All modes support the same rule file formats and front-matter options
- Mode selection doesn't affect rule authoring experience

## Performance Characteristics

### Network Calls

**Legacy Mode:**

- Minimum 2 calls per session (initialization)
- 1-2 additional calls per turn (glob rules, optional tag rules)
- Total: 3-10+ calls per session

**Minimal Mode:**

- 1 call for initialization
- 1 call per turn
- Total: 2-20+ calls per session (depending on session length)

**Unified Mode:**

- Variable based on chosen approach
- Can match either Legacy or Minimal patterns
- Range: 2-20+ calls per session

### Memory Usage

All modes have similar memory usage patterns since they load the same rule content. The difference is primarily in when and how rules are loaded.

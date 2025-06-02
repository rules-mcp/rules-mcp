import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'

import { scanRuleFiles, queryAllRules } from '../../utils/shared.js'
import initializeRules from './prompts/initialize-rules.js'
import queryRules from './prompts/query-rules.js'

export function registerTools(server: McpServer, rulesDirPath: string) {
  // Tool 1: InitializeRules (combines always-apply + agent-requested)
  server.tool('InitializeRules', initializeRules.format(), {}, async () => {
    const allRules = await scanRuleFiles(rulesDirPath)

    // Get always-apply rules
    const alwaysRules = allRules.filter(
      (rule) => rule.frontMatter.alwaysApply === true,
    )

    // Get agent-requested rules
    const agentRequestedRules = allRules.filter(
      (rule) =>
        rule.frontMatter.alwaysApply !== true &&
        !rule.frontMatter.globs &&
        rule.frontMatter.description,
    )

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              instructions:
                "This result from `InitializeRules` provides essential session startup rules in a single optimized call. MANDATORY ACTION: For EACH rule in BOTH the 'alwaysRules' and 'agentRequestedRules' arrays, you MUST evaluate relevance (for agent-requested) and read all relevant rule file paths, injecting their full content into your context. This tool replaces the need for separate `ListAlwaysRules` and `ListAgentRequestedRules` calls. After loading these foundational rules, use the `QueryRules` tool for ongoing context-specific rule loading.",
              alwaysRules: alwaysRules.map((rule) => ({
                name: rule.name,
                path: rule.path,
                description: rule.frontMatter.description,
              })),
              agentRequestedRules: agentRequestedRules.map((rule) => ({
                name: rule.name,
                path: rule.path,
                description: rule.frontMatter.description,
              })),
            },
            null,
            2,
          ),
        },
      ],
    }
  })

  // Tool 2: QueryRules (unified dynamic rule loading)
  server.tool(
    'QueryRules',
    queryRules.format(),
    {
      activeFiles: z
        .array(z.string())
        .optional()
        .describe(
          'Array of file paths currently active/open in the editor. If provided, will include glob-matched rules.',
        ),
      tags: z
        .array(z.string())
        .optional()
        .describe(
          'Array of tag names to search for topic-specific rules. If provided, will include tag-matched rules.',
        ),
    },
    async ({
      activeFiles,
      tags,
    }: {
      activeFiles?: string[]
      tags?: string[]
    }) => {
      const result = await queryAllRules(rulesDirPath, {
        activeFiles,
        tags,
        includeAlways: false, // These were already loaded via InitializeRules
        includeAgentRequested: false, // These were already loaded via InitializeRules
      })

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                instructions:
                  "This result from `QueryRules` provides context-specific rules based on your query parameters. MANDATORY ACTION: For EACH rule in the 'rules' array, if its 'path' is not already in your session cache, you MUST read and inject its content. This tool is designed for frequent use throughout your session to load relevant rules as context changes. The minimal mode focuses on this streamlined QueryRules approach after initial setup.",
                ...result,
              },
              null,
              2,
            ),
          },
        ],
      }
    },
  )
}

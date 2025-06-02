import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'

import {
  scanRuleFiles,
  matchesGlobs,
  matchesTags,
  queryAllRules,
} from '../../utils/shared.js'
import queryRules from './prompts/query-rules.js'
import listAlwaysRules from './prompts/list-always-rules.js'
import listAgentRequestedRules from './prompts/list-agent-requested-rules.js'
import listGlobRules from './prompts/list-glob-rules.js'
import listTagRules from './prompts/list-tag-rules.js'

export function registerTools(server: McpServer, rulesDirPath: string) {
  // Tool 0: QueryRules (Primary unified tool)
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
      includeAlways: z
        .boolean()
        .optional()
        .default(true)
        .describe('Whether to include always-apply rules. Defaults to true.'),
      includeAgentRequested: z
        .boolean()
        .optional()
        .default(true)
        .describe(
          'Whether to include agent-requested rules. Defaults to true.',
        ),
    },
    async ({
      activeFiles,
      tags,
      includeAlways,
      includeAgentRequested,
    }: {
      activeFiles?: string[]
      tags?: string[]
      includeAlways?: boolean
      includeAgentRequested?: boolean
    }) => {
      const result = await queryAllRules(rulesDirPath, {
        activeFiles,
        tags,
        includeAlways,
        includeAgentRequested,
      })

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                instructions:
                  "This result from `QueryRules` provides comprehensive rule retrieval in a single optimized call, as detailed in this tool's description. MANDATORY ACTION: For EACH rule in the 'rules' array, if its 'path' is not already in your session cache, you MUST read and inject its content. This unified tool is your PRIMARY mechanism for loading rules efficiently. The 'summary' provides insights into what types of rules were loaded. Use this tool as your first choice for rule loading to minimize overhead and maximize performance. For specialized use cases, individual rule tools remain available.",
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

  // Tool 1: ListAlwaysRules (Granular fallback)
  server.tool('ListAlwaysRules', listAlwaysRules.format(), {}, async () => {
    const allRules = await scanRuleFiles(rulesDirPath)
    const alwaysRules = allRules.filter(
      (rule) => rule.frontMatter.alwaysApply === true,
    )

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              instructions:
                "This result from `ListAlwaysRules` provides foundational rule paths for specialized use cases where you need to specifically query only always-apply rules. MANDATORY ACTION: For EACH rule in the 'rules' array, you MUST read its 'path' and inject the full content into your context. Note: The primary `QueryRules` tool is recommended for most use cases as it's more efficient.",
              rules: alwaysRules.map((rule) => ({
                name: rule.name,
                path: rule.path,
              })),
            },
            null,
            2,
          ),
        },
      ],
    }
  })

  // Tool 2: ListAgentRequestedRules (Granular fallback)
  server.tool(
    'ListAgentRequestedRules',
    listAgentRequestedRules.format(),
    {},
    async () => {
      const allRules = await scanRuleFiles(rulesDirPath)

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
                  "This result from `ListAgentRequestedRules` presents rules requiring your evaluation for specialized use cases where you need to specifically query only agent-requested rules. MANDATORY ACTION: For EACH rule, CRITICALLY assess its 'description' for demonstrable relevance to the current/anticipated tasks. IF AND ONLY IF relevant, you MUST read its 'path' and inject the content. Note: The primary `QueryRules` tool is recommended for most use cases as it's more efficient.",
                rules: agentRequestedRules.map((rule) => ({
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
    },
  )

  // Tool 3: ListGlobRules (Granular fallback)
  server.tool(
    'ListGlobRules',
    listGlobRules.format(),
    {
      activeFiles: z
        .array(z.string())
        .describe('Array of file paths currently active/open in the editor'),
    },
    async ({ activeFiles }: { activeFiles: string[] }) => {
      const allRules = await scanRuleFiles(rulesDirPath)
      const globRules = allRules.filter(
        (rule) =>
          Array.isArray(rule.frontMatter.globs) &&
          rule.frontMatter.globs.length > 0,
      )

      const matchingRules = []
      for (const rule of globRules) {
        const globs = rule.frontMatter.globs
        const hasMatch = activeFiles.some((filePath: string) =>
          matchesGlobs(filePath, globs),
        )

        if (hasMatch) {
          matchingRules.push({
            name: rule.name,
            path: rule.path,
            globs: globs,
          })
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                instructions:
                  "This result from `ListGlobRules` delivers rules dynamically matched to the provided 'activeFiles' for specialized use cases where you need to specifically query only glob-based rules. MANDATORY ACTION: For EACH rule in the 'rules' array, if its 'path' is not already in your session cache, you MUST read and inject its content. Note: The primary `QueryRules` tool is recommended for most use cases as it's more efficient.",
                rules: matchingRules,
              },
              null,
              2,
            ),
          },
        ],
      }
    },
  )

  // Tool 4: ListTagRules (Granular fallback)
  server.tool(
    'ListTagRules',
    listTagRules.format(),
    {
      tags: z
        .array(z.string())
        .describe('Array of tag names to filter rules by'),
    },
    async ({ tags }: { tags: string[] }) => {
      const allRules = await scanRuleFiles(rulesDirPath)

      const taggedRules = allRules.filter(
        (rule) =>
          rule.frontMatter.alwaysApply !== true && // Exclude always-apply rules
          Array.isArray(rule.frontMatter.tags) &&
          rule.frontMatter.tags.length > 0,
      )

      const matchingRules = []

      for (const taggedRule of taggedRules) {
        const matchedTags = matchesTags(taggedRule.frontMatter.tags, tags)

        if (matchedTags.length > 0) {
          matchingRules.push({
            name: taggedRule.name,
            path: taggedRule.path,
            tags: taggedRule.frontMatter.tags,
            matchedTags: matchedTags,
            description: taggedRule.frontMatter.description,
          })
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                instructions:
                  "This result from `ListTagRules` provides rules matching the requested tags for specialized use cases where you need to specifically query only tag-based rules. MANDATORY ACTION: For EACH rule in the 'rules' array, if its 'path' is not already in your session cache, you MUST read and inject its content. Note: The primary `QueryRules` tool is recommended for most use cases as it's more efficient.",
                rules: matchingRules,
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

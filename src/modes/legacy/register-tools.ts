import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'

import { scanRuleFiles, matchesGlobs, matchesTags } from '../../utils/shared.js'
import listAlwaysRules from './prompts/list-always-rules.js'
import listAgentRequestedRules from './prompts/list-agent-requested-rules.js'
import listGlobRules from './prompts/list-glob-rules.js'
import listTagRules from './prompts/list-tag-rules.js'

export function registerTools(server: McpServer, rulesDirPath: string): void {
  // Tool 1: ListAlwaysRules
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
                "This result from `ListAlwaysRules` provides foundational rule paths, as detailed in this tool\\'s description. MANDATORY ACTION: For EACH rule in the 'rules' array, you MUST read its 'path' and inject the full content into your context. This fulfills the first critical step of the Rules MCP interaction protocol. Once all foundational rules are loaded, you MUST immediately proceed by calling `ListAgentRequestedRules` to discover and evaluate further user-defined guidelines. Example: `ListAgentRequestedRules({})`",
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

  // Tool 2: ListAgentRequestedRules
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
                  "This result from `ListAgentRequestedRules` presents rules requiring your evaluation, guided by their 'description' field (provided herein) and the principles in this tool\\'s own description. MANDATORY ACTION: For EACH rule, CRITICALLY assess its 'description' for demonstrable relevance to the current/anticipated tasks. IF AND ONLY IF relevant, you MUST read its 'path' and inject the content. This selective loading is vital. After processing these, you MUST advance the protocol by determining active files and calling `ListGlobRules` for context-specific directives. Example: `ListGlobRules({ activeFiles: ['/path/to/activeFile.ts'] })`",
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

  // Tool 3: ListGlobRules
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
                  "This result from `ListGlobRules` delivers rules dynamically matched to the provided 'activeFiles', as per this tool\\'s design for context-sensitive guidance. MANDATORY ACTION: For EACH rule in the 'rules' array, if its 'path' is not already in your session cache, you MUST read and inject its content. Crucially, as per the Rules MCP protocol and this tool\\'s description, `ListGlobRules` MUST be invoked on EVERY user turn or active file change to ensure continuous alignment with file-specific user instructions. Example: `ListGlobRules({ activeFiles: ['/path/to/newFile.js', '/path/to/another.md'] })`",
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

  // Tool 4: ListTagRules
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
                  "This result from `ListTagRules` provides rules matching the requested tags, enabling topic-based rule loading as detailed in this tool\\'s description. MANDATORY ACTION: For EACH rule in the 'rules' array, if its 'path' is not already in your session cache, you MUST read and inject its content. This tool should be used strategically when you identify areas where specialized, topic-specific rules would enhance your guidance. Tag-based filtering complements glob and agent-requested rules by enabling precise, context-aware rule selection. Example: `ListTagRules({ tags: ['security', 'performance'] })`",
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

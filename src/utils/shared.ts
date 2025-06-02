import * as fs from 'node:fs'

import fg from 'fast-glob'
import matter from 'gray-matter'
import { minimatch } from 'minimatch'

// Helper function to scan rule files and parse their front-matter
export async function scanRuleFiles(rulesDirPath: string): Promise<
  Array<{
    name: string
    path: string
    frontMatter: any
  }>
> {
  try {
    const ruleFilePaths = await fg.async(['**/*.{md,mdc,txt}'], {
      cwd: rulesDirPath,
      absolute: true,
    })

    const results = []
    for (const ruleFilePath of ruleFilePaths) {
      try {
        const ruleFileContent = await fs.promises.readFile(
          ruleFilePath,
          'utf-8',
        )
        const parsedRuleFile = matter(ruleFileContent)
        const name =
          parsedRuleFile.data.name ||
          ruleFilePath
            .split('/')
            .pop()
            ?.replace(/\.[^/.]+$/, '') ||
          'unnamed'

        results.push({
          name,
          path: ruleFilePath,
          frontMatter: parsedRuleFile.data,
        })
      } catch (error) {
        // Skip files that can't be read or parsedRuleFile
        continue
      }
    }

    return results
  } catch (error) {
    return []
  }
}

// Helper function to match tags (case-insensitive)
export function matchesTags(
  ruleTags: string[],
  requestedTags: string[],
): string[] {
  if (!Array.isArray(ruleTags) || !Array.isArray(requestedTags)) return []

  const normalizedRuleTags = ruleTags.map((tag) => tag.toLowerCase())
  const normalizedRequestedTags = requestedTags.map((tag) => tag.toLowerCase())

  return normalizedRequestedTags.filter((reqTag) =>
    normalizedRuleTags.includes(reqTag),
  )
}

// Helper function to match file paths against glob patterns
export function matchesGlobs(ruleFilePath: string, globs: string[]): boolean {
  if (!Array.isArray(globs)) return false
  return globs.some((pattern) => {
    try {
      return minimatch(ruleFilePath, pattern)
    } catch {
      return false
    }
  })
}

// Helper function to determine rule priority for loading order
export function getRulePriority(rule: any): number {
  // Always-apply rules have highest priority
  if (rule.frontMatter.alwaysApply === true) return 1
  // Glob rules (file-specific) have high priority
  if (Array.isArray(rule.frontMatter.globs)) return 2
  // Tag rules have medium priority
  if (Array.isArray(rule.frontMatter.tags)) return 3
  // Agent-requested rules have lowest priority
  return 4
}

// Unified rule query function for optimal performance
export async function queryAllRules(
  rulesDirPath: string,
  options: {
    activeFiles?: string[]
    tags?: string[]
    includeAlways?: boolean
    includeAgentRequested?: boolean
  },
) {
  const {
    activeFiles = [],
    tags = [],
    includeAlways = true,
    includeAgentRequested = true,
  } = options

  const allRules = await scanRuleFiles(rulesDirPath)
  const resultRules = new Map<string, any>() // Use Map to deduplicate by path
  let duplicatesRemoved = 0

  // 1. Always-apply rules (highest priority)
  if (includeAlways) {
    const alwaysRules = allRules.filter(
      (rule) => rule.frontMatter.alwaysApply === true,
    )
    for (const rule of alwaysRules) {
      resultRules.set(rule.path, {
        name: rule.name,
        path: rule.path,
        type: 'always',
        description: rule.frontMatter.description,
        tags: rule.frontMatter.tags,
        priority: 1,
      })
    }
  }

  // 2. Glob-based rules (file-specific)
  if (activeFiles.length > 0) {
    const globRules = allRules.filter(
      (rule) =>
        Array.isArray(rule.frontMatter.globs) &&
        rule.frontMatter.globs.length > 0,
    )

    for (const rule of globRules) {
      const globs = rule.frontMatter.globs
      const hasMatch = activeFiles.some((ruleFilePath) =>
        matchesGlobs(ruleFilePath, globs),
      )

      if (hasMatch) {
        const ruleData = {
          name: rule.name,
          path: rule.path,
          type: 'glob',
          description: rule.frontMatter.description,
          tags: rule.frontMatter.tags,
          globs: globs,
          priority: 2,
        }

        if (resultRules.has(rule.path)) {
          duplicatesRemoved++
          // Merge types for rules that match multiple criteria
          const existing = resultRules.get(rule.path)
          existing.type = `${existing.type},glob`
          existing.globs = globs
        } else {
          resultRules.set(rule.path, ruleData)
        }
      }
    }
  }

  // 3. Tag-based rules
  if (tags.length > 0) {
    const taggedRules = allRules.filter(
      (rule) =>
        rule.frontMatter.alwaysApply !== true && // Exclude already-loaded always rules
        Array.isArray(rule.frontMatter.tags) &&
        rule.frontMatter.tags.length > 0,
    )

    for (const rule of taggedRules) {
      const matchedTags = matchesTags(rule.frontMatter.tags, tags)

      if (matchedTags.length > 0) {
        const ruleData = {
          name: rule.name,
          path: rule.path,
          type: 'tag',
          description: rule.frontMatter.description,
          tags: rule.frontMatter.tags,
          matchedTags: matchedTags,
          priority: 3,
        }

        if (resultRules.has(rule.path)) {
          duplicatesRemoved++
          // Merge types for rules that match multiple criteria
          const existing = resultRules.get(rule.path)
          existing.type = `${existing.type},tag`
          existing.matchedTags = matchedTags
        } else {
          resultRules.set(rule.path, ruleData)
        }
      }
    }
  }

  // 4. Agent-requested rules (lowest priority)
  if (includeAgentRequested) {
    const agentRequestedRules = allRules.filter(
      (rule) =>
        rule.frontMatter.alwaysApply !== true &&
        !rule.frontMatter.globs &&
        rule.frontMatter.description,
    )

    for (const rule of agentRequestedRules) {
      const ruleData = {
        name: rule.name,
        path: rule.path,
        type: 'agent-requested',
        description: rule.frontMatter.description,
        tags: rule.frontMatter.tags,
        priority: 4,
      }

      if (resultRules.has(rule.path)) {
        duplicatesRemoved++
        // Merge types for rules that match multiple criteria
        const existing = resultRules.get(rule.path)
        existing.type = `${existing.type},agent-requested`
      } else {
        resultRules.set(rule.path, ruleData)
      }
    }
  }

  // Convert map to array and sort by priority
  const rules = Array.from(resultRules.values()).sort(
    (a, b) => a.priority - b.priority,
  )

  // Calculate summary statistics
  const summary = {
    totalRules: rules.length,
    alwaysRules: rules.filter((r) => r.type.includes('always')).length,
    agentRequestedRules: rules.filter((r) => r.type.includes('agent-requested'))
      .length,
    globRules: rules.filter((r) => r.type.includes('glob')).length,
    tagRules: rules.filter((r) => r.type.includes('tag')).length,
    duplicatesRemoved,
  }

  return { rules, summary }
}

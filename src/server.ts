import * as path from 'node:path'
import * as util from 'node:util'

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'

import { defaultMode, isMode } from './utils/constants.js'

async function main() {
  const args = getArgs()

  const modeName = args.mode.charAt(0).toUpperCase() + args.mode.slice(1)

  const server = new McpServer({
    name: `Rules MCP - ${modeName} Mode`,
    version: '0.0.0',
  })

  const { registerTools } = await import(
    `./modes/${args.mode}/register-tools.js`
  )

  registerTools(server, args.rulesDirPath)

  const transport = new StdioServerTransport()
  await server.connect(transport)
}

function getArgs() {
  // Parse CLI arguments
  const args = util.parseArgs({
    allowPositionals: true,
    options: {
      mode: {
        type: 'string',
        short: 'm',
        default: defaultMode,
      },
      help: {
        type: 'boolean',
        short: 'h',
        default: false,
      },
    },
  })

  // Show help if requested
  if (args.values.help) {
    console.log(`
Rules MCP Server

Usage: rules-mcp [options] <rules-directory>

Options:
  -m, --mode <mode>    Server mode (default: ${defaultMode})
                       legacy: Individual tools with sequential flow
                       minimal: Unified initialization + QueryRules
                       unified: All tools available with QueryRules as primary
  -h, --help          Show this help message

Examples:
  rules-mcp /path/to/rules                    # Minimal mode (default)
  rules-mcp --mode unified /path/to/rules     # Unified mode
  rules-mcp --mode legacy /path/to/rules      # Legacy mode
`)
    process.exit(0)
  }

  // Validate arguments
  const rulesDirPath = args.positionals[0]?.trim() || ''

  if (!path.isAbsolute(rulesDirPath)) {
    console.error(
      'Please provide an absolute path to the rules directory e.g. npx rules-mcp /path/to/rules',
    )
    console.error('Use --help for usage information.')
    process.exit(1)
  }

  if (!isMode(args.values.mode)) {
    console.error(
      `Invalid mode: ${args.values.mode}. Must be one of: legacy, minimal, unified`,
    )
    process.exit(1)
  }

  return {
    mode: args.values.mode,
    rulesDirPath,
  }
}

main()

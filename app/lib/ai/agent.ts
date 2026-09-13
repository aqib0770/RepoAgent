import type { ToolSet } from 'ai'
import { jsonSchema, tool } from 'ai'
import { executeOperation, serializeResult } from './tools/executor'
import { getToolCatalog } from './tools/registry'

export interface TenantTools {
  tools: ToolSet
  writeToolNames: string[]
}

export function buildTenantTools(tenantId: string): TenantTools {
  const tools: ToolSet = {}
  const writeToolNames: string[] = []

  for (const entry of getToolCatalog()) {
    const isWrite = entry.riskLevel !== 'read'
    if (isWrite) writeToolNames.push(entry.toolName)
    tools[entry.toolName] = tool({
      description: isWrite
        ? `${entry.description} WRITE operation — requires explicit user approval before execution.`
        : entry.description,
      inputSchema: jsonSchema(entry.inputSchema),
      execute: async (args) => {
        try {
          const result = await executeOperation(tenantId, entry.path, args)
          return { ok: true, output: serializeResult(result) }
        } catch (error) {
          return {
            ok: false,
            error: error instanceof Error ? error.message : String(error),
          }
        }
      },
    })
  }

  return { tools, writeToolNames }
}

export const SYSTEM_PROMPT = `You are RepoAgent, an assistant that operates the user's connected integrations (currently GitHub) on their behalf.

You have one tool per operation of every connected plugin. Tool names encode the operation path with double underscores, e.g. github__api__repos__list maps to the Corsair operation github.api.repos.list. Trust the input schema of each tool for its arguments.

Guidelines:
- Prefer read operations to gather context before answering or acting.
- For write operations (create, update, delete, merge), confirm with the user what you are about to do before calling the tool.
- Write operations are gated: the user must approve the tool call in the chat before it executes. If the user denies it, do not retry — acknowledge and ask how to proceed.
- When a tool returns ok: false, read the error and adapt — do not retry the exact same call more than twice.
- Summarize tool outputs concisely instead of dumping raw JSON at the user.`

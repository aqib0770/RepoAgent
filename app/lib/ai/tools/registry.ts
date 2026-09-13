import { corsair, githubPlugin } from '@/app/lib/corsair'
import { getStructuredSchema, listOperations, type AnyCorsairInstance } from 'corsair'
import { introspectPluginForDocs, type EndpointRiskLevel } from 'corsair/core'
import { formFieldToJsonSchema } from './form-schema'

export interface CatalogEntry {
  path: string
  toolName: string
  description: string
  riskLevel: EndpointRiskLevel
  inputSchema: Record<string, unknown>
}

// Built once per server instance; the operation catalog is static per deploy.
let cachedCatalog: CatalogEntry[] | null = null

export const OPERATION_PATH = /^[\w-]+(?:\.[\w-]+)+$/

export function toToolName(path: string): string {
  return path.replaceAll('.', '__')
}

export function parseOperationPaths(listing: string): string[] {
  return listing
    .split('\n')
    .map((line) => line.trim().replace(/^[-*\s]+/, ''))
    .filter((line) => OPERATION_PATH.test(line))
}

function getRiskLevels(): Map<string, EndpointRiskLevel> {
  const result = introspectPluginForDocs([githubPlugin], 'github')
  const map = new Map<string, EndpointRiskLevel>()
  if (result.ok) {
    for (const endpoint of result.data.api) {
      map.set(endpoint.path, endpoint.riskLevel ?? 'read')
    }
  } else {
    console.warn('[registry] Failed to introspect plugin risk levels; defaulting to read-only.')
  }
  return map
}

export function getToolCatalog(): CatalogEntry[] {
  if (cachedCatalog) return cachedCatalog

  const instance = corsair as unknown as AnyCorsairInstance
  const paths = parseOperationPaths(listOperations(instance, { type: 'api' }))
  const riskLevels = getRiskLevels()

  const entries: CatalogEntry[] = []
  for (const path of paths) {
    const schema = getStructuredSchema(instance, path)
    if (!schema) {
      console.warn(`[registry] No schema for operation ${path}; skipping.`)
      continue
    }
    entries.push({
      path,
      toolName: toToolName(path),
      description: schema.description ?? `Execute the Corsair operation ${path}.`,
      riskLevel: riskLevels.get(path) ?? 'read',
      inputSchema: schema.input
        ? (formFieldToJsonSchema(schema.input) as Record<string, unknown>)
        : { type: 'object', properties: {} },
    })
  }

  cachedCatalog = entries
  return entries
}

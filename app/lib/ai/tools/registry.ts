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

let cachedCatalog: CatalogEntry[] | null = null

const OPERATION_PATH = /^[\w-]+(?:\.[\w-]+)+$/

function toToolName(path: string): string {
  return path.replaceAll('.', '__')
}

function getRiskLevels(): Map<string, EndpointRiskLevel> {
  const result = introspectPluginForDocs([githubPlugin], 'github')
  const map = new Map<string, EndpointRiskLevel>()
  if (result.ok) {
    for (const endpoint of result.data.api) {
      map.set(endpoint.path, endpoint.riskLevel ?? 'read')
    }
  }
  return map
}

export function getToolCatalog(): CatalogEntry[] {
  if (cachedCatalog) return cachedCatalog

  const listing = listOperations(corsair as unknown as AnyCorsairInstance, { type: 'api' })
  const paths = listing
    .split('\n')
    .map((line) => line.trim().replace(/^[-*\s]+/, ''))
    .filter((line) => OPERATION_PATH.test(line))

  const riskLevels = getRiskLevels()

  const entries: CatalogEntry[] = []
  for (const path of paths) {
    const schema = getStructuredSchema(corsair as unknown as AnyCorsairInstance, path)
    if (!schema) continue
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

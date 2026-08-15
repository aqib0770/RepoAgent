import { corsair } from '@/app/lib/corsair'
import { getStructuredSchema, listOperations, type AnyCorsairInstance } from 'corsair'
import { formFieldToJsonSchema } from './form-schema'

export interface CatalogEntry {
  path: string
  toolName: string
  description: string
  inputSchema: Record<string, unknown>
}

let cachedCatalog: CatalogEntry[] | null = null

const OPERATION_PATH = /^[\w-]+(?:\.[\w-]+)+$/

function toToolName(path: string): string {
  return path.replaceAll('.', '__')
}

export function getToolCatalog(): CatalogEntry[] {
  if (cachedCatalog) return cachedCatalog

  const listing = listOperations(corsair as unknown as AnyCorsairInstance, { type: 'api' })
  const paths = listing
    .split('\n')
    .map((line) => line.trim().replace(/^[-*\s]+/, ''))
    .filter((line) => OPERATION_PATH.test(line))

  const entries: CatalogEntry[] = []
  for (const path of paths) {
    const schema = getStructuredSchema(corsair as unknown as AnyCorsairInstance, path)
    if (!schema) continue
    entries.push({
      path,
      toolName: toToolName(path),
      description: schema.description ?? `Execute the Corsair operation ${path}.`,
      inputSchema: schema.input
        ? (formFieldToJsonSchema(schema.input) as Record<string, unknown>)
        : { type: 'object', properties: {} },
    })
  }

  cachedCatalog = entries
  return entries
}

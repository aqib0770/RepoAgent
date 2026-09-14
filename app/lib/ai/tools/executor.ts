import { corsair } from '@/app/lib/corsair'

type MaybeTenantScoped = {
  withTenant?: (tenantId: string) => unknown
}

type Callable = (args: unknown) => Promise<unknown> | unknown

function resolveScope(tenantId: string): unknown {
  const instance = corsair as MaybeTenantScoped
  return typeof instance.withTenant === 'function' ? instance.withTenant(tenantId) : corsair
}

export function resolveOperationPath(root: unknown, path: string): Callable {
  let node: unknown = root
  for (const segment of path.split('.')) {
    if (node == null || typeof node !== 'object' || !(segment in node)) {
      throw new Error(`Operation not found: ${path}`)
    }
    node = (node as Record<string, unknown>)[segment]
  }
  if (typeof node !== 'function') {
    throw new Error(`Operation is not callable: ${path}`)
  }
  return node as Callable
}

export async function executeOperation(
  tenantId: string,
  path: string,
  args: unknown,
): Promise<unknown> {
  const operation = resolveOperationPath(resolveScope(tenantId), path)
  return operation(args)
}

const MAX_RESULT_LENGTH = 20_000

export function serializeResult(result: unknown, maxLength = MAX_RESULT_LENGTH): string {
  let text: string
  if (typeof result === 'string') {
    text = result
  } else {
    try {
      text = JSON.stringify(result, null, 2) ?? String(result)
    } catch {
      text = String(result)
    }
  }
  if (text.length > maxLength) {
    return `${text.slice(0, maxLength)}\n...[truncated ${text.length - maxLength} chars]`
  }
  return text
}

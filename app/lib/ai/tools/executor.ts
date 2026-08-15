import { corsair } from '@/app/lib/corsair'

export async function executeOperation(
  tenantId: string,
  path: string,
  args: unknown,
): Promise<unknown> {
  const segments = path.split('.')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scoped: any =
    typeof (corsair as { withTenant?: unknown }).withTenant === 'function'
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (corsair as any).withTenant(tenantId)
      : corsair
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let node: any = scoped
  for (const segment of segments) {
    if (node == null || typeof node !== 'object' || !(segment in node)) {
      throw new Error(`Operation not found: ${path}`)
    }
    node = node[segment]
  }
  if (typeof node !== 'function') {
    throw new Error(`Operation is not callable: ${path}`)
  }

  const result = await node(args)
  return result
}

export function serializeResult(result: unknown, maxLength = 20_000): string {
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

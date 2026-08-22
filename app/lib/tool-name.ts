export type ToolVerb = 'read' | 'create' | 'update' | 'delete' | 'state' | 'other'

export type ToolMeta = {
  plugin: string
  path: string
  scope: string
  action: string
  verb: ToolVerb
}

const VERBS: Array<[RegExp, ToolVerb]> = [
  [/^(list|get|search|find|fetch|read|query|check|exists|download|compare|diff)/, 'read'],
  [/^(create|add|new|post|invite|request|upload|fork|star|follow|comment|react)/, 'create'],
  [/^(update|edit|set|patch|assign|rename|move|archive|unarchive|label|attach|detach)/, 'update'],
  [/^(delete|remove|del|destroy|unfollow|unstar|dismiss)/, 'delete'],
  [
    /^(merge|publish|release|close|open|reopen|lock|unlock|pin|dispatch|trigger|run|rerun|cancel|approve|enable|disable|transfer|deploy|submit)/,
    'state',
  ],
]

export function describeTool(toolName: string): ToolMeta {
  const segments = toolName.split('__')
  const plugin = segments[0] || 'github'
  const rest = segments.slice(1).filter((segment) => segment !== 'api' && segment !== 'db')

  const scope = rest.length > 1 ? rest.slice(0, -1).join(' / ') : ''
  const action = (rest[rest.length - 1] ?? plugin).replace(/_/g, ' ')
  const verb = VERBS.find(([pattern]) => pattern.test(rest[rest.length - 1] ?? ''))?.[1] ?? 'other'

  return { plugin, path: rest.join('.') || plugin, scope, action, verb }
}

// Smoke test: verify operation paths resolve to callable functions on the instance.
// Run: node --experimental-strip-types --env-file=.env scripts/smoke-executor.ts
import { corsair } from '../app/lib/corsair.ts'
import { listOperations } from 'corsair'

const listing = listOperations(corsair as never, { type: 'api' })
const paths = listing
  .split('\n')
  .map((l) => l.trim().replace(/^[-*\s]+/, ''))
  .filter((l) => /^[\w-]+(?:\.[\w-]+)+$/.test(l))

let resolved = 0
const failed: string[] = []
for (const p of paths) {
  let node: unknown = corsair
  for (const seg of p.split('.')) {
    node = (node as Record<string, unknown>)?.[seg]
  }
  if (typeof node === 'function') resolved++
  else failed.push(p)
}
console.log(`Resolved ${resolved}/${paths.length} operations to callable functions`)
if (failed.length) console.log('Unresolved:', failed.join(', '))
process.exit(failed.length ? 1 : 0)

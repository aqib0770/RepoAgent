// Smoke test: build the tool catalog from the live Corsair instance.
// Run: node --experimental-strip-types --env-file=.env scripts/smoke-registry.ts
import { corsair } from '../app/lib/corsair.ts'
import { getStructuredSchema, listOperations } from 'corsair'

const listing = listOperations(corsair as never, { type: 'api' })
const paths = listing
  .split('\n')
  .map((l) => l.trim().replace(/^[-*\s]+/, ''))
  .filter((l) => /^[\w-]+(?:\.[\w-]+)+$/.test(l))

console.log(`Parsed ${paths.length} operation paths. First 10:`)
console.log(paths.slice(0, 10).join('\n'))

const sample = getStructuredSchema(corsair as never, paths[0])
console.log('\nSchema for', paths[0], '=', JSON.stringify(sample, null, 2).slice(0, 600))
process.exit(0)

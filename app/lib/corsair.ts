import { createCorsair } from 'corsair'
import { createCorsairDatabase } from 'corsair/db'
import { github } from '@corsair-dev/github'
import { Pool } from 'pg'
import { requireEnv } from './env'

// Raw pg pool for the Corsair lib (credential storage). Separate from the
// Prisma client in db.ts, which owns the app's own tables.
const db = new Pool({
  connectionString: requireEnv('DATABASE_URL'),
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

// SDK-wrapped handle for key management (DEK init, credential checks).
export const corsairDatabase = createCorsairDatabase(db)

export const githubPlugin = github({
  authType: 'managed',
})

export const corsair = createCorsair({
  plugins: [githubPlugin],
  database: db,
  kek: requireEnv('CORSAIR_KEK'),
  // Required for per-tenant credentials: without this the SDK treats the
  // instance as single-tenant and never provisions account rows/DEKs for
  // real tenant ids, so connect deliveries fail.
  multiTenancy: true,
  hub: {
    projectApiKey: requireEnv('CORSAIR_API_KEY'),
    signingSecret: requireEnv('CORSAIR_SIGNING_SECRET'),
    allowWorkflowExecution: true,
  },
})

import { createCorsair } from 'corsair'
import { github } from '@corsair-dev/github'
import { Pool } from 'pg'
import { requireEnv } from './env'

const db = new Pool({
  connectionString: requireEnv('DATABASE_URL'),
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

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

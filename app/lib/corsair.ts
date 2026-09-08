import 'dotenv/config'
import { createCorsair } from 'corsair'
import { github } from '@corsair-dev/github'
import { Pool } from 'pg'
import { requireEnv } from './env'

const db = new Pool({
  connectionString: requireEnv('DATABASE_URL'),
})

export const githubPlugin = github({
  authType: 'managed',
})

export const corsair = createCorsair({
  plugins: [githubPlugin],
  database: db,
  kek: requireEnv('CORSAIR_KEK'),
  hub: {
    projectApiKey: requireEnv('CORSAIR_API_KEY'),
    signingSecret: requireEnv('CORSAIR_SIGNING_SECRET'),
    allowWorkflowExecution: true,
  },
})

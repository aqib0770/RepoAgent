import 'dotenv/config'
import { createCorsair } from 'corsair'
import { github } from '@corsair-dev/github'
import { Pool } from 'pg'
import { requireEnv } from './env'

const db = new Pool({
  connectionString: requireEnv('DATABASE_URL'),
})

export const githubPlugin = github({
  authType: 'oauth_2',
  clientId: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
})

export const corsair = createCorsair({
  plugins: [githubPlugin],
  database: db,
  kek: requireEnv('CORSAIR_KEK'),
  hub: {
    projectApiKey: requireEnv('CORSAIR_DEV_API_KEY'),
    signingSecret: requireEnv('CORSAIR_DEV_SIGNING_SECRET'),
    allowWorkflowExecution: true,
  },
})

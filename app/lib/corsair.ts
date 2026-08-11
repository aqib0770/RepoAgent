import 'dotenv/config'
import { createCorsair } from 'corsair'
import { github } from '@corsair-dev/github'
import { Pool } from 'pg'

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export const corsair = createCorsair({
  plugins: [
    github({
      authType: 'oauth_2',
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  database: db,
  kek: process.env.CORSAIR_KEK!,
  hub: {
    projectApiKey: process.env.CORSAIR_DEV_API_KEY!,
    signingSecret: process.env.CORSAIR_DEV_SIGNING_SECRET!,
    allowWorkflowExecution: true,
  },
})

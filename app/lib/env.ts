const REQUIRED_SERVER_ENV = [
  'DATABASE_URL',
  'CORSAIR_KEK',
  'CORSAIR_DEV_API_KEY',
  'CORSAIR_DEV_SIGNING_SECRET',
] as const

export type RequiredServerEnv = (typeof REQUIRED_SERVER_ENV)[number]

export function requireEnv(key: RequiredServerEnv | 'GOOGLE_GENERATIVE_AI_API_KEY' | 'APP_URL'): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(
      `Missing required environment variable "${key}". Add it to .env and restart the dev server.`,
    )
  }
  return value
}

export function checkEnv(): { missing: string[] } {
  const missing = REQUIRED_SERVER_ENV.filter((key) => !process.env[key])
  return { missing }
}

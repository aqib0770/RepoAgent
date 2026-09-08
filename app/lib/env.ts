const REQUIRED_SERVER_ENV = [
  'DATABASE_URL',
  'CORSAIR_KEK',
  'CORSAIR_API_KEY',
  'CORSAIR_SIGNING_SECRET',
] as const

export type RequiredServerEnv = (typeof REQUIRED_SERVER_ENV)[number]

function resolveEnv(key: string): string | undefined {
  if (key === 'CORSAIR_API_KEY') {
    return process.env['CORSAIR_API_KEY'] ?? process.env['CORSAIR_DEV_API_KEY']
  }
  if (key === 'CORSAIR_SIGNING_SECRET') {
    return process.env['CORSAIR_SIGNING_SECRET'] ?? process.env['CORSAIR_DEV_SIGNING_SECRET']
  }
  if (key === 'CORSAIR_DEV_API_KEY') {
    return process.env['CORSAIR_DEV_API_KEY'] ?? process.env['CORSAIR_API_KEY']
  }
  if (key === 'CORSAIR_DEV_SIGNING_SECRET') {
    return process.env['CORSAIR_DEV_SIGNING_SECRET'] ?? process.env['CORSAIR_SIGNING_SECRET']
  }
  return process.env[key]
}

export function requireEnv(
  key:
    | RequiredServerEnv
    | 'CORSAIR_DEV_API_KEY'
    | 'CORSAIR_DEV_SIGNING_SECRET'
    | 'AI_GATEWAY_API_KEY'
    | 'APP_URL',
): string {
  const value = resolveEnv(key)
  if (!value) {
    throw new Error(
      `Missing required environment variable "${key}". Add it to .env and restart the dev server.`,
    )
  }
  return value
}

export function checkEnv(): { missing: string[] } {
  const missing = REQUIRED_SERVER_ENV.filter((key) => !resolveEnv(key))
  return { missing }
}

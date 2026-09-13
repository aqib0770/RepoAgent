export type RequiredServerEnv =
  | 'DATABASE_URL'
  | 'CORSAIR_KEK'
  | 'CORSAIR_API_KEY'
  | 'CORSAIR_SIGNING_SECRET'
  | 'AI_GATEWAY_API_KEY'
  | 'AI_GATEWAY_MODEL'

/** Non-throwing read. */
export function getEnv(key: RequiredServerEnv): string | undefined {
  return process.env[key]
}

export function requireEnv(key: RequiredServerEnv): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(
      `Missing required environment variable "${key}". Add it to .env and restart the dev server.`,
    )
  }
  return value
}

export function optionalEnv(key: RequiredServerEnv, fallback: string): string {
  return process.env[key] ?? fallback
}

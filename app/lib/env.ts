const isProd = process.env.NODE_ENV === 'production'

function resolveCorsairKey(prodKey: string, devKey: string): string | undefined {
  const primary = isProd ? prodKey : devKey
  const fallback = isProd ? devKey : prodKey
  return process.env[primary] ?? process.env[fallback]
}

function resolveEnv(key: string): string | undefined {
  if (key === 'CORSAIR_API_KEY') {
    return resolveCorsairKey('CORSAIR_API_KEY', 'CORSAIR_DEV_API_KEY')
  }
  if (key === 'CORSAIR_SIGNING_SECRET') {
    return resolveCorsairKey('CORSAIR_SIGNING_SECRET', 'CORSAIR_DEV_SIGNING_SECRET')
  }
  return process.env[key]
}

export type RequiredServerEnv =
  | 'DATABASE_URL'
  | 'CORSAIR_KEK'
  | 'CORSAIR_API_KEY'
  | 'CORSAIR_SIGNING_SECRET'
  | 'AI_GATEWAY_API_KEY'
  | 'AI_GATEWAY_MODEL'

/** Non-throwing read (same NODE_ENV-aware resolution as requireEnv). */
export function getEnv(key: RequiredServerEnv): string | undefined {
  return resolveEnv(key)
}

export function requireEnv(key: RequiredServerEnv): string {
  const value = resolveEnv(key)
  if (!value) {
    throw new Error(
      `Missing required environment variable "${key}". Add it to .env and restart the dev server.`,
    )
  }
  return value
}

export function optionalEnv(key: RequiredServerEnv, fallback: string): string {
  return resolveEnv(key) ?? fallback
}

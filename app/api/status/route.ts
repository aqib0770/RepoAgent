import { NextResponse } from 'next/server'
import { corsair } from '@/app/lib/corsair'
import { getSession } from '@/app/lib/session'

function extractLogin(value: unknown): string | null {
  if (typeof value !== 'object' || value === null) return null
  const direct = (value as { login?: unknown }).login
  if (typeof direct === 'string') return direct
  const data = (value as { data?: unknown }).data
  if (typeof data === 'object' && data !== null) {
    const nested = (data as { login?: unknown }).login
    if (typeof nested === 'string') return nested
  }
  return null
}

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'No session.' }, { status: 401 })
  }

  try {
    const login = extractLogin(
      await corsair.withTenant(session.id).github.api.users.getAuthenticated({}),
    )
    if (!login) throw new Error('Unexpected profile response')
    return NextResponse.json({ connected: true, login })
  } catch {
    return NextResponse.json({ connected: false, login: null })
  }
}

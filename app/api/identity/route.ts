import { NextResponse } from 'next/server'
import { createSession, destroySession, getSession } from '@/app/lib/session'

export async function GET() {
  const session = await getSession()
  return NextResponse.json({ session })
}

export async function POST(request: Request) {
  const existing = await getSession()
  if (existing) {
    return NextResponse.json({ session: existing })
  }

  let body: { displayName?: unknown }
  try {
    body = (await request.json()) as { displayName?: unknown }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const displayName =
    typeof body.displayName === 'string' ? body.displayName.trim().slice(0, 40) : ''
  if (!displayName) {
    return NextResponse.json(
      { error: 'displayName is required (1-40 characters).' },
      { status: 400 },
    )
  }

  const session = await createSession(displayName)
  return NextResponse.json({ session }, { status: 201 })
}

export async function DELETE() {
  await destroySession()
  return NextResponse.json({ ok: true })
}

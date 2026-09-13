import { corsair } from '@/app/lib/corsair'
import { getSession } from '@/app/lib/session'
import { NextResponse } from 'next/server'

export async function GET(_request: Request, { params }: { params: Promise<{ plugin: string }> }) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'No session.' }, { status: 401 })
  }

  const { plugin } = await params
  if (!plugin || !/^[\w-]+$/.test(plugin)) {
    return NextResponse.json({ error: 'Invalid plugin.' }, { status: 400 })
  }

  try {
    const { connectUrl } = await corsair.manage.connect.createLink({
      plugin,
      tenantId: session.id,
    })
    return NextResponse.json({
      message: `Redirect your browser to the connectUrl to authorize ${plugin}`,
      connectUrl,
      tenantId: session.id,
      plugin,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create connect link.' },
      { status: 500 },
    )
  }
}

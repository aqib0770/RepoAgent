import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/db'
import { getSession } from '@/app/lib/session'

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'No session.' }, { status: 401 })
  }

  try {
    const account = await prisma.corsairAccount.findFirst({
      where: { tenantId: session.id },
      select: { dek: true },
    })
    return NextResponse.json({ connected: account != null && account.dek != null })
  } catch {
    return NextResponse.json({ error: 'Failed to check connection status.' }, { status: 503 })
  }
}

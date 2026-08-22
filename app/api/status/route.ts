import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/db'
import { getSession } from '@/app/lib/session'

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'No session.' }, { status: 401 })
  }

  const account = await prisma.corsairAccount.findFirst({
    where: { tenantId: session.id },
    select: { dek: true },
  })

  return NextResponse.json({ connected: Boolean(account?.dek) })
}

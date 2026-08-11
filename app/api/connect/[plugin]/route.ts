import { corsair } from '@/app/lib/corsair'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ plugin: string }> },
) {
  const { plugin } = await params
  const tenantId = request.nextUrl.searchParams.get('tenantId') || 'default_tenant'
  try {
    const { connectUrl } = await corsair.manage.connect.createLink({ plugin, tenantId })
    return NextResponse.json({
      message: `Redirect your browser to the connectUrl to authorize ${plugin}`,
      connectUrl,
      tenantId,
      plugin,
    })
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 })
  }
}

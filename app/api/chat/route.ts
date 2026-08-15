import { buildTenantTools, SYSTEM_PROMPT } from '@/app/lib/ai/agent'
import { chatModel } from '@/app/lib/ai/gateway'
import { streamText, type ModelMessage } from 'ai'
import { NextResponse } from 'next/server'

export const maxDuration = 300

interface ChatRequestBody {
  messages?: ModelMessage[]
  prompt?: string
  tenantId?: string
}

export async function POST(request: Request) {
  const apiKey = process.env.AI_GATEWAY_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'AI_GATEWAY_API_KEY is not set. Add it to .env to enable chat.' },
      { status: 503 },
    )
  }

  let body: ChatRequestBody
  try {
    body = (await request.json()) as ChatRequestBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const tenantId = body.tenantId ?? 'default_tenant'
  const messages =
    body.messages ?? (body.prompt ? [{ role: 'user' as const, content: body.prompt }] : null)
  if (!messages || messages.length === 0) {
    return NextResponse.json(
      { error: 'Provide either "messages" or "prompt" in the request body.' },
      { status: 400 },
    )
  }

  const result = streamText({
    model: chatModel,
    system: SYSTEM_PROMPT,
    messages,
    tools: buildTenantTools(tenantId),
    stopWhen: ({ steps }) => steps.length >= 15,
  })

  return result.toTextStreamResponse()
}

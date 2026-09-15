import { buildTenantTools, SYSTEM_PROMPT } from '@/app/lib/ai/agent'
import { chatModel } from '@/app/lib/ai/gateway'
import { getEnv } from '@/app/lib/env'
import { getSession } from '@/app/lib/session'
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from 'ai'
import { NextResponse } from 'next/server'

export const maxDuration = 300
const MAX_STEPS = 15

interface ChatRequestBody {
  messages?: UIMessage[]
  think?: boolean
}

export async function POST(request: Request) {
  if (!getEnv('AI_GATEWAY_API_KEY')) {
    return NextResponse.json(
      { error: 'AI_GATEWAY_API_KEY is not set. Add it to .env to enable chat.' },
      { status: 503 },
    )
  }

  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'No identity. Create one first.' }, { status: 401 })
  }

  let body: ChatRequestBody
  try {
    body = (await request.json()) as ChatRequestBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const messages = body.messages
  if (!messages || messages.length === 0) {
    return NextResponse.json({ error: 'Provide "messages" in the request body.' }, { status: 400 })
  }

  const { tools, writeToolNames } = buildTenantTools(session.id)

  const toolApproval = Object.fromEntries(
    writeToolNames.map((toolName) => [toolName, 'user-approval' as const]),
  )

  // Thinking defaults to on. Uses the provider-agnostic reasoning effort
  // level so the gateway and model choice stay untouched.
  const think = body.think !== false

  const result = streamText({
    model: chatModel,
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    tools,
    toolApproval,
    reasoning: think ? 'provider-default' : 'none',
    stopWhen: ({ steps }) => steps.length >= MAX_STEPS,
  })

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream, tools, sendReasoning: true }),
  })
}

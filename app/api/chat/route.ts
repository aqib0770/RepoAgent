import { buildTenantTools, SYSTEM_PROMPT } from '@/app/lib/ai/agent'
import { chatModel } from '@/app/lib/ai/gateway'
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

interface ChatRequestBody {
  messages?: UIMessage[]
}

export async function POST(request: Request) {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return NextResponse.json(
      { error: 'GOOGLE_GENERATIVE_AI_API_KEY is not set. Add it to .env to enable chat.' },
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

  const tools = buildTenantTools(session.id)

  const result = streamText({
    model: chatModel,
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    tools,
    stopWhen: ({ steps }) => steps.length >= 15,
  })

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream, tools }),
  })
}

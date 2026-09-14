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
const MAX_STEPS = 15

interface ChatRequestBody {
  messages?: UIMessage[]
}

export async function POST(request: Request) {
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

  const result = streamText({
    model: chatModel,
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    tools,
    toolApproval,
    stopWhen: ({ steps }) => steps.length >= MAX_STEPS,
  })

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream, tools }),
  })
}

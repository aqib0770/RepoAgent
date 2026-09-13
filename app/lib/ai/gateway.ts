import { createGateway } from 'ai'
import { optionalEnv } from '@/app/lib/env'

export const chatModel = createGateway()(
  optionalEnv('AI_GATEWAY_MODEL', 'anthropic/claude-sonnet-4-5'),
)

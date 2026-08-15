import { createGateway } from 'ai'

export const gateway = createGateway()

export const chatModel = gateway(process.env.AI_GATEWAY_MODEL ?? 'anthropic/claude-sonnet-4-5')

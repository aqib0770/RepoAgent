import { createOpenAICompatible } from '@ai-sdk/openai-compatible'

export const ollama = createOpenAICompatible({
  name: 'ollama',
  baseURL: process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434/v1',
})

export const chatModel = ollama(process.env.OLLAMA_MODEL ?? 'llama3.2')

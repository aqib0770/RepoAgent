'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, isToolUIPart, UIMessage } from 'ai'
import { useRouter } from 'next/navigation'
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { LogoMark } from './logo-mark'
import { MarkdownContent } from './markdown-content'
import { PromptBar } from './prompt-bar'
import { ToolCallCard } from './tool-call-card'

const SUGGESTED_PROMPTS = [
  'List my private repositories',
  'Summarize my open pull requests',
  'What issues need my attention?',
  'How many stars across my repos?',
]

function messageHasVisibleContent(message: UIMessage): boolean {
  return message.parts.some(
    (part) =>
      (part.type === 'text' && part.text.trim().length > 0) || part.type.startsWith('tool-'),
  )
}

export function ChatApp({ displayName }: { displayName: string }) {
  const router = useRouter()
  const [connected, setConnected] = useState<boolean | null>(null)
  const [connecting, setConnecting] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const transport = useMemo(() => new DefaultChatTransport<UIMessage>({ api: '/api/chat' }), [])
  const { messages, sendMessage, status, stop, error, clearError } = useChat({ transport })

  const busy = status === 'submitted' || status === 'streaming'

  useEffect(() => {
    fetch('/api/status')
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { connected?: boolean } | null) => setConnected(Boolean(data?.connected)))
      .catch(() => setConnected(false))
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [messages.length, status])

  const handleConnect = useCallback(async () => {
    setConnecting(true)
    try {
      const response = await fetch('/api/connect/github')
      if (!response.ok) throw new Error('Could not create connect link')
      const data = (await response.json()) as { connectUrl: string }
      window.location.href = data.connectUrl
    } catch {
      setConnecting(false)
    }
  }, [])

  const handleDisconnect = useCallback(async () => {
    await fetch('/api/identity', { method: 'DELETE' })
    router.refresh()
  }, [router])

  const showThinking =
    busy &&
    (messages.length === 0 ||
      (messages[messages.length - 1]?.role === 'assistant' &&
        !messageHasVisibleContent(messages[messages.length - 1])))

  return (
    <div className="mx-auto flex h-dvh w-full max-w-3xl flex-col px-4">
      <header className="flex items-center justify-between border-b border-line py-3">
        <div className="flex items-center gap-2.5">
          <LogoMark className="size-8" />
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight">RepoAgent</div>
            <div className="font-mono text-[11px] text-faint">natural language → github</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {connected === false ? (
            <button
              type="button"
              onClick={handleConnect}
              disabled={connecting}
              className="rounded-lg border border-accent/40 bg-accent-dim px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/20 disabled:opacity-50"
            >
              {connecting ? 'Redirecting…' : 'Connect GitHub'}
            </button>
          ) : connected === true ? (
            <span className="flex items-center gap-1.5 font-mono text-[11px] text-muted">
              <span className="size-1.5 rounded-full bg-accent" />
              github
            </span>
          ) : null}

          <span className="flex items-center gap-2 rounded-lg border border-line bg-surface px-2.5 py-1.5">
            <span className="flex size-5 items-center justify-center rounded-full bg-accent/15 font-mono text-[10px] font-bold uppercase text-accent">
              {displayName.slice(0, 2)}
            </span>
            <span className="max-w-[120px] truncate text-xs text-muted">{displayName}</span>
            <button
              type="button"
              onClick={handleDisconnect}
              title="Switch identity"
              className="text-faint transition-colors hover:text-danger"
            >
              <svg
                viewBox="0 0 16 16"
                className="size-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  d="M6 3H3.5A1.5 1.5 0 002 4.5v7A1.5 1.5 0 003.5 13H6M10.5 11L14 8l-3.5-3M14 8H6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </span>
        </div>
      </header>

      <main className="min-h-0 flex-1 space-y-5 overflow-y-auto py-6">
        {messages.length === 0 && !error && (
          <div className="fade-rise flex h-full flex-col items-center justify-center pb-16 text-center">
            <LogoMark className="mb-5 size-14" />
            <h1 className="text-2xl font-semibold tracking-tight">
              What are we doing on GitHub today, {displayName}?
            </h1>
            <p className="mt-2 max-w-md text-sm text-muted">
              Ask in plain language. RepoAgent picks the right GitHub operations and shows its work.
            </p>
            <div className="mt-7 grid w-full max-w-xl grid-cols-1 gap-2 sm:grid-cols-2">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage({ text: prompt })}
                  className="rounded-xl border border-line bg-surface px-4 py-3 text-left text-sm text-muted transition-colors hover:border-accent/40 hover:text-ink"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-start justify-between gap-3 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            <p>{error.message}</p>
            <button type="button" onClick={clearError} className="shrink-0 text-xs underline">
              dismiss
            </button>
          </div>
        )}

        {messages.map((message) => (
          <Fragment key={message.id}>
            {message.role === 'user' ? (
              <div className="fade-rise flex justify-end">
                <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-accent/15 px-4 py-2.5 text-[15px] leading-relaxed text-ink">
                  {message.parts
                    .filter((part) => part.type === 'text')
                    .map((part) => ('text' in part ? part.text : ''))
                    .join('')}
                </div>
              </div>
            ) : (
              <div className="fade-rise space-y-2">
                {message.parts.map((part, index) => {
                  if (isToolUIPart(part)) {
                    return <ToolCallCard key={index} part={part} />
                  }
                  if (part.type === 'text' && part.text.trim().length > 0) {
                    return <MarkdownContent key={index} content={part.text} />
                  }
                  return null
                })}
              </div>
            )}
          </Fragment>
        ))}

        {showThinking && (
          <div className="relative overflow-hidden rounded-xl border border-line-strong bg-surface/80 px-4 py-3">
            <div className="flex items-center gap-2.5 font-mono text-[13px] text-muted">
              <span className="relative inline-flex size-3.5 items-center justify-center">
                <span className="absolute inset-0 animate-spin rounded-full border border-white/15 border-t-accent" />
              </span>
              working…
            </div>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-24 animate-[shimmer-slide_1.4s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-accent/8 to-transparent" />
          </div>
        )}

        <div ref={bottomRef} />
      </main>

      <div className="pb-5 pt-1">
        <PromptBar onSend={(text) => sendMessage({ text })} onStop={stop} busy={busy} />
      </div>
    </div>
  )
}

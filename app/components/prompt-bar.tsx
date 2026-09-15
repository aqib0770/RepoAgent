'use client'

import { KeyboardEvent, useEffect, useRef, useState } from 'react'

type PromptBarProps = {
  onSend: (text: string) => void
  onStop: () => void
  busy: boolean
  thinkingEnabled: boolean
  onToggleThinking: () => void
}

export function PromptBar({
  onSend,
  onStop,
  busy,
  thinkingEnabled,
  onToggleThinking,
}: PromptBarProps) {
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const element = textareaRef.current
    if (!element) return
    element.style.height = 'auto'
    element.style.height = `${Math.min(element.scrollHeight, 160)}px`
  }, [text])

  const submit = () => {
    const value = text.trim()
    if (!value || busy) return
    onSend(value)
    setText('')
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      submit()
    }
  }

  return (
    <div className="rounded-2xl border border-line-strong bg-surface p-2 shadow-[0_8px_40px_rgba(0,0,0,0.45)] transition-colors focus-within:border-accent/40">
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask RepoAgent to do something on GitHub…"
          disabled={busy}
          className="max-h-40 flex-1 resize-none bg-transparent px-3 py-2.5 text-[15px] text-ink placeholder:text-faint focus:outline-none disabled:opacity-50"
        />
        {busy ? (
          <button
            type="button"
            onClick={onStop}
            className="mb-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl border border-line-strong text-muted transition-colors hover:border-danger/50 hover:text-danger"
            aria-label="Stop generating"
          >
            <span className="size-2.5 rounded-[3px] bg-current" />
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={!text.trim()}
            className="mb-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent text-black transition-opacity disabled:cursor-not-allowed disabled:opacity-25"
            aria-label="Send message"
          >
            <svg viewBox="0 0 16 16" className="size-4" fill="currentColor">
              <path
                d="M8 14V2M8 2L3 7M8 2l5 5"
                stroke="currentColor"
                strokeWidth="1.75"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>
      <div className="flex items-center justify-between px-3 pb-1 pt-0.5">
        <span className="text-[11px] text-faint">
          Enter to send · Shift+Enter for newline · writes are confirmed first
        </span>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onToggleThinking}
            disabled={busy}
            title={thinkingEnabled ? 'Disable model thinking (faster)' : 'Enable model thinking'}
            aria-pressed={thinkingEnabled}
            className="flex items-center gap-1.5 rounded-full border border-line px-2 py-0.5 font-mono text-[11px] text-faint transition-colors hover:border-accent/40 hover:text-muted disabled:opacity-50"
          >
            <span
              className={`size-1.5 rounded-full ${thinkingEnabled ? 'bg-accent' : 'bg-faint'}`}
            />
            thinking {thinkingEnabled ? 'on' : 'off'}
          </button>
          <span className="hidden font-mono text-[11px] text-faint sm:block">
            github connected via corsair
          </span>
        </div>
      </div>
    </div>
  )
}

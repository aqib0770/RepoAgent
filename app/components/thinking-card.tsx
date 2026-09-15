'use client'

import { useEffect, useState } from 'react'

function Spinner() {
  return (
    <span className="relative inline-flex size-3.5 shrink-0 items-center justify-center">
      <span className="absolute inset-0 animate-spin rounded-full border border-white/15 border-t-accent" />
    </span>
  )
}

export function ThinkingCard({ text, state }: { text: string; state: 'streaming' | 'done' }) {
  // null = follow the stream automatically (open while thinking, collapsed when done)
  const [expanded, setExpanded] = useState<boolean | null>(null)
  const [ticks, setTicks] = useState(0)
  const streaming = state === 'streaming'
  const open = expanded ?? streaming

  useEffect(() => {
    if (!streaming) return
    const id = setInterval(() => setTicks((count) => count + 1), 500)
    return () => clearInterval(id)
  }, [streaming])

  const seconds = ticks / 2

  return (
    <div className="fade-rise overflow-hidden rounded-xl border border-line bg-surface/80">
      <button
        type="button"
        onClick={() => setExpanded((value) => !(value ?? streaming))}
        className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left transition-colors hover:bg-white/[0.03]"
      >
        {streaming ? (
          <Spinner />
        ) : (
          <span className="flex size-3.5 shrink-0 items-center justify-center rounded-full bg-accent/15 font-mono text-[10px] text-accent">
            ✓
          </span>
        )}
        <span className="flex-1 font-mono text-[13px] text-muted">
          {streaming ? `Thinking… ${seconds.toFixed(0)}s` : `Thought for ${seconds.toFixed(1)}s`}
        </span>
        <svg
          viewBox="0 0 16 16"
          className={`size-3.5 shrink-0 text-faint transition-transform ${open ? 'rotate-90' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M6 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-line px-3.5 py-3">
          <pre className="max-h-64 overflow-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-muted">
            {text || '…'}
          </pre>
        </div>
      )}
    </div>
  )
}

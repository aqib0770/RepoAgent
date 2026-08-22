'use client'

import { useState } from 'react'
import { describeTool, type ToolVerb } from '@/app/lib/tool-name'
import type { DynamicToolUIPart, ToolUIPart } from 'ai'

const VERB_STYLE: Record<ToolVerb, { glyph: string; color: string }> = {
  read: { glyph: '👁', color: 'text-sky-400' },
  create: { glyph: '＋', color: 'text-accent' },
  update: { glyph: '✎', color: 'text-warn' },
  delete: { glyph: '✕', color: 'text-danger' },
  state: { glyph: '⇄', color: 'text-violet-400' },
  other: { glyph: '◆', color: 'text-muted' },
}

type PartState = ToolUIPart['state'] | DynamicToolUIPart['state']
type AnyToolPart = ToolUIPart | DynamicToolUIPart

function Spinner() {
  return (
    <span className="relative inline-flex size-4 shrink-0 items-center justify-center">
      <span className="absolute inset-0 animate-spin rounded-full border border-white/15 border-t-accent" />
    </span>
  )
}

function StateIcon({ state }: { state: PartState }) {
  if (state === 'input-streaming' || state === 'input-available') return <Spinner />
  if (state === 'output-available')
    return (
      <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-accent/15 font-mono text-[10px] text-accent">
        ✓
      </span>
    )
  return (
    <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-danger/15 font-mono text-[10px] text-danger">
      ✕
    </span>
  )
}

function summarize(part: AnyToolPart): string | null {
  if (part.state === 'output-error') return part.errorText
  if (part.state !== 'output-available') return null

  const output = part.output as { ok?: boolean; output?: string; error?: string } | undefined
  if (!output) return null
  if (output.ok === false) {
    return typeof output.error === 'string' ? output.error : 'Operation failed'
  }

  try {
    const parsed: unknown = JSON.parse(output.output ?? '')
    if (Array.isArray(parsed)) {
      const count = parsed.length
      return `${count} result${count === 1 ? '' : 's'}`
    }
    if (parsed && typeof parsed === 'object') {
      const keys = Object.keys(parsed as Record<string, unknown>)
      return keys.length <= 4 ? keys.join(', ') : `${keys.length} fields`
    }
    return null
  } catch {
    return null
  }
}

export function ToolCallCard({ part }: { part: AnyToolPart }) {
  const [open, setOpen] = useState(false)
  const name =
    part.type === 'dynamic-tool'
      ? part.toolName
      : part.type.startsWith('tool-')
        ? part.type.slice(5)
        : part.type
  const meta = describeTool(name)
  const style = VERB_STYLE[meta.verb]
  const running = part.state === 'input-streaming' || part.state === 'input-available'

  const inputJson = JSON.stringify(part.input ?? {}, null, 2) ?? ''
  let outputText: string | undefined
  if (part.state === 'output-available') {
    const output = part.output as { ok?: boolean; output?: string; error?: string } | undefined
    outputText =
      output?.ok === false ? output.error : (output?.output ?? JSON.stringify(output, null, 2))
  }

  const summary = summarize(part)

  return (
    <div
      className={`fade-rise overflow-hidden rounded-xl border bg-surface/80 ${
        part.state === 'output-error' || summary?.startsWith('Operation failed')
          ? 'border-danger/25'
          : running
            ? 'border-line-strong'
            : 'border-line'
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-white/[0.03]"
      >
        <StateIcon state={part.state} />
        <span className={`font-mono text-sm ${style.color}`}>{style.glyph}</span>
        <span className="min-w-0 flex-1 truncate">
          {meta.scope && <span className="font-mono text-[13px] text-faint">{meta.scope}</span>}
          {meta.scope && <span className="font-mono text-[13px] text-faint"> · </span>}
          <span className="font-mono text-[13px] font-medium text-ink">{meta.action}</span>
          {summary && !running && (
            <span className="ml-2.5 hidden truncate text-xs text-muted sm:inline">{summary}</span>
          )}
        </span>
        <span className="shrink-0 font-mono text-[11px] uppercase tracking-wide text-faint">
          {running ? 'running' : part.state === 'output-error' ? 'failed' : 'done'}
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
        <div className="space-y-3 border-t border-line px-3.5 py-3">
          <div>
            <div className="mb-1.5 font-mono text-[11px] uppercase tracking-wide text-faint">
              input
            </div>
            <pre className="max-h-44 overflow-auto rounded-lg bg-canvas p-3 font-mono text-xs leading-relaxed text-muted">
              {inputJson || '{}'}
            </pre>
          </div>
          {outputText !== undefined && (
            <div>
              <div className="mb-1.5 font-mono text-[11px] uppercase tracking-wide text-faint">
                output
              </div>
              <pre className="max-h-64 overflow-auto rounded-lg bg-canvas p-3 font-mono text-xs leading-relaxed text-muted">
                {outputText}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

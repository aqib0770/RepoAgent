'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import { LogoMark } from './logo-mark'

export function NameGate() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const displayName = name.trim()
    if (!displayName) return

    setSubmitting(true)
    setError(null)
    try {
      const response = await fetch('/api/identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName }),
      })
      if (!response.ok && response.status !== 200 && response.status !== 201) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null
        throw new Error(data?.error ?? 'Something went wrong')
      }
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setSubmitting(false)
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="fade-rise w-full max-w-sm rounded-2xl border border-line bg-surface p-8">
        <LogoMark className="mb-6 size-11" />
        <h1 className="text-xl font-semibold tracking-tight">First, who&apos;s driving?</h1>
        <p className="mt-1.5 text-sm text-muted">
          Just a name so RepoAgent knows whose GitHub it&apos;s operating. No passwords, no email.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <input
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={40}
            placeholder="e.g. aqib"
            className="w-full rounded-lg border border-line-strong bg-canvas px-3.5 py-2.5 font-mono text-sm text-ink placeholder:text-faint focus:border-accent/60 focus:outline-none"
          />
          {error && <p className="text-xs text-danger">{error}</p>}
          <button
            type="submit"
            disabled={!name.trim() || submitting}
            className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-black transition-opacity disabled:cursor-not-allowed disabled:opacity-30"
          >
            {submitting ? 'Creating identity…' : 'Start →'}
          </button>
        </form>
      </div>
    </main>
  )
}

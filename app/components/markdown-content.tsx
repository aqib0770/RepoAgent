'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="text-[15px] leading-relaxed text-ink">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
          h1: ({ children }) => (
            <h1 className="mb-3 mt-4 text-xl font-semibold first:mt-0">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-2 mt-4 text-lg font-semibold first:mt-0">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2 mt-3 text-base font-semibold first:mt-0">{children}</h3>
          ),
          ul: ({ children }) => (
            <ul className="mb-3 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-3 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>
          ),
          li: ({ children }) => <li className="pl-1">{children}</li>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent"
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="mb-3 border-l-2 border-line-strong pl-3 text-muted">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-4 border-line" />,
          table: ({ children }) => (
            <div className="mb-3 overflow-x-auto rounded-lg border border-line">
              <table className="w-full text-sm">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border-b border-line bg-surface-2 px-3 py-2 text-left font-medium">
              {children}
            </th>
          ),
          td: ({ children }) => <td className="border-b border-line px-3 py-2">{children}</td>,
          code: ({ className, children }) => {
            const isBlock = typeof className === 'string' && className.includes('language-')
            if (!isBlock) {
              return (
                <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[0.85em] text-ink">
                  {children}
                </code>
              )
            }
            return <code className="font-mono text-[13px] leading-relaxed">{children}</code>
          },
          pre: ({ children }) => {
            const child = Array.isArray(children) ? children[0] : children
            const language =
              typeof child === 'object' &&
              child !== null &&
              'props' in child &&
              typeof (child.props as { className?: string }).className === 'string'
                ? ((child.props as { className?: string }).className ?? '').replace('language-', '')
                : ''

            return (
              <div className="relative mb-3 overflow-hidden rounded-lg border border-line bg-[#0d1117]">
                {language && (
                  <div className="flex items-center justify-between border-b border-line px-3 py-1.5">
                    <span className="font-mono text-xs text-faint">{language}</span>
                  </div>
                )}
                <pre className="overflow-x-auto p-4 font-mono text-[13px] text-ink/90">
                  {children}
                </pre>
              </div>
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

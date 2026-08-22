export function LogoMark({ className = 'size-9' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-lg border border-accent/30 bg-accent-dim ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        className="size-[58%]"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          d="M4 17l6-5-6-5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-accent"
        />
        <path d="M12 19h8" strokeLinecap="round" className="text-accent" />
      </svg>
    </span>
  )
}

export const HandCheck = ({ className = "", animate = false }: { className?: string; animate?: boolean }) => (
  <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
    <path
      d="M8 26 C12 28, 16 33, 19 38 C24 27, 32 16, 42 8"
      fill="none"
      stroke="hsl(var(--rule))"
      strokeWidth="4.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={animate ? "animate-draw" : ""}
      style={animate ? { strokeDasharray: 60, strokeDashoffset: 60 } : undefined}
    />
  </svg>
);

export const HandCircle = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
    <path
      d="M24 6 C35 5.5, 42.5 13, 42 24 C41.5 35, 34 42.5, 23.5 42 C13 41.5, 6 34.5, 6.5 23.5 C7 13.5, 14 6.8, 25 6.2"
      fill="none"
      stroke="hsl(var(--ink) / 0.55)"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export const LockMark = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 48 48" className={className} aria-hidden="true" fill="none" stroke="hsl(var(--ink))" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 21 V15 C15 9.5, 19 6.5, 24 6.5 C29 6.5, 33 9.5, 33 15 V21" />
    <path d="M11 21.5 C19 20.8, 29 20.8, 37 21.3 L36.5 41 C28 41.6, 20 41.6, 11.5 41.2 Z" fill="hsl(var(--rule) / 0.55)" />
    <path d="M24 29 V34" />
  </svg>
);

export const EnvelopeMark = ({ className = "", sealed = false }: { className?: string; sealed?: boolean }) => (
  <svg viewBox="0 0 120 84" className={className} aria-hidden="true" fill="none" stroke="hsl(var(--ink))" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 10 C40 8.5, 80 8.5, 114 10 L113 76 C80 77.5, 40 77.5, 7 76 Z" fill="hsl(var(--rule) / 0.45)" />
    <path d="M7 11 C25 28, 42 42, 60 48 C78 42, 96 28, 113 11" />
    {sealed && <circle cx="60" cy="48" r="9" fill="hsl(var(--rule))" stroke="hsl(var(--ink))" />}
  </svg>
);

export const Sprig = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 60 40" className={className} aria-hidden="true" fill="none" stroke="hsl(var(--rule))" strokeWidth="1.6" strokeLinecap="round">
    <path d="M4 36 C18 30, 30 20, 40 6" />
    <path d="M14 31 C12 25, 15 21, 20 20 C21 25, 18 29, 14 31 Z" fill="hsl(var(--rule) / 0.35)" />
    <path d="M24 24 C27 19, 32 18, 35 20 C33 25, 28 26, 24 24 Z" fill="hsl(var(--rule) / 0.35)" />
    <circle cx="41" cy="6" r="3.5" fill="hsl(var(--rule) / 0.6)" />
  </svg>
);

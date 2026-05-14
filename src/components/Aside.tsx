import * as React from 'react';

interface AsideProps {
  /** Kept for backwards compatibility; tones now render uniformly monochrome. */
  tone?: 'amber' | 'blue' | 'green' | 'red' | 'purple';
  children: React.ReactNode;
}

/**
 * A bordered callout. Monochrome by design — the only emphasis is a hairline
 * frame on a muted background. Matches the tools/share design language.
 */
export function Aside({ children }: AsideProps) {
  return (
    <aside
      className="my-6 px-4 py-3 text-sm"
      style={{
        background: 'hsl(var(--accent))',
        border: '1px solid hsl(var(--border))',
        borderLeft: '3px solid hsl(var(--rule))',
        borderRadius: 4,
        color: 'hsl(var(--fg))',
      }}
    >
      {children}
    </aside>
  );
}

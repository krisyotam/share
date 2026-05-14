import * as React from 'react';

interface SideBySideProps {
  left: React.ReactNode;
  right: React.ReactNode;
  leftLabel?: string;
  rightLabel?: string;
}

/**
 * Two-column comparison block. Stacks vertically on small screens.
 */
export function SideBySide({ left, right, leftLabel, rightLabel }: SideBySideProps) {
  return (
    <div className="my-6 grid grid-cols-1 md:grid-cols-2 gap-px border border-[hsl(var(--border))]">
      <div className="p-4" style={{ background: 'hsl(var(--bg))' }}>
        {leftLabel ? (
          <div className="mb-2 text-xs font-mono uppercase tracking-wider text-[hsl(var(--muted-fg))]">
            {leftLabel}
          </div>
        ) : null}
        <div>{left}</div>
      </div>
      <div className="p-4" style={{ background: 'hsl(var(--bg))' }}>
        {rightLabel ? (
          <div className="mb-2 text-xs font-mono uppercase tracking-wider text-[hsl(var(--muted-fg))]">
            {rightLabel}
          </div>
        ) : null}
        <div>{right}</div>
      </div>
    </div>
  );
}

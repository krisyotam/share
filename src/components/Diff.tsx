import * as React from 'react';

type DiffLine =
  | { type: 'add'; text: string }
  | { type: 'remove'; text: string }
  | { type: 'context'; text: string }
  | { type: 'hunk'; text: string };

interface DiffProps {
  /** Optional file path shown above the diff (e.g. "src/foo.ts") */
  filename?: string;
  /** Either provide pre-tokenized lines... */
  lines?: DiffLine[];
  /** ...or a raw unified-diff-style string with leading +/- / space markers */
  children?: string;
}

const styles: Record<DiffLine['type'], React.CSSProperties> = {
  add: {
    background: 'hsl(var(--add-bg))',
    color: 'hsl(var(--add-fg))',
    borderLeft: '3px solid hsl(var(--add-rule))',
  },
  remove: {
    background: 'hsl(var(--remove-bg))',
    color: 'hsl(var(--remove-fg))',
    borderLeft: '3px solid hsl(var(--remove-rule))',
  },
  context: {
    background: 'transparent',
    color: 'hsl(var(--muted-fg))',
    borderLeft: '3px solid transparent',
  },
  hunk: {
    background: 'hsl(var(--accent))',
    color: 'hsl(var(--muted-fg))',
    borderLeft: '3px solid transparent',
    fontStyle: 'italic',
  },
};

const markers: Record<DiffLine['type'], string> = {
  add: '+',
  remove: '-',
  context: ' ',
  hunk: '@',
};

function parseRaw(raw: string): DiffLine[] {
  // Trim only leading/trailing blank lines; preserve internal whitespace.
  const trimmed = raw.replace(/^\n+|\n+$/g, '');
  return trimmed.split('\n').map((line): DiffLine => {
    if (line.startsWith('@@')) return { type: 'hunk', text: line };
    if (line.startsWith('+')) return { type: 'add', text: line.slice(1) };
    if (line.startsWith('-')) return { type: 'remove', text: line.slice(1) };
    if (line.startsWith(' ')) return { type: 'context', text: line.slice(1) };
    return { type: 'context', text: line };
  });
}

export function Diff({ filename, lines, children }: DiffProps) {
  const resolved: DiffLine[] = lines ?? (children ? parseRaw(children) : []);
  return (
    <div
      className="my-6 font-mono text-sm overflow-hidden"
      style={{ border: '1px solid hsl(var(--border))' }}
    >
      {filename ? (
        <div
          className="px-3 py-1.5 text-xs"
          style={{
            background: 'hsl(var(--accent))',
            color: 'hsl(var(--muted-fg))',
            borderBottom: '1px solid hsl(var(--border))',
          }}
        >
          {filename}
        </div>
      ) : null}
      <pre className="m-0 p-0 overflow-x-auto" style={{ background: 'transparent', border: 'none', borderRadius: 0 }}>
        {resolved.map((line, i) => (
          <div
            key={i}
            className="px-3 py-0.5 whitespace-pre"
            style={styles[line.type]}
          >
            <span style={{ opacity: 0.5, display: 'inline-block', width: '1.5em' }}>
              {markers[line.type]}
            </span>
            {line.text || '\u00a0'}
          </div>
        ))}
      </pre>
    </div>
  );
}

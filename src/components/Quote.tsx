import * as React from 'react';

interface QuoteProps {
  children: React.ReactNode;
  author?: string;
  source?: string;
}

export function Quote({ children, author, source }: QuoteProps) {
  return (
    <figure className="my-8">
      <blockquote className="italic text-lg leading-relaxed pl-4 border-l-2 border-[hsl(var(--rule))]">
        {children}
      </blockquote>
      {author || source ? (
        <figcaption className="mt-2 pl-4 text-sm text-[hsl(var(--muted-fg))] font-mono">
          {author ? <span>— {author}</span> : null}
          {source ? <span className="italic"> · {source}</span> : null}
        </figcaption>
      ) : null}
    </figure>
  );
}

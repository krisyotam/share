import * as React from 'react';

interface FigureProps {
  src: string;
  alt?: string;
  caption?: React.ReactNode;
  width?: number | string;
}

export function Figure({ src, alt = '', caption, width }: FigureProps) {
  return (
    <figure className="my-8">
      <img
        src={src}
        alt={alt}
        style={width ? { maxWidth: width } : undefined}
        className="mx-auto block rounded"
      />
      {caption ? (
        <figcaption className="mt-2 text-center text-sm text-[hsl(var(--muted-fg))] italic">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

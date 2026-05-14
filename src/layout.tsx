import * as React from 'react';
import type { ShareMeta } from './types';

interface ShareLayoutProps {
  meta: ShareMeta;
  children: React.ReactNode;
}

/**
 * Wraps every share. Provides the /home-width container, prose theme,
 * header/footer, and the theme toggle button in the top-right corner.
 *
 * The no-flash theme script and click-handler wiring are injected by the
 * build pipeline into the shell HTML, not here — they need to run as raw
 * <script> tags, which React won't render through renderToStaticMarkup.
 * Here we only render the button itself with `data-theme-toggle` so the
 * shell script can find and bind it.
 */
export function ShareLayout({ meta, children }: ShareLayoutProps) {
  return (
    <>
      <button
        data-theme-toggle
        type="button"
        aria-label="Toggle theme"
        className="fixed top-3 right-3 z-50 inline-flex items-center justify-center w-9 h-9 text-base font-mono leading-none border border-border bg-background hover:bg-muted transition-colors"
        style={{ borderRadius: 0 }}
      >
        {/* Placeholder character — replaced at runtime by the shell script
            with ☀ (dark→light) or ☾ (light→dark). */}
        &nbsp;
      </button>

      <main className="share-shell py-10 sm:py-16">
        <header className="mb-10 pb-6 border-b border-border">
          <h1 className="share-prose !mt-0 text-3xl font-semibold tracking-tight">
            {meta.title}
          </h1>
          <div className="mt-2 text-sm text-muted-foreground font-mono">
            <time dateTime={meta.date}>{meta.date}</time>
            {meta.tags && meta.tags.length > 0 ? (
              <span> · {meta.tags.join(' · ')}</span>
            ) : null}
          </div>
          {meta.description ? (
            <p className="mt-3 text-base text-muted-foreground italic">
              {meta.description}
            </p>
          ) : null}
        </header>

        <article className="share-prose">{children}</article>

        <footer className="mt-16 pt-6 border-t border-border text-sm text-muted-foreground font-mono flex justify-between">
          <a href="/share/">← all shares</a>
          <a href="https://krisyotam.com">krisyotam.com</a>
        </footer>
      </main>
    </>
  );
}

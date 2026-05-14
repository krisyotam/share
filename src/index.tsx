import * as React from 'react';
import type { ShareMeta } from './types';

interface IndexProps {
  shares: ShareMeta[];
}

/**
 * Landing page for /share — nearly identical to ~/dev/tools/index.html,
 * just "share" in place of "tools".
 *
 * Layout: brand block (h1 + italic tagline) + theme toggle · search input
 * with `/` shortcut · 3-column table (name / date / description) · floored
 * footer with built/total counts and a github link.
 *
 * The build pipeline wraps this body in the shell HTML (Google Fonts,
 * theme-toggle script, search script). See build.ts.
 */
export default function Index({ shares }: IndexProps) {
  const visible = shares
    .filter((s) => s.audience !== 'unlisted')
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const total = visible.length;

  return (
    <div className="page">
      <div className="grow">
        <main className="shell">
          {/* ── header ─────────────────────────────────────────────── */}
          <div className="head">
            <div className="brand">
              <h1>share</h1>
              <p>pitch decks, breakdowns, charts, and ideas formatted by claude and delivered for one time use</p>
            </div>
            <button
              className="toggle"
              data-theme-toggle
              aria-label="Switch to dark"
              type="button"
            >
              {/* moon (light → dark) */}
              <svg
                className="icon-moon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
              {/* sun (dark → light) */}
              <svg
                className="icon-sun"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2" />
                <path d="M12 20v2" />
                <path d="m4.93 4.93 1.41 1.41" />
                <path d="m17.66 17.66 1.41 1.41" />
                <path d="M2 12h2" />
                <path d="M20 12h2" />
                <path d="m6.34 17.66-1.41 1.41" />
                <path d="m19.07 4.93-1.41 1.41" />
              </svg>
            </button>
          </div>

          {/* ── search ─────────────────────────────────────────────── */}
          <div className="search">
            <svg
              className="search-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3-3" />
            </svg>
            <input
              id="q"
              type="text"
              placeholder="search"
              autoComplete="off"
              spellCheck={false}
            />
            <kbd className="search-kbd">/</kbd>
          </div>

          {/* ── table ──────────────────────────────────────────────── */}
          <table className="shares" id="shares">
            <colgroup>
              <col className="col-name" />
              <col className="col-date" />
              <col />
            </colgroup>
            <tbody>
              {visible.map((s) => {
                const haystack = [
                  s.title,
                  s.date,
                  s.description ?? '',
                  ...(s.tags ?? []),
                ]
                  .join(' ')
                  .toLowerCase();
                return (
                  <tr key={s.slug} data-name={s.title} data-search={haystack}>
                    <td className="name">
                      <a href={`${s.slug}/`}>{s.title}</a>
                    </td>
                    <td className="date">
                      <time dateTime={s.date}>{s.date}</time>
                    </td>
                    <td className="desc">{s.description}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <p className="empty">nothing matches.</p>
        </main>
      </div>

      {/* ── footer (within column, floored) ──────────────────────── */}
      <footer className="shell-footer">
        <div className="foot-inner">
          <span>
            <span data-visible-count>{total}</span> / <span data-total-count>{total}</span> shares
          </span>
          <span>
            <a href="https://github.com/krisyotam/share" rel="noopener">
              github.com/krisyotam/share
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}

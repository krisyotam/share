# share — repo instructions

This repo builds `krisyotam.com/share/*` — a static site for visual one-offs:
pitch decks, breakdowns, charts, and ideas formatted by Claude and delivered
for one-time use.

Each share is a single `.tsx` file in `shares/` that exports `meta` + a
default component. The build pipeline (`build.ts`) prerenders every share
to HTML, rebuilds the landing index, and writes to `dist/`. Deploy is
`rsync dist/ → stargate:/mnt/storage/share/` behind the nginx alias on
`krisyotam.com/share/`.

No framework. esbuild for TSX → ESM. `react-dom/server` for HTML rendering.
Tailwind CLI for CSS. No client JS except the theme toggle.

## Design language — match `krisyotam/tools`

The canonical design language for this repo is the one in
`~/dev/tools/` (https://github.com/krisyotam/tools), mounted at
`krisyotam.com/tools`. When in doubt about color, type, spacing, or
behavior — read `~/dev/tools/index.html` and `~/dev/tools/CLAUDE.md`,
then mirror.

### Tokens (HSL triples — used inside `hsl(...)`)

Light:

```
--bg       0 0% 100%
--fg       0 0%  20%
--fg-dim   0 0%  35%
--muted    0 0%  92%
--muted-fg 0 0%  50%
--border   0 0%  88%
--rule     0 0%  82%
--accent   0 0%  96%
```

Dark (`html.dark`):

```
--bg       0 0%   7%
--fg       0 0%  96%
--fg-dim   0 0%  78%
--muted    0 0%  12%
--muted-fg 0 0%  60%
--border   0 0%  17%
--rule     0 0%  22%
--accent   0 0%  11%
```

Use `hsl(var(--token))` for every color. Never hardcode hex.

### Fonts

```
--serif: 'Lora', ui-serif, Georgia, serif        — headings, italic taglines
--sans:  'Inter', ui-sans-serif, system-ui       — body, UI
--mono:  'JetBrains Mono', ui-monospace, Menlo   — numbers, dates, labels, tags
```

Loaded from Google Fonts at the top of every page. Headings use Lora 500 at
`-0.01em` letter-spacing. Taglines use Lora 400 italic in `muted-fg`. Body
is Inter 15px / line-height 1.55.

### Layout

- Page content max-width: **640px** (`.shell`).
- Outer padding: 32px desktop, 22px phone (< 560px).
- Top padding on shell: 80px (homepage) / 32px (interior).
- Bottom padding before footer: 48-64px.
- The page is a flex column with `min-height: 100dvh`; footer is **floored
  to viewport bottom** via `flex-grow: 1` on the content wrapper.

### Components

- **Theme toggle**: 32×32 button, `--border` outline, Lucide Sun/Moon SVGs,
  swapped via CSS based on `html.dark`. Class: `.toggle`.
- **Section labels**: Mono 11px, `0.12em` letter-spacing, uppercase,
  `muted-fg` color.
- **Stat numbers / counters**: Mono 22px.
- **Hairline divider**: `border-top: 1px solid hsl(var(--rule))`. Footer
  uses this above its inner row.
- All transitions: `120ms ease`. Inputs: `150ms ease`.
- No shadows, no gradients, no rounded corners beyond 4-6px on buttons.

### Anti-patterns

Refuse to:
- Add hex colors. Use the HSL tokens.
- Add a second accent color, gradient, or chromatic series.
- Add icons inside rows / table cells (names carry meaning).
- Add hero illustrations, marketing copy, or social proof.
- Wrap shares in card frames with shadows. The design is borderless and
  hairlined.

## File map

| File                          | Role                                             |
| ----------------------------- | ------------------------------------------------ |
| `shares/<slug>.tsx`           | One share. Filename = slug. Exports `meta` + JSX |
| `src/index.tsx`               | Landing page (lists every public share)          |
| `src/layout.tsx`              | `ShareLayout` wrapping every share interior      |
| `src/components/*`            | `Figure`, `Quote`, `Aside`, `Diff`, `SideBySide` |
| `src/styles/theme.css`        | HSL tokens (mirror of tools)                     |
| `src/styles/globals.css`      | Tailwind + `.share-prose` + landing styles       |
| `build.ts`                    | Whole pipeline (~160 lines)                      |
| `tailwind.config.ts`          | Lora / Inter / JetBrains Mono, dark-mode class   |

## When adding a share

1. Pick a slug. Create `shares/<slug>.tsx`. Filename must match
   `meta.slug` (build warns otherwise).
2. Fill `meta`: `title`, `slug`, `date` (ISO), `description`, `tags`,
   `audience` (`public` or `unlisted`).
3. Wrap the body in `<ShareLayout meta={meta}>`. Use `Figure`, `Quote`,
   `Aside`, `Diff`, `SideBySide` from `src/components`.
4. `pnpm build`. Inspect `dist/<slug>/index.html`. Ship via rsync.

## What NOT to do

- Don't write content (the actual share copy) on Kris's behalf. Templates,
  layouts, styling, and components only.
- Don't introduce frameworks, build steps beyond what exists, or runtime
  dependencies. Stay tiny.
- Don't run `npm run build` or `pnpm build` without explicit instruction
  from Kris. He's stated this globally.
- Don't drift from the tools design language. If you reach for a value
  not present in `~/dev/tools/index.html`, stop and ask.

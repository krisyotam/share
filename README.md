# share

Static repo behind `krisyotam.com/share`. One TSX file per share, prerendered to
plain HTML, deployed to nginx. No framework.

## Authoring

```tsx
// shares/my-thing.tsx
import { ShareLayout, Figure, Quote, Aside } from '../src/components';
import type { ShareMeta } from '../src/types';

export const meta: ShareMeta = {
  title: 'My Thing',
  slug: 'my-thing',          // must match filename
  date: '2026-05-13',
  description: 'A short blurb shown on the index.',
  tags: ['tools'],
  audience: 'public',         // or 'unlisted'
};

export default function Share() {
  return (
    <ShareLayout meta={meta}>
      <p>Content...</p>
    </ShareLayout>
  );
}
```

That's it. The build script picks up every `.tsx` in `shares/`, renders it,
and rebuilds the index.

## Build

```bash
pnpm install      # or npm install
pnpm build        # → dist/
```

Output:

```
dist/
├── index.html              # list of all shares (poetry-repo style)
├── my-thing/index.html
└── assets/style.css
```

## Deploy

`rsync` `dist/` to stargate, then add an nginx alias to krisyotam.com:

```nginx
location /share/ {
  alias /mnt/storage/share/;
  try_files $uri $uri/ $uri/index.html /share/index.html;
}
```

## Theme

Mirrors krisyotam.com:

- Width: 56rem (matches `/home`).
- Colors: `100 Whites · 100 Blacks` neutrals + 12 pastel hues × 7 steps. Variables in `src/styles/theme.css`.
- Light/dark switching: `.dark` class on `<html>` or `prefers-color-scheme: dark` as no-JS fallback.

## Layout

```
share/
├── build.ts                 # ~120 lines, the whole pipeline
├── tailwind.config.ts
├── tsconfig.json
├── shares/                  # one file per share — author here
├── src/
│   ├── index.tsx            # index page component
│   ├── layout.tsx           # ShareLayout — wraps every share
│   ├── types.ts             # ShareMeta
│   ├── components/          # Figure, Quote, Aside, ...
│   └── styles/
│       ├── theme.css        # color tokens
│       └── globals.css      # Tailwind directives + .share-prose
└── dist/                    # build output (gitignored)
```

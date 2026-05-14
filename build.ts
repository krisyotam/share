/**
 * Build pipeline for the /share repo.
 *
 *   shares/<slug>.tsx  →  dist/<slug>/index.html
 *   src/index.tsx      →  dist/index.html  (lists all shares)
 *   src/styles/globals.css (+ tailwind)  →  dist/assets/style.css
 *
 * No framework. esbuild for TSX → ESM, react-dom/server for HTML rendering,
 * Tailwind CLI for the stylesheet. Deploy `dist/` to nginx at /share/.
 */
import * as esbuild from 'esbuild';
import { renderToStaticMarkup } from 'react-dom/server';
import { readdir, rm, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { join, basename, extname, resolve } from 'node:path';
import type { ShareMeta } from './src/types';

const ROOT = resolve('.');
const BUILD_DIR = join(ROOT, '.build');
const DIST_DIR = join(ROOT, 'dist');
const SHARES_DIR = join(ROOT, 'shares');
const SRC_INDEX = join(ROOT, 'src', 'index.tsx');

/**
 * Shell for share pages — wraps the rendered React body in proper HTML,
 * loads the stylesheet, includes the no-flash theme script + toggle wiring.
 * The index page does NOT use this shell — it's rendered as bare HTML to
 * match the poetry repo style.
 */
const FONTS_LINK = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">`;

const THEME_BOOT_SCRIPT = `<script>(function(){try{var t=localStorage.getItem('share-theme');var d=t||(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.classList.add(d);}catch(e){}})();</script>`;

const THEME_TOGGLE_SCRIPT = `<script>(function(){var b=document.querySelector('[data-theme-toggle]');if(!b)return;function u(){var d=document.documentElement.classList.contains('dark');b.setAttribute('aria-label',d?'Switch to light':'Switch to dark');}u();b.addEventListener('click',function(){var h=document.documentElement;var d=h.classList.contains('dark');h.classList.remove('dark','light');var n=d?'light':'dark';h.classList.add(n);try{localStorage.setItem('share-theme',n);}catch(e){}u();});})();</script>`;

const shareShellHtml = (title: string, body: string, opts: { rootPath: string } = { rootPath: '../' }) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(title)}</title>
  ${THEME_BOOT_SCRIPT}
  ${FONTS_LINK}
  <link rel="stylesheet" href="${opts.rootPath}assets/style.css">
</head>
<body>${body}${THEME_TOGGLE_SCRIPT}</body>
</html>
`;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function clean() {
  for (const d of [BUILD_DIR, DIST_DIR]) {
    if (existsSync(d)) await rm(d, { recursive: true, force: true });
  }
  await mkdir(BUILD_DIR, { recursive: true });
  await mkdir(DIST_DIR, { recursive: true });
  await mkdir(join(DIST_DIR, 'assets'), { recursive: true });
}

async function bundle(): Promise<void> {
  const shareFiles = (await readdir(SHARES_DIR))
    .filter((f) => f.endsWith('.tsx'))
    .map((f) => join(SHARES_DIR, f));

  await esbuild.build({
    entryPoints: [...shareFiles, SRC_INDEX],
    bundle: true,
    format: 'esm',
    platform: 'node',
    outdir: BUILD_DIR,
    outbase: ROOT,
    jsx: 'automatic',
    target: 'node18',
    external: ['react', 'react-dom', 'react/jsx-runtime', 'react-dom/server'],
    logLevel: 'info',
  });
}

interface ShareModule {
  meta: ShareMeta;
  default: () => React.ReactElement;
}

async function renderShares(): Promise<ShareMeta[]> {
  const builtShares = await readdir(join(BUILD_DIR, 'shares'));
  const metas: ShareMeta[] = [];

  for (const file of builtShares) {
    if (!file.endsWith('.js')) continue;
    const filePath = join(BUILD_DIR, 'shares', file);
    const mod: ShareModule = await import(pathToFileURL(filePath).href);

    if (!mod.meta || !mod.default) {
      console.warn(`skip ${file}: missing meta or default export`);
      continue;
    }
    if (mod.meta.slug !== basename(file, extname(file))) {
      console.warn(
        `warn: ${file} meta.slug="${mod.meta.slug}" does not match filename`
      );
    }

    const body = renderToStaticMarkup(mod.default());
    const html = shareShellHtml(mod.meta.title, body, { rootPath: '../' });
    const outDir = join(DIST_DIR, mod.meta.slug);
    await mkdir(outDir, { recursive: true });
    await writeFile(join(outDir, 'index.html'), html);
    metas.push(mod.meta);
    console.log(`✓ ${mod.meta.slug}/`);
  }

  return metas;
}

/**
 * Search-and-filter script for the landing page. Mirrors the filter logic
 * in ~/dev/tools/index.html — the rows are server-rendered (not fetched
 * from JSON), but the input/escape keybinding + tbody hide behavior is
 * identical. `/` focuses input; `Esc` clears.
 */
const INDEX_SEARCH_SCRIPT = `<script>(function(){var input=document.getElementById('q');if(!input)return;var empty=document.querySelector('.empty');var visEl=document.querySelector('[data-visible-count]');var tbody=document.querySelector('#shares tbody');function filter(){var q=input.value.trim().toLowerCase();var rows=tbody.querySelectorAll('tr');var visible=0;rows.forEach(function(tr){if(!q){tr.classList.remove('hidden');visible++;return;}var hay=tr.getAttribute('data-search')||'';var match=hay.indexOf(q)!==-1;tr.classList.toggle('hidden',!match);if(match)visible++;});if(visEl)visEl.textContent=visible;if(empty)empty.classList.toggle('show',visible===0);}input.addEventListener('input',filter);document.addEventListener('keydown',function(e){if(e.key==='/'&&document.activeElement!==input){e.preventDefault();input.focus();}if(e.key==='Escape'&&document.activeElement===input){input.value='';filter();input.blur();}});filter();})();</script>`;

const indexShellHtml = (body: string) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>share</title>
  <meta name="description" content="Pitch decks, breakdowns, charts, and ideas formatted by Claude and delivered for one time use.">
  ${THEME_BOOT_SCRIPT}
  ${FONTS_LINK}
  <link rel="stylesheet" href="assets/style.css">
</head>
<body>${body}${THEME_TOGGLE_SCRIPT}${INDEX_SEARCH_SCRIPT}</body>
</html>
`;

async function renderIndex(shares: ShareMeta[]): Promise<void> {
  const indexModPath = join(BUILD_DIR, 'src', 'index.js');
  const mod: { default: (p: { shares: ShareMeta[] }) => React.ReactElement } =
    await import(pathToFileURL(indexModPath).href);

  const body = renderToStaticMarkup(mod.default({ shares }));
  const html = indexShellHtml(body);
  await writeFile(join(DIST_DIR, 'index.html'), html);
  console.log(`✓ index.html`);
}

function buildStyles(): void {
  const input = join(ROOT, 'src', 'styles', 'globals.css');
  const output = join(DIST_DIR, 'assets', 'style.css');
  execSync(`npx tailwindcss -i ${input} -o ${output} --minify`, {
    stdio: 'inherit',
  });
  console.log(`✓ assets/style.css`);
}

async function main(): Promise<void> {
  console.log('clean');
  await clean();

  console.log('bundle');
  await bundle();

  console.log('render shares');
  const metas = await renderShares();

  console.log('render index');
  await renderIndex(metas);

  console.log('build styles');
  buildStyles();

  console.log(`\ndone — ${metas.length} share(s) → dist/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

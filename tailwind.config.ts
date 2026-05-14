import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}', './shares/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans:  ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
        serif: ['Lora', 'ui-serif', 'Georgia', 'Cambria', '"Times New Roman"', 'serif'],
        mono:  ['"JetBrains Mono"', 'ui-monospace', 'Menlo', 'Consolas', 'monospace'],
      },
      colors: {
        bg:        'hsl(var(--bg) / <alpha-value>)',
        fg:        'hsl(var(--fg) / <alpha-value>)',
        'fg-dim':  'hsl(var(--fg-dim) / <alpha-value>)',
        muted:     'hsl(var(--muted) / <alpha-value>)',
        'muted-fg':'hsl(var(--muted-fg) / <alpha-value>)',
        border:    'hsl(var(--border) / <alpha-value>)',
        rule:      'hsl(var(--rule) / <alpha-value>)',
        accent:    'hsl(var(--accent) / <alpha-value>)',
      },
    },
  },
  plugins: [],
};

export default config;

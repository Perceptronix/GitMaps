/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        // Legacy Tailwind vars (used by SearchPanel, TrendingView, RepoDetailPanel)
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        border: 'var(--border-solid)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        // New GitMaps palette
        'gm-bg': 'var(--bg)',
        'gm-panel': 'var(--bg-panel)',
        'gm-surface': 'var(--bg-surface)',
        'gm-text': 'var(--text)',
        'gm-subtext': 'var(--subtext)',
        'gm-accent': 'var(--custom-accent)',
      },
    },
  },
  plugins: [],
}

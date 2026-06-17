import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0E0E0D',
        cream: '#F2F0EB',
        paper: '#FFFFFF',
        sage: '#A8A39A',
        'warm-gray': '#8E8980',
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'serif'],
        body: ['var(--font-inter)', 'sans-serif'],
        // 'hand' / 'brush' 保留為相容別名，現代簡約改版後分別指向襯線與無襯線
        hand: ['var(--font-playfair)', 'serif'],
        brush: ['var(--font-inter)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config

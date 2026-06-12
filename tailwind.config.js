/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,html}'],
  theme: {
    extend: {
      colors: {
        'dv-void': '#0A0A0F',
        'dv-obsidian': '#111118',
        'dv-surface': '#1A1A24',
        'dv-crimson': '#8B1A1A',
        'dv-crimson-lit': '#C0392B',
        'dv-gold': '#D4AF37',
        'dv-gold-dim': '#A08826',
        'dv-rune': '#3A3A4A',
        'dv-ash': '#9CA3AF',
        'dv-ghost': '#E8E8F0',
        'dv-fog': '#6B7280',
        'dv-faction': '#4B6FA8',
      },
      fontFamily: {
        display: ['Cinzel', 'Georgia', 'serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}

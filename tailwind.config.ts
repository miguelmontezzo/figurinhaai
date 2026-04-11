import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#0a0a1a',
          dark: '#12122a',
          card: '#1a1a35',
          border: '#2a2a50',
          gold: '#FFD700',
          'gold-dark': '#F0A500',
          cyan: '#00D4FF',
          green: '#00E676',
          purple: '#7C3AED',
          red: '#EF4444',
        },
      },
      backgroundImage: {
        'copa-gradient': 'linear-gradient(135deg, #1a0533 0%, #0a1a3a 50%, #003322 100%)',
        'card-gradient': 'linear-gradient(135deg, #1e1e40 0%, #12122a 100%)',
        'gold-gradient': 'linear-gradient(135deg, #FFD700, #F0A500)',
        'cyan-gradient': 'linear-gradient(135deg, #00D4FF, #0099CC)',
        'green-gradient': 'linear-gradient(135deg, #00E676, #00C853)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-gold': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        shimmer: 'shimmer 2s infinite',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
export default config

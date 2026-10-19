/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#050811',
          surface: '#090e1d',
          card: '#0f172a',
          border: '#1e293b',
          cyan: '#00f0ff',
          neon: '#00ff88',
          crimson: '#ff0055',
          amber: '#ffaa00',
          purple: '#a855f7',
        }
      },
      animation: {
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-sweep': 'radarSweep 4s linear infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite alternate',
      },
      keyframes: {
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        },
        glowPulse: {
          '0%': { filter: 'drop-shadow(0 0 5px rgba(0, 240, 255, 0.3))' },
          '100%': { filter: 'drop-shadow(0 0 15px rgba(0, 240, 255, 0.8))' }
        }
      }
    },
  },
  plugins: [],
}

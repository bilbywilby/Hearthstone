/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        hearthstone: {
          cream: '#F7F4EE',
          light: '#FDFCF8',
          border: '#DDD9CF',
          text: '#1A1A1A',
          muted: '#6B6560',
          light_muted: '#9C9690',
          accent: '#2d5a3d',
          error: '#DC2626',
        },
      },
      fontFamily: {
        serif: "'Palatino Linotype', Palatino, 'Book Antiqua', Georgia, serif",
        mono: "'Courier New', monospace",
      },
    },
  },
  plugins: [],
}

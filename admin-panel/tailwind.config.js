/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#32386A', hover: '#262a56' },
        accent: '#FFD152',
        'text-main': '#32386A',
        'text-muted': 'rgba(50, 56, 106, 0.7)',
        'bg-light': '#F5F5F7',
        'bg-hero': '#C6D8F2',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

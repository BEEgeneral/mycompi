/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        chat: {
          bg: '#0a0a0f',
          surface: '#12121a',
          card: '#1a1a24',
          border: '#2a2a3a',
          accent: '#6c5ce7',
          'accent-light': '#a29bfe',
          text: '#ffffff',
          secondary: '#a0a0b0',
          muted: '#606070',
          success: '#00b894',
          warning: '#fdcb6e',
          error: '#ff6b6b',
        }
      },
      fontFamily: {
        sans: ['Segoe UI', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

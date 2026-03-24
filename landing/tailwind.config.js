/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#FAFAFA',
          'bg-section': '#F7F8F9',
          border: '#E5E7EB',
          yellow: '#FFD200',
          'yellow-dark': '#F5B800',
          text: '#111111',
          secondary: '#4B5563',
          muted: '#9CA3AF',
        },
        primary: {
          DEFAULT: '#1D4ED8',
          hover: '#1E40AF',
          light: '#DBEAFE',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Unbounded', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['clamp(2.5rem,6vw,5rem)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-lg': ['clamp(2rem,4vw,3.5rem)', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        'display-md': ['clamp(1.5rem,3vw,2.25rem)', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
      },
      boxShadow: {
        sm: '0 4px 6px -1px rgba(0,0,0,0.05)',
        md: '0 10px 24px -4px rgba(0,0,0,0.08)',
        lg: '0 20px 40px -8px rgba(0,0,0,0.12)',
        card: '0 2px 8px rgba(0,0,0,0.06)',
      }
    },
  },
  plugins: [],
}

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
          DEFAULT: '#1D4ED8',    // Azul principal
          hover: '#1E40AF',       // Azul hover
          light: '#DBEAFE',        // Azul claro
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
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

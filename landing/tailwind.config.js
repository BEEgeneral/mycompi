/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          // Nueva paleta MyCompi para PYMES
          dark: '#2D3261',      // Azul principal — logo, títulos, CTAs
          pastel: '#D1E0F3',    // Azul pastel — fondos de sección hero y cards
          yellow: '#FFD154',   // Amarillo vibrante — acentos, highlights, iconos
          cream: '#FCF9F1',    // Crema — fondo general de la página
          'dark-yellow': '#E5B900', // Amarillo oscuro para hover
          text: '#2D3261',      // Texto principal
          secondary: '#4B5563', // Texto secundario
          muted: '#9CA3AF',     // Texto terciario / placeholder
        },
      },
      fontFamily: {
        sans: ['Poppins', 'Montserrat', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
        '6xl': '3rem',
        '7xl': '3.5rem',
        'pill': '9999px',
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

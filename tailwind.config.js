/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Colores principales
        'verde-principal': '#059669',
        'verde-hover': '#047857',
        'verde-light': '#ecfdf5',
        'verde-border': '#d1fae5',
        'azul': '#0369a1',

        // Brand aliases (tokens)
        brand: {
          green: '#059669',
          blue: '#0369a1',
          grayDark: '#4b5563',
        },
        
        // Grises
        'negro-principal': '#1a1a1a',
        'negro-secundario': '#111827',
        'gris-oscuro': '#374151',
        'gris-medio': '#6b7280',
        'gris-claro': '#9ca3af',
        'gris-muy-claro': '#d1d5db',
        
        // Fondos
        'fondo-claro': '#f8fafc',
        'fondo-gris': '#e2e8f0',
        'footer-dark': '#0f172a',
      },
      backgroundImage: {
        'gradiente-principal': 'linear-gradient(135deg, #059669 0%, #0369a1 100%)',
        'gradiente-boton': 'linear-gradient(135deg, #059669 0%, #047857 100%)',
        // New gradient tokens
        'grad-primary': 'linear-gradient(135deg, #059669 0%, #0369a1 100%)',
        'grad-button': 'linear-gradient(135deg, #059669 0%, #047857 100%)',
        'grad-dark': 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      boxShadow: {
        'card': '0 8px 24px rgba(2, 6, 23, 0.06)',
        'card-hover': '0 12px 28px rgba(2, 6, 23, 0.10)',
        'industrial': '0 8px 32px rgba(5, 150, 105, 0.15)',
      },
    },
  },
  plugins: [],
}

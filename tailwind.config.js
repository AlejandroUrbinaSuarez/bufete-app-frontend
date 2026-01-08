/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Colores corporativos del bufete
        primary: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#1a365d', // Color principal azul oscuro
          950: '#102a43',
        },
        gold: {
          50: '#fdfaf5',
          100: '#f9f0e3',
          200: '#f2dfc4',
          300: '#e8c99a',
          400: '#dcae6e',
          500: '#d4a574', // Dorado principal
          600: '#c08b4a',
          700: '#a0713d',
          800: '#835c37',
          900: '#6c4d31',
          950: '#3a2818',
        },
        // Colores semánticos
        success: {
          light: '#d1fae5',
          DEFAULT: '#10b981',
          dark: '#065f46',
        },
        warning: {
          light: '#fef3c7',
          DEFAULT: '#f59e0b',
          dark: '#92400e',
        },
        error: {
          light: '#fee2e2',
          DEFAULT: '#ef4444',
          dark: '#991b1b',
        },
      },
      fontFamily: {
        // Tipografía elegante para títulos
        heading: ['Playfair Display', 'Georgia', 'serif'],
        // Tipografía moderna para texto
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'elegant': '0 4px 20px -2px rgba(26, 54, 93, 0.1)',
        'card': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
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
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          DEFAULT: '#171717',
          50: '#262626',
          100: '#252525',
          900: '#171717'
        },
        graphite: '#252525',
        ivory: '#F6F3EC',
        softwhite: '#FCFBF8',
        gold: {
          DEFAULT: '#B89B5E',
          muted: '#8F7848',
          light: '#D4C49E'
        },
        slate: {
          custom: '#62666B',
          light: '#8E9299'
        },
        stone: {
          custom: '#D9D5CC',
          light: '#EBE8E1'
        },
        semantic: {
          success: '#1E4620',
          warning: '#8A5B00',
          danger: '#6B1D1D',
          info: '#1E3A5F'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

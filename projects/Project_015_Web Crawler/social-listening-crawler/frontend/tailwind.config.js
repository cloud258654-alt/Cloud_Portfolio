/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f7ff',
          100: '#ebf0ff',
          200: '#dbe3ff',
          300: '#bfcdff',
          400: '#9db1ff',
          500: '#758eff',
          600: '#4c65ff',
          700: '#3348eb',
          800: '#2738c4',
          900: '#1d2a9c',
          950: '#141c66',
        }
      }
    },
  },
  plugins: [],
}

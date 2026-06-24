/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#17202a',
        line: '#d9e2ec',
        panel: '#f7fafc',
        brand: '#2563eb'
      }
    }
  },
  plugins: []
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f5f8ff',
          100: '#e8edff',
          200: '#c9d5ff',
          300: '#a8bcff',
          400: '#7591ff',
          500: '#4a6aff',
          600: '#2f4ede',
          700: '#233aac',
          800: '#1e328a',
          900: '#19296d'
        }
      }
    }
  },
  plugins: [require('@tailwindcss/typography')],
};

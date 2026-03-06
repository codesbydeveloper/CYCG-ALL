/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html"],
  theme: {
    extend: {
      screens: {
        'view-lg': '1292px',
      },
      fontFamily: {
        kiona: ['Kiona', 'sans-serif'],
        kionasmall: ['Kiona-small', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}


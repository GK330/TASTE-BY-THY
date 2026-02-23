/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./tast-by-thy/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'marron': '#5D4037',
        'orange': '#D97706',
        'orange-doux': '#FB923C',
        'bg-soft': '#FDFBF7'
      },
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
        'fredoka': ['Fredoka', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
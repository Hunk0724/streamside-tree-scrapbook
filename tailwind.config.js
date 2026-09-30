/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        morandi: '#a3b19b',
        'morandi-dark': '#8a9982',
        milktea: '#d4b59e',
        'milktea-dark': '#b89982',
        cream: '#f9f6f0',
        ink: '#4a433d',
      },
      fontFamily: {
        handwriting: ['"Caveat"', '"LXGW WenKai TC"', 'cursive'],
      },
    },
  },
  plugins: [],
}

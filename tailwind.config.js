/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./web/react/**/*.{js,jsx}', './web/react/index.html'],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
}



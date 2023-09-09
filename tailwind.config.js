/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'img-fondo': 'url("/assets/fondoLogin.jpg")'
      },
      colors: {
        primary: '#26284a',
        secondary: '#e2e5f6',
        terciary: '#f9f9f9',
      },
    },
  },
  plugins: [],
}


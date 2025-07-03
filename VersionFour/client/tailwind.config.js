/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // This tells Tailwind to look in your src folder
    "./public/index.html",         // Include your public HTML file as well
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}


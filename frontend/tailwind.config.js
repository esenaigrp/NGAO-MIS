/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
      ngaoblue: "#1D4ED8",
      ngaolight: "#2563EB",
    },
    borderRadius: {
      '2xl': '1rem',
    },
  },
},
  plugins: [],
};
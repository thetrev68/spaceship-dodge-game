/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './js/**/*.js', // Scan JS files for Tailwind classes
    './styles/**/*.css', // Include CSS for @apply
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Match main.css font
      },
      colors: {
        cyan: '#00ffff', // Match main.css text-shadow and box-shadow
      },
    },
  },
  plugins: [],
}
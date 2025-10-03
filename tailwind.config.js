/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dnd-red': '#8B0000',
        'dnd-blue': '#1E3A8A',
        'dnd-green': '#166534',
        'dnd-gold': '#B45309',
        'dnd-purple': '#7C3AED',
        'dnd-gray': '#374151'
      },
      fontFamily: {
        'fantasy': ['Cinzel', 'serif'],
        'medieval': ['MedievalSharp', 'cursive']
      }
    },
  },
  plugins: [],
}





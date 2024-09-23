/** @type {import('tailwindcss').Config} */
export default {
  content: ['./pages/**/*.{js,jsx}',
  './components/**/*.{js,jsx}',
  './app/**/*.{js,jsx}',
  './src/**/*.{js,jsx}',],
  theme: {
    extend: {
      fontFamily: {
        prompt: ["Prompt", "sans-serif"],
      }
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        beige: '#dc5f20', // 更精準的品牌橘
      }
    }
  },
  plugins: []
}
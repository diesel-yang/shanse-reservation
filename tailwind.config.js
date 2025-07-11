/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // ✅ class 模式
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        beige: '#dc5f20' // 更精準的品牌橘
      }
    }
  },
  plugins: []
}

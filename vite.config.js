import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  base: '/', // 若為子目錄部署（如 GitHub Pages）需指定路徑
  resolve: {
    alias: {
      vue: 'vue/dist/vue.esm-bundler.js', // 注意逗號
      '@': resolve(__dirname, './src') // 正確引入 resolve
    }
  },
  optimizeDeps: {
    include: ['vue']
  },
  build: {
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        format: 'es',
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    commonjsOptions: {
      include: [/node_modules/]
    }
  }
})

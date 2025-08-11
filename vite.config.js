// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { VitePWA } from 'vite-plugin-pwa'

// 產生版本號（時間戳），用來破壞快取
const buildId = new Date().toISOString().replace(/[-:T.Z]/g, '')

export default defineConfig({
  plugins: [
    vue(),
    // ✅ 把 %BUILD_ID% 替換進 index.html
    {
      name: 'inject-build-id-into-html',
      transformIndexHtml(html) {
        return html.replaceAll('%BUILD_ID%', buildId)
      }
    },
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true /* 其餘同你現有 */
      },
      includeAssets: [
        `favicon.ico?v=${buildId}`,
        `apple-touch-icon.png?v=${buildId}`,
        `icons/icon-192.png?v=${buildId}`,
        `icons/icon-512.png?v=${buildId}`,
        `icons/maskable-512.png?v=${buildId}`
      ],
      manifest: {
        name: '山色',
        short_name: '山色',
        description: '山色餐桌預約與預先點餐',
        start_url: `/?v=${buildId}`,
        scope: '/',
        display: 'standalone',
        theme_color: '#ed8a3f',
        background_color: '#ffffff',
        icons: [
          { src: `/icons/icon-192.png?v=${buildId}`, sizes: '192x192', type: 'image/png' },
          { src: `/icons/icon-512.png?v=${buildId}`, sizes: '512x512', type: 'image/png' },
          {
            src: `/icons/maskable-512.png?v=${buildId}`,
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      devOptions: { enabled: true }
    })
  ],
  define: { __BUILD_ID__: JSON.stringify(buildId) },
  base: '/',
  resolve: {
    alias: {
      vue: 'vue/dist/vue.esm-bundler.js',
      '@': resolve(__dirname, './src')
    }
  },
  optimizeDeps: { include: ['vue'] },
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
    commonjsOptions: { include: [/node_modules/] }
  }
}) // vite.config.js

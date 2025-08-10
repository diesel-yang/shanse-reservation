// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate', // 自動更新 SW
      includeAssets: [
        'favicon.ico',
        'apple-touch-icon.png',
        'icons/icon-192.png',
        'icons/icon-512.png',
        'icons/maskable-512.png'
      ],
      manifest: {
        name: '山色 予約系統',
        short_name: '山色予約',
        description: '山色餐桌預約與預先點餐',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        theme_color: '#ed8a3f',
        background_color: '#ffffff',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/icons/maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        // 預設已幫你快取打包出的資產；這裡補動態資源策略
        runtimeCaching: [
          // 你的 GAS API（寫入 / 讀菜單都會用到）
          {
            urlPattern: ({ url }) =>
              url.origin === 'https://script.google.com' ||
              url.origin === 'https://script.googleusercontent.com',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-gas',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 }, // 1 小時
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          // 圖片（商品圖、icon 等）
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'images',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 7 } // 7 天
            }
          }
        ]
      },
      devOptions: {
        enabled: true // 開發模式也啟用，方便你本機測
      }
    })
  ],
  base: '/', // 若部署在子路徑再改
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
})

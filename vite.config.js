import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { VitePWA } from 'vite-plugin-pwa'
import { execSync } from 'child_process'

// 🔹 安全的 build id 插件（用 git commit hash）
function injectBuildId() {
  return {
    name: 'inject-build-id',
    transformIndexHtml(html) {
      let buildId = 'dev'
      try {
        buildId = execSync('git rev-parse --short HEAD').toString().trim()
      } catch (e) {
        console.warn('⚠️ 無法取得 git commit hash，改用 dev')
      }
      return html.replace(/__BUILD_ID__/g, buildId)
    }
  }
}

export default defineConfig({
  plugins: [
    vue(),
    injectBuildId(), // 放在 PWA 前面
    VitePWA({
      registerType: 'autoUpdate',
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
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.origin === 'https://script.google.com' ||
              url.origin === 'https://script.googleusercontent.com',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-gas',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'images',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 7 }
            }
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ],
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
})

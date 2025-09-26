import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { execSync } from 'child_process'
import { fileURLToPath, URL } from 'node:url'
import fs from 'fs'
import path from 'path'

// 🔹 建置版號（git commit 短哈希）
function injectBuildId() {
  return {
    name: 'inject-build-id',
    transformIndexHtml(html) {
      let buildId = 'dev'
      try {
        buildId = execSync('git rev-parse --short HEAD').toString().trim()
      } catch {
        console.warn('⚠️ 無法取得 git commit hash，改用 dev')
      }
      return html.replace(/__BUILD_ID__/g, buildId)
    }
  }
}

// 🟧 自動檢查 manifest 是否輸出
function checkManifest() {
  return {
    name: 'check-manifest',
    closeBundle() {
      const manifestPath = path.resolve(__dirname, 'dist/manifest.webmanifest')
      if (fs.existsSync(manifestPath)) {
        console.log('✅ PWA manifest 已生成:', manifestPath)
      } else {
        console.warn('⚠️ 沒找到 manifest.webmanifest，請檢查 VitePWA 設定')
      }
    }
  }
}

export default defineConfig({
  plugins: [
    vue(),
    injectBuildId(),
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
      devOptions: { enabled: true }
    }),
    checkManifest() // ✅ build 完檢查 manifest
  ],
  base: '/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      vue: 'vue/dist/vue.esm-bundler.js'
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

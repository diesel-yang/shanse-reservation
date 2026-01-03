import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { execSync } from 'child_process'
import { fileURLToPath, URL } from 'node:url'
import fs from 'fs'
import path from 'path'

/* --------------------------------------------------
 * Build ID
 * -------------------------------------------------- */
function injectBuildId() {
  return {
    name: 'inject-build-id',
    transformIndexHtml(html) {
      let buildId = 'dev'
      try {
        buildId = execSync('git rev-parse --short HEAD').toString().trim()
      } catch {
        console.warn('⚠️ 無法取得 git commit hash，使用 dev')
      }
      return html.replace(/__BUILD_ID__/g, buildId)
    }
  }
}

/* --------------------------------------------------
 * Manifest Check
 * -------------------------------------------------- */
function checkManifest() {
  return {
    name: 'check-manifest',
    closeBundle() {
      const manifestPath = path.resolve(__dirname, 'dist/manifest.webmanifest')
      if (fs.existsSync(manifestPath)) {
        console.log('✅ PWA manifest 已生成:', manifestPath)
      } else {
        console.warn('⚠️ 未產生 manifest.webmanifest')
      }
    }
  }
}

/* --------------------------------------------------
 * Vite Config
 * -------------------------------------------------- */
export default defineConfig({
  plugins: [
    vue(),
    injectBuildId(),
    VitePWA({
      registerType: 'autoUpdate',
      manifestFilename: 'manifest.webmanifest',
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
      devOptions: { enabled: true }
    }),
    checkManifest()
  ],

  /* --------------------------------------------------
   * 🔑 關鍵修正：API Proxy
   * -------------------------------------------------- */
  server: {
    proxy: {
      /**
       * 所有 /api 開頭 → 轉給後端（Node / Cloud Run）
       * ❗這一段是你「slot 回 HTML」的根本解法
       */
      '/api': {
        target: 'http://localhost:8080', // ← 你的後端 API server
        changeOrigin: true,
        secure: false,
        rewrite: path => path.replace(/^\/api/, '/api')
      }
    }
  },

  /* --------------------------------------------------
   * Alias
   * -------------------------------------------------- */
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      vue: 'vue/dist/vue.esm-bundler.js'
    }
  },

  optimizeDeps: {
    include: ['vue', 'axios']
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
    }
  }
})

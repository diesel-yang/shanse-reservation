import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './index.css'

// 只有在安裝了 vite-plugin-pwa 時才需要
import { registerSW } from 'virtual:pwa-register'

// 由外掛產生並自動更新（你在 vite.config.js 已設 registerType: 'autoUpdate'）
const updateSW = registerSW({
  immediate: true, // 首次就註冊
  onNeedRefresh() {
    // 有新版：最省心做法，直接套用新版
    updateSW(true)
    // 若想要彈出提示再更新，可把上行註解，改為顯示自訂對話框
  },
  onOfflineReady() {
    // 可顯示「離線可用」提示；不需要也可空著
    console.log('✅ Offline ready')
  }
})

createApp(App).use(router).mount('#app')

// ❌ 刪掉這段；使用 vite-plugin-pwa 不需要手動註冊
// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker.register('/sw.js').catch(console.error)
//   })
// }

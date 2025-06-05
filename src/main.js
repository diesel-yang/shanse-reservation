import { createApp } from 'vue'
import App from './App.vue'
import router from './routes'   // ✅ 正確路徑
import './index.css'            // ✅ TailwindCSS 樣式

createApp(App).use(router).mount('#app')
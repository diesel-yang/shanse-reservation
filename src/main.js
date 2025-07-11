import { createApp } from 'vue'
import App from './App.vue'
import router from './routes' // ✅ 正確路徑
import './index.css' // ✅ TailwindCSS 樣式
import 'flatpickr/dist/flatpickr.min.css' // ✅ 加入這一行引入 flatpickr 的 CSS
const app = createApp(App)
app.use(router)
app.mount('#app')

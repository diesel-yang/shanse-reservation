import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import './index.css' // Tailwind 或全域樣式

createApp(App).use(router).mount('#app')

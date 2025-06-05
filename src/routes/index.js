import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import Menu from '../pages/Menu.vue'
import Reserve from '../pages/Reserve.vue'
import Faq from '../pages/Faq.vue'
import About from '../pages/About.vue' // 如果你有這個頁面

const routes = [
  { path: '/', component: Home },
  { path: '/menu', component: Menu },
  { path: '/reserve', component: Reserve },
  { path: '/faq', component: Faq },
  { path: '/about', component: About }  // ✅ 確保在陣列內
] // ✅ 確保這個陣列有完整結尾

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

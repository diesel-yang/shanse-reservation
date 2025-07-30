import { createRouter, createWebHistory } from 'vue-router'

// 靜態匯入頁面元件
import Home from '@/pages/Home.vue'
import About from '@/pages/About.vue'
import Reserve from '@/pages/Reserve.vue'
import Menu from '@/pages/Menu.vue'
import Faq from '@/pages/Faq.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/about', name: 'About', component: About },
  { path: '/reserve', name: 'Reserve', component: Reserve },
  { path: '/menu', name: 'Menu', component: Menu },
  { path: '/faq', name: 'Faq', component: Faq },
  { path: '/:catchAll(.*)', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router

import { createRouter, createWebHistory } from 'vue-router'

// 靜態匯入頁面元件
import Home from '@/pages/Home.vue'
import Menu from '@/pages/Menu.vue'
import Reserve from '@/pages/Reserve.vue'
import Faq from '@/pages/Faq.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/menu',
    name: 'Menu',
    component: Menu
  },
  {
    path: '/reserve',
    name: 'Reserve',
    component: Reserve
  },
  {
    path: '/faq',
    name: 'Faq',
    component: Faq
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router

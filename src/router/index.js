// src/index.js
import { createRouter, createWebHistory } from 'vue-router'

import Home from '@/pages/Home.vue'
import About from '@/pages/About.vue'
import Reserve from '@/pages/Reserve.vue'
import Menu from '@/pages/Menu.vue'
import Notice from '@/pages/Notice.vue'
import Retail from '@/pages/Retail.vue'
import Cart from '@/pages/Cart.vue'
import ReturnPolicy from '@/pages/ReturnPolicy.vue'
import LinepayResult from '@/pages/LinepayResult.vue' // ✅ 新增

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/about', name: 'About', component: About },
  { path: '/menu-view', name: 'menu-view', component: () => import('@/pages/MenuView.vue') },
  { path: '/reserve', name: 'Reserve', component: Reserve },
  { path: '/menu', name: 'Menu', component: Menu },
  { path: '/notice', name: 'Notice', component: Notice },
  { path: '/retail', name: 'Retail', component: Retail },
  { path: '/cart', name: 'Cart', component: Cart },
  { path: '/return-policy', name: 'ReturnPolicy', component: ReturnPolicy },

  // 🔹 LINE Pay 付款完成回來看的結果頁
  { path: '/linepay-result', name: 'LinepayResult', component: LinepayResult },

  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router
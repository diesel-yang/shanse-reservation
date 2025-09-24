// src/index.js
import { createRouter, createWebHistory } from 'vue-router'

import Home from '@/pages/Home.vue'
import About from '@/pages/About.vue'
import Reserve from '@/pages/Reserve.vue'
import Menu from '@/pages/Menu.vue'
import Notice from '@/pages/Notice.vue'
import Retail from '@/pages/Retail.vue'
import Cart from '@/pages/Cart.vue' // 🟧 新增：購物車頁
import ReturnPolicy from '@/pages/ReturnPolicy.vue' // 🟧 新增：退換貨政策頁

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/about', name: 'About', component: About },
  { path: '/reserve', name: 'Reserve', component: Reserve },
  { path: '/menu', name: 'Menu', component: Menu },
  { path: '/notice', name: 'Notice', component: Notice },
  { path: '/retail', name: 'Retail', component: Retail },
  { path: '/cart', name: 'Cart', component: Cart }, // 🟧 新增
  { path: '/return-policy', name: 'ReturnPolicy', component: ReturnPolicy }, // 🟧 新增
  { path: '/:pathMatch(.*)*', redirect: '/' } // 官方推薦寫法，放最後
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router


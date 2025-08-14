import { createRouter, createWebHistory } from 'vue-router'

import Home from '@/pages/Home.vue'
import About from '@/pages/About.vue'
import Reserve from '@/pages/Reserve.vue'
import Menu from '@/pages/Menu.vue'
import Notice from '@/pages/Notice.vue'
import Retail from '@/pages/Retail.vue' // ← 確定有這個檔案；若沒有就刪掉這行與下方路由

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/about', name: 'About', component: About },
  { path: '/reserve', name: 'Reserve', component: Reserve },
  { path: '/menu', name: 'Menu', component: Menu },
  { path: '/notice', name: 'Notice', component: Notice },
  { path: '/retail', name: 'Retail', component: Retail },
  { path: '/:pathMatch(.*)*', redirect: '/' } // ← 官方推薦寫法，放最後
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router

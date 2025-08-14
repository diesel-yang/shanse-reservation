import { createRouter, createWebHistory } from 'vue-router'

// 靜態匯入頁面元件
import Home from '@/pages/Home.vue'
import About from '@/pages/About.vue'
import Reserve from '@/pages/Reserve.vue'
import Menu from '@/pages/Menu.vue'
import Notice from '@/pages/Notice.vue' // ⬅️ 新增
// 新增：
import Retail from '@/pages/Retail.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/about', name: 'About', component: About },
  { path: '/reserve', name: 'Reserve', component: Reserve },
  { path: '/menu', name: 'Menu', component: Menu },
  // ⬇️ 新的名稱與路徑
  { path: '/notice', name: 'Notice', component: Notice },
  { path: '/retail', name: 'Retail', component: Retail },
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

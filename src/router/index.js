// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { adminRoutes } from '@/admin/adminRouter'
import { useAdminAuth } from '@/admin/composables/useAdminAuth'

/* --------------------------
 * 前台頁面匯入（必須存在）
 * -------------------------- */
import Home from '@/pages/Home.vue'
import About from '@/pages/About.vue'
import Reserve from '@/pages/Reserve.vue'
import Menu from '@/pages/Menu.vue'
import Notice from '@/pages/Notice.vue'
import Retail from '@/pages/Retail.vue'
import Cart from '@/pages/Cart.vue'
import ReturnPolicy from '@/pages/ReturnPolicy.vue'
import LinepayResult from '@/pages/LinepayResult.vue'

/* --------------------------
 * 前台 Routes
 * -------------------------- */
const frontendRoutes = [
  { path: '/', component: Home },
  { path: '/about', component: About },
  { path: '/reserve', component: Reserve },
  { path: '/menu', component: Menu },
  { path: '/notice', component: Notice },
  { path: '/retail', component: Retail },
  { path: '/cart', component: Cart },
  { path: '/return-policy', component: ReturnPolicy },
  { path: '/menu-view', component: () => import('@/pages/MenuView.vue') },

  // Line Pay
  { path: '/linepay-result', component: LinepayResult },
  { path: '/linepay-cancel', component: () => import('@/pages/LinepayCancel.vue') },

  // 404 fallback
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

/* --------------------------
 * 合併前台 + 後台路由
 * -------------------------- */
const router = createRouter({
  history: createWebHistory(),
  routes: [...frontendRoutes, ...adminRoutes]
})

/* --------------------------
 * 後台登入驗證
 * -------------------------- */
router.beforeEach((to, from, next) => {
  const { ensureAdminLoggedIn } = useAdminAuth()

  if (to.meta.requiresAdmin) {
    const r = ensureAdminLoggedIn(router, to)
    if (r !== undefined) return // 被導向到 login
  }

  next()
})

export default router

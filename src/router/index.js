// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { adminRoutes } from '@/admin/adminRouter'
import { useAdminAuth } from '@/admin/composables/useAdminAuth'

/* =========================================================
 * 前台頁面（必須存在）
 * ========================================================= */
import Home from '@/pages/Home.vue'
import About from '@/pages/About.vue'
import Reserve from '@/pages/Reserve.vue'
import Menu from '@/pages/Menu.vue'
import Notice from '@/pages/Notice.vue'
import Retail from '@/pages/Retail.vue'
import Cart from '@/pages/Cart.vue'
import ReturnPolicy from '@/pages/ReturnPolicy.vue'
import LinepayResult from '@/pages/LinepayResult.vue'

/* =========================================================
 * 前台 Routes
 * ========================================================= */
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
  {
    path: '/booking/restaurant',
    component: () => import('@/pages/booking/RestaurantPage.vue')
  },
  {
    path: '/booking/select',
    component: () => import('@/pages/booking/SelectSlotPage.vue')
  },
  {
    path: '/booking/contact',
    component: () => import('@/pages/booking/ContactFormPage.vue')
  },
  {
    path: '/booking/payment',
    component: () => import('@/pages/booking/PaymentPage.vue')
  },

  // Line Pay
  { path: '/linepay-result', component: LinepayResult },
  { path: '/linepay-cancel', component: () => import('@/pages/LinepayCancel.vue') }
]

/* =========================================================
 * 建立 Router（前台 + 後台）
 * ========================================================= */
const router = createRouter({
  history: createWebHistory(),
  routes: [
    ...frontendRoutes,
    ...adminRoutes,

    // 404 fallback（一定放最後）
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
})

/* =========================================================
 * Admin Guard（唯一入口）
 * ========================================================= */
router.beforeEach((to, from, next) => {
  const { isAdmin, ensureAdminLoggedIn } = useAdminAuth()

  // 只有標記 requiresAdmin 才進行檢查
  if (to.meta?.requiresAdmin) {
    /**
     * ensureAdminLoggedIn 的責任：
     * - 已登入：admin → return true
     * - 未登入 → redirect /admin/login 並 return false
     */
    const ok = ensureAdminLoggedIn(to)

    if (!ok) {
      return next({ path: '/admin/login', query: { redirect: to.fullPath } })
    }
  }

  next()
})

export default router

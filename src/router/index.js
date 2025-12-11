// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAdminAuth } from '@/admin/composables/useAdminAuth'

// 前台頁面
import Home from '@/pages/Home.vue'
import About from '@/pages/About.vue'
import Reserve from '@/pages/Reserve.vue'
import Menu from '@/pages/Menu.vue'
import Notice from '@/pages/Notice.vue'
import Retail from '@/pages/Retail.vue'
import Cart from '@/pages/Cart.vue'
import ReturnPolicy from '@/pages/ReturnPolicy.vue'
import LinepayResult from '@/pages/LinepayResult.vue'

// 後台 routes（import routes 陣列）
import adminRoutes from '@/admin/adminRouter'

/* -------------------------------------------
 * 前台 Routes
 * ------------------------------------------- */
const frontendRoutes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/about', name: 'About', component: About },
  { path: '/reserve', name: 'Reserve', component: Reserve },
  { path: '/menu', name: 'Menu', component: Menu },
  { path: '/notice', name: 'Notice', component: Notice },
  { path: '/retail', name: 'Retail', component: Retail },
  { path: '/cart', name: 'Cart', component: Cart },
  { path: '/return-policy', name: 'ReturnPolicy', component: ReturnPolicy },
  { path: '/menu-view', name: 'menu-view', component: () => import('@/pages/MenuView.vue') },

  // LINE Pay 結果頁
  { path: '/linepay-result', name: 'LinepayResult', component: LinepayResult },
  {
    path: '/linepay-cancel',
    name: 'LinepayCancel',
    component: () => import('@/pages/LinepayCancel.vue')
  },

  // 404 redirect
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

/* -------------------------------------------
 * 合併前台 + 後台 Routes
 * ------------------------------------------- */
const router = createRouter({
  history: createWebHistory(),
  routes: [
    ...frontendRoutes,
    ...adminRoutes // ← 正確合併後台 routes
  ]
})

/* -------------------------------------------
 * 後台登入權限保護
 * ------------------------------------------- */
router.beforeEach((to, from, next) => {
  const { isAuthed, loadFromStorage } = useAdminAuth()
  loadFromStorage()

  if (to.meta.requiresAdmin && !isAuthed.value) {
    return next({
      path: '/admin/login',
      query: { redirect: to.fullPath }
    })
  }

  next()
})

export default router

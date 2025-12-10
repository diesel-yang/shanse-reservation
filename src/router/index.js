// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

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

// 後台頁面
import AdminLogin from '@/pages/admin/AdminLogin.vue'
import AdminRetail from '@/pages/admin/AdminRetail.vue'

// Composable (JS)
import { useAdminAuth } from '@/composables/useAdminAuth'

const routes = [
  // 前台
  { path: '/', name: 'Home', component: Home },
  { path: '/about', name: 'About', component: About },
  { path: '/reserve', name: 'Reserve', component: Reserve },
  { path: '/menu', name: 'Menu', component: Menu },
  { path: '/notice', name: 'Notice', component: Notice },
  { path: '/retail', name: 'Retail', component: Retail },
  { path: '/cart', name: 'Cart', component: Cart },
  { path: '/return-policy', name: 'ReturnPolicy', component: ReturnPolicy },
  { path: '/menu-view', name: 'menu-view', component: () => import('@/pages/MenuView.vue') },

  // 🔹 LINE Pay 結果頁
  { path: '/linepay-result', name: 'LinepayResult', component: LinepayResult },

  {
    path: '/linepay-cancel',
    name: 'LinepayCancel',
    component: () => import('@/pages/LinepayCancel.vue')
  },

  // 後台登入
  { path: '/admin/login', name: 'AdminLogin', component: AdminLogin },

  // 後台（需身分驗證）
  {
    path: '/admin/retail',
    name: 'AdminRetail',
    component: AdminRetail,
    meta: { requiresAdmin: true }
  },

  // 404 redirect
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

/** ===============================
 *  🔐 Router Admin 權限保護（JS 版）
 * =============================== */
router.beforeEach((to, from, next) => {
  const { isAuthed, loadFromStorage } = useAdminAuth()

  // 每次切換頁面，先試著載入 localStorage
  loadFromStorage()

  // 若此頁面需要 Admin 身分
  if (to.meta.requiresAdmin) {
    if (!isAuthed.value) {
      return next({
        path: '/admin/login',
        query: { redirect: to.fullPath }
      })
    }
  }

  next()
})

export default router

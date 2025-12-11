import { createRouter, createWebHistory } from 'vue-router'
import { adminRoutes } from '@/admin/adminRouter'
import { useAdminAuth } from '@/admin/composables/useAdminAuth'

// 前台 routes
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

  { path: '/linepay-result', component: LinepayResult },
  { path: '/linepay-cancel', component: () => import('@/pages/LinepayCancel.vue') },

  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes: [...frontendRoutes, ...adminRoutes]
})

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

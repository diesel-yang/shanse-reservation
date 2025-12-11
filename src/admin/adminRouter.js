// src/admin/router.js
import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from './AdminLayout.vue'
import AdminLogin from './AdminLogin.vue'
import AdminRetail from './AdminRetail.vue'
import AdminBookings from './AdminBookings.vue'
import AdminPreorders from './AdminPreorders.vue'
import AdminDashboard from './AdminDashboard.vue'
import { useAdminAuth } from './composables/useAdminAuth'

const routes = [
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: AdminLogin
  },

  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAdmin: true },
    children: [
      { path: '', name: 'AdminDashboard', component: AdminDashboard },
      { path: 'dashboard', name: 'Dashboard', component: AdminDashboard },
      { path: 'retail', name: 'AdminRetail', component: AdminRetail },
      { path: 'bookings', name: 'AdminBookings', component: AdminBookings },
      { path: 'preorders', name: 'AdminPreorders', component: AdminPreorders }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 🔐 後台 Router Guard
router.beforeEach((to, from, next) => {
  const { isAuthed, ensureAdminLoggedIn } = useAdminAuth()

  if (to.meta.requiresAdmin && !isAuthed.value) {
    return next({
      path: '/admin/login',
      query: { redirect: to.fullPath }
    })
  }

  next()
})

export default router

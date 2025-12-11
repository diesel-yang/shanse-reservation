// src/admin/adminRouter.js

import AdminLayout from '@/admin/AdminLayout.vue'
import AdminLogin from '@/admin/AdminLogin.vue'
import AdminRetail from '@/admin/AdminRetail.vue'
import AdminBookings from '@/admin/AdminBookings.vue'
import AdminPreorders from '@/admin/AdminPreorders.vue'
import AdminDashboard from '@/admin/AdminDashboard.vue'

export const adminRoutes = [
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: AdminLogin // ← 這裡一定要成功 import！
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAdmin: true },
    children: [
      { path: '', name: 'AdminDashboard', component: AdminDashboard },
      { path: 'dashboard', component: AdminDashboard },
      { path: 'retail', component: AdminRetail },
      { path: 'bookings', component: AdminBookings },
      { path: 'preorders', component: AdminPreorders }
    ]
  }
]

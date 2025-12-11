// src/admin/adminRouter.js
import AdminLayout from './AdminLayout.vue'
import AdminLogin from './AdminLogin.vue'
import AdminRetail from './AdminRetail.vue'
import AdminBookings from './AdminBookings.vue'
import AdminPreorders from './AdminPreorders.vue'
import AdminDashboard from './AdminDashboard.vue'

export const adminRoutes = [
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

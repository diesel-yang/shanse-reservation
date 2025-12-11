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
      { path: 'dashboard', component: AdminDashboard },
      { path: 'retail', component: AdminRetail },
      { path: 'bookings', component: AdminBookings },
      { path: 'preorders', component: AdminPreorders }
    ]
  }
]

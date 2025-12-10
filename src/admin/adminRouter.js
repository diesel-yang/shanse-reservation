// src/admin/router.js
import AdminLogin from '@/admin/AdminLogin.vue'
import AdminHome from '@/admin/AdminHome.vue'
import AdminRefundList from '@/admin/AdminRefundList.vue'
import AdminBookings from '@/admin/AdminBookings.vue'
import { useAdminAuth } from '@/admin/composables/useAdminAuth'

export default {
  path: '/admin',
  children: [
    { path: 'login', name: 'AdminLogin', component: AdminLogin },

    {
      path: '',
      name: 'AdminHome',
      component: AdminHome,
      beforeEnter: () => {
        const { isAuthed } = useAdminAuth()
        return isAuthed.value ? true : '/admin/login'
      }
    },

    {
      path: 'refund-list',
      name: 'AdminRefundList',
      component: AdminRefundList,
      beforeEnter: () => {
        const { isAuthed } = useAdminAuth()
        return isAuthed.value ? true : '/admin/login'
      }
    },

    {
      path: 'bookings',
      name: 'AdminBookings',
      component: AdminBookings,
      beforeEnter: () => {
        const { isAuthed } = useAdminAuth()
        return isAuthed.value ? true : '/admin/login'
      }
    }
  ]
}

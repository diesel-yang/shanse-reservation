<!-- src/admin/components/AdminNav.vue -->
<script setup>
import { useRouter } from 'vue-router'
import { useAdminAuth } from '../composables/useAdminAuth'

const router = useRouter()
const { logout, adminUser } = useAdminAuth()

function doLogout() {
  logout()
  router.replace('/admin/login')
}
</script>

<template>
  <nav class="bg-white shadow h-screen p-4 flex flex-col">
    <h2 class="text-xl font-semibold mb-6">山色後台</h2>

    <ul class="flex-1 space-y-3">
      <li><router-link to="/admin/dashboard" class="nav">Dashboard</router-link></li>
      <li><router-link to="/admin/retail" class="nav">零售訂單</router-link></li>
      <li><router-link to="/admin/bookings" class="nav">訂位管理</router-link></li>
      <li><router-link to="/admin/preorders" class="nav">預先點餐</router-link></li>
    </ul>

    <div class="mt-auto">
      <div class="text-sm text-gray-500 mb-2">
        {{ adminUser?.name }}
      </div>

      <button
        @click="doLogout"
        class="w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
      >
        登出
      </button>
    </div>
  </nav>
</template>

<style>
.nav {
  display: block;
  padding: 8px 12px;
  border-radius: 6px;
}
.nav.router-link-active {
  background: #4f46e5;
  color: white;
}
</style>

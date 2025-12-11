<!-- src/admin/components/AdminNav.vue -->
<script setup>
import { useRouter, useRoute } from 'vue-router'
import { useAdminAuth } from '../composables/useAdminAuth'
import { ref, computed } from 'vue'

const router = useRouter()
const route = useRoute()
const { logout, adminUser } = useAdminAuth()

// 手機折疊側欄
const isOpen = ref(true)

function doLogout() {
  logout()
  router.replace('/admin/login')
}

// 判斷目前 active 選單
function isActive(path) {
  return route.path.startsWith(path)
}
</script>

<template>
  <!-- 背景遮罩（手機版） -->
  <div v-if="!isOpen" class="fixed inset-0 bg-black/40 z-30 md:hidden" @click="isOpen = true"></div>

  <!-- 側欄 -->
  <aside
    class="fixed md:relative z-40 bg-white/70 backdrop-blur-xl shadow-xl h-screen w-64 p-5 flex flex-col border-r border-gray-200 transition-transform duration-300"
    :class="{
      '-translate-x-full': !isOpen,
      'translate-x-0': isOpen
    }"
  >
    <h2 class="text-2xl font-bold mb-6 tracking-wide">山色後台</h2>

    <!-- Menu -->
    <ul class="flex-1 space-y-2">
      <li>
        <router-link
          to="/admin/dashboard"
          class="nav-item"
          :class="{ active: isActive('/admin/dashboard') || isActive('/admin') }"
        >
          Dashboard
        </router-link>
      </li>

      <li>
        <router-link
          to="/admin/retail"
          class="nav-item"
          :class="{ active: isActive('/admin/retail') }"
        >
          零售訂單
        </router-link>
      </li>

      <li>
        <router-link
          to="/admin/bookings"
          class="nav-item"
          :class="{ active: isActive('/admin/bookings') }"
        >
          訂位管理
        </router-link>
      </li>

      <li>
        <router-link
          to="/admin/preorders"
          class="nav-item"
          :class="{ active: isActive('/admin/preorders') }"
        >
          預先點餐
        </router-link>
      </li>
    </ul>

    <!-- User info -->
    <div class="pt-4 border-t border-gray-300">
      <div class="flex items-center space-x-3 mb-3">
        <img
          v-if="adminUser?.picture"
          :src="adminUser.picture"
          class="w-10 h-10 rounded-full shadow"
        />
        <div class="text-sm text-gray-700 font-medium">
          {{ adminUser?.name || 'Admin' }}
        </div>
      </div>

      <button
        @click="doLogout"
        class="w-full py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 font-semibold"
      >
        登出
      </button>
    </div>
  </aside>

  <!-- 手機版 Toggle 按鈕 -->
  <button
    class="md:hidden fixed top-4 left-4 z-50 bg-white/80 backdrop-blur-lg shadow-lg p-2 rounded-xl border border-gray-300"
    @click="isOpen = !isOpen"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-6 w-6 text-gray-800"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  </button>
</template>

<style scoped>
.nav-item {
  display: block;
  padding: 10px 14px;
  border-radius: 8px;
  font-weight: 500;
  color: #444;
  background: transparent;
  transition: 0.2s;
}

.nav-item:hover {
  background: rgba(79, 70, 229, 0.08);
}

.nav-item.active {
  background: #4f46e5;
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.35);
}
</style>

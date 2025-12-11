<!-- src/admin/AdminLayout.vue -->
<script setup>
import AdminNav from './components/AdminNav.vue'
</script>

<template>
  <div class="flex min-h-screen bg-gray-100">
    <!-- 左側選單 -->
    <AdminNav class="w-64" />

    <!-- 右側內容區域 -->
    <main class="flex-1 p-6">
      <router-view />
    </main>
  </div>
</template>

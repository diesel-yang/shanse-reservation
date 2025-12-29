<script setup>
import AdminNav from '@/admin/components/AdminNav.vue'
</script>

<template>
  <div class="min-h-screen flex bg-gray-100">
    <!-- Sidebar -->
    <aside class="w-56 bg-black text-white">
      <AdminNav />
    </aside>

    <!-- Main -->
    <main class="flex-1 p-6">
      <router-view />
    </main>
  </div>
</template>

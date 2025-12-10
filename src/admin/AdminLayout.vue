<template>
  <div class="admin-layout">
    <AdminNav />

    <div class="admin-content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import AdminNav from './components/AdminNav.vue'
</script>

<style>
.admin-layout {
  display: flex;
}
.admin-content {
  flex: 1;
  padding: 20px;
}
</style>

<!-- src/admin/components/AdminNav.vue -->
<template>
  <nav class="bg-gray-900 text-white px-4 py-3 flex gap-4">
    <router-link to="/admin/dashboard">Dashboard</router-link>
    <router-link to="/admin/retail">Retail</router-link>
    <router-link to="/admin/bookings">Bookings</router-link>
    <router-link to="/admin/preorders">Preorders</router-link>
  </nav>
</template>

<style scoped>
a {
  opacity: 0.8;
}
a.router-link-active {
  opacity: 1;
  font-weight: bold;
}
</style>

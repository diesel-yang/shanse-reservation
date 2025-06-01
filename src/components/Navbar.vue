<template>
  <nav class="bg-orange-500 text-white p-4 shadow-md sticky top-0 z-50">
    <div class="container mx-auto flex justify-between items-center">
      <router-link to="/" class="text-xl font-bold hover:text-yellow-100">山色</router-link>
      <div class="space-x-4 text-sm md:text-base">
        <router-link to="/" class="hover:underline">首頁</router-link>
        <router-link to="/reserve" class="hover:underline">餐桌予約</router-link>
        <router-link to="/menu" class="hover:underline">預先點餐</router-link>
        <router-link to="/faq" class="hover:underline">訂位問題</router-link>
      </div>
    </div>
  </nav>
</template>

<script setup>
</script>

<style scoped>
nav a.router-link-exact-active {
  text-decoration: underline;
  font-weight: bold;
}
</style>
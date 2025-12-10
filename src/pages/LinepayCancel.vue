<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// ⭐ 2 秒後自動返回 /retail
onMounted(() => {
  setTimeout(() => {
    router.replace('/retail')
  }, 2000)
})
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-gray-50">

    <div class="bg-white shadow-md rounded-xl p-8 w-full max-w-md text-center">

      <div class="text-red-500 text-4xl mb-4">
        ✖
      </div>

      <h1 class="text-2xl font-semibold mb-2">
        付款已取消
      </h1>

      <p class="text-gray-600 mb-4 leading-relaxed">
        您已取消此次 LINE Pay 付款，訂單尚未成立。
      </p>

      <p class="text-gray-400 text-sm mb-6">
        將於 2 秒後返回購物頁面…
      </p>

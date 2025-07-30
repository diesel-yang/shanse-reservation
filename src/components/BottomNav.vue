<template>
  <nav
    class="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-md bg-white shadow-lg rounded-full px-3 py-2 flex justify-around items-center"
  >
    <RouterLink
      to="/"
      class="group flex flex-col items-center text-gray-500 hover:text-orange-500 transition"
    >
      <HomeIcon class="w-6 h-6" />
      <span class="text-[10px] mt-0.5 opacity-0 group-hover:opacity-100 transition">首頁</span>
    </RouterLink>

    <RouterLink
      to="/about"
      class="group flex flex-col items-center text-gray-500 hover:text-orange-500 transition"
    >
      <UserIcon class="w-6 h-6" />
      <span class="text-[10px] mt-0.5 opacity-0 group-hover:opacity-100 transition">關於我們</span>
    </RouterLink>

    <a
      href="https://instantfood.store/collections/%E9%A4%90%E6%A1%8C%E4%BA%88%E7%B4%84" target="_blank" rel="noopener noreferrer"
      class="group flex flex-col items-center text-gray-500 hover:text-orange-500 transition"
    >
      <BookOpenIcon class="w-6 h-6" />
      <span class="text-[10px] mt-0.5 opacity-0 group-hover:opacity-100 transition">餐桌予約</span>
    </a>

    <RouterLink
      to="/menu"
      class="group flex flex-col items-center text-gray-500 hover:text-orange-500 transition"
    >
      <ClipboardDocumentListIcon class="w-6 h-6" />
      <span class="text-[10px] mt-0.5 opacity-0 group-hover:opacity-100 transition">預先點餐</span>
    </RouterLink>

    <RouterLink
      to="/faq"
      class="group flex flex-col items-center text-gray-500 hover:text-orange-500 transition"
    >
      <QuestionMarkCircleIcon class="w-6 h-6" />
      <span class="text-[10px] mt-0.5 opacity-0 group-hover:opacity-100 transition">訂位問題</span>
    </RouterLink>
  </nav>
</template>

<script setup>
import {
  HomeIcon,
  UserIcon,
  BookOpenIcon,
  ClipboardDocumentListIcon,
  QuestionMarkCircleIcon
} from '@heroicons/vue/24/outline'
import { RouterLink } from 'vue-router'
</script>

<style scoped>
nav {
  backdrop-filter: blur(8px);
}
</style>
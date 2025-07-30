<template>
  <nav class="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 shadow-md z-50 md:hidden">
    <ul class="flex justify-around items-center h-16 text-xs text-gray-600">
      <li>
        <RouterLink to="/" class="flex flex-col items-center">
          <HomeIcon class="w-6 h-6" />
          首頁
        </RouterLink>
      </li>
      <li>
        <RouterLink to="/about" class="flex flex-col items-center">
          <UserCircleIcon class="w-6 h-6" />
          關於我們
        </RouterLink>
      </li>
      <li>
        <RouterLink to="/reserve" class="flex flex-col items-center">
          <CalendarIcon class="w-6 h-6" />
          餐桌予約
        </RouterLink>
      </li>
      <li>
        <RouterLink to="/menu" class="flex flex-col items-center">
          <DocumentTextIcon class="w-6 h-6" />
          預先點餐
        </RouterLink>
      </li>
      <li>
        <RouterLink to="/faq" class="flex flex-col items-center">
          <QuestionMarkCircleIcon class="w-6 h-6" />
          訂位問題
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import {
  HomeIcon,
  DocumentTextIcon, // ✅ 使用正確存在的 icon
  CalendarIcon,
  QuestionMarkCircleIcon,
  UserCircleIcon
} from '@heroicons/vue/24/solid'
</script>

<style scoped>
nav ul li .router-link-active {
  color: #f97316; /* Tailwind 橘色 */
}
</style>
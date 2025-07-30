<template>
  <nav class="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white border border-gray-200 shadow-xl rounded-full px-4 py-1 flex justify-around items-center z-50">
    <div v-for="item in navItems" :key="item.name" class="relative group">
      <RouterLink
        v-if="!item.external"
        :to="item.to"
        class="flex flex-col items-center text-gray-600 hover:text-orange-500 transition"
      >
        <component :is="item.icon" class="w-6 h-6" />
        <span class="text-xs opacity-0 group-hover:opacity-100 mt-1 transition duration-300">{{ item.label }}</span>
      </RouterLink>

      <a
        v-else
        :href="item.to"
        class="flex flex-col items-center text-gray-600 hover:text-orange-500 transition"
        target="_blank"
        rel="noopener noreferrer"
      >
        <component :is="item.icon" class="w-6 h-6" />
        <span class="text-xs opacity-0 group-hover:opacity-100 mt-1 transition duration-300">{{ item.label }}</span>
      </a>
    </div>
  </nav>
</template>

<script setup>
import {
  HomeIcon,
  UserIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  QuestionMarkCircleIcon
} from '@heroicons/vue/24/outline'

const navItems = [
  { name: 'home', label: '首頁', to: '/', icon: HomeIcon, external: false },
  { name: 'about', label: '關於我們', to: '/about', icon: UserIcon, external: false },
  {
    name: 'reserve',
    label: '餐桌予約',
    to: 'https://instantfood.store/collections/餐桌予約',
    icon: CalendarDaysIcon,
    external: true
  },
  { name: 'order', label: '預先點餐', to: '/menu', icon: BookOpenIcon, external: false },
  { name: 'faq', label: '訂位問題', to: '/faq', icon: QuestionMarkCircleIcon, external: false }
]
</script>

<style scoped>
nav {
  backdrop-filter: blur(8px);
}
</style>
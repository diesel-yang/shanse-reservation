<template>
  <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-md flex justify-around items-center h-16 z-50 md:hidden">
    <router-link
      v-for="item in items"
      :key="item.to"
      :to="item.to"
      class="flex flex-col items-center text-sm text-gray-600 hover:text-orange-500"
      :class="{ 'text-orange-500 font-semibold': $route.path === item.to }"
    >
      <component :is="item.icon" class="w-6 h-6 mb-1" />
      {{ item.label }}
    </router-link>
  </nav>
</template>

<script setup>
import {
  HomeIcon,
  ClipboardListIcon,
  CalendarIcon,
  QuestionMarkCircleIcon,
  UserCircleIcon
} from '@heroicons/vue/24/solid'

const items = [
  { label: '首頁', to: '/', icon: HomeIcon },
  { label: '點餐', to: '/menu', icon: ClipboardListIcon },
  { label: '預約', to: '/reserve', icon: CalendarIcon },
  { label: 'FAQ', to: '/faq', icon: QuestionMarkCircleIcon },
  { label: '關於', to: '/about', icon: UserCircleIcon }
]
</script>
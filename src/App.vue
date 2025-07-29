<template>
  <div v-if="!loading" class="min-h-screen bg-orange-50 text-gray-800 font-sans relative pb-20">
    <RouterView />
    <BottomNav class="md:hidden" />
   <Navbar class="hidden md:block" />

  </div>
  <div v-else class="flex items-center justify-center h-screen text-gray-500">載入中...</div>
</template>

<script setup>
import { reactive, provide, ref, onMounted } from 'vue'
import { fetchMenu, fetchHolidays } from '@/utils/dataLoaders'
import { RouterView } from 'vue-router'
import BottomNav from '@/components/BottomNav.vue' // ✅ 引入 BottomNav

const menu = reactive({ main: [], drink: [], side: [], addon: [] })
const holidays = reactive([])
const loading = ref(true)

provide('menu', menu)
provide('holidays', holidays)

onMounted(async () => {
  try {
    const menuData = await fetchMenu()
    Object.assign(menu, menuData)
    const holidayList = await fetchHolidays()
    holidays.splice(0, holidays.length, ...holidayList)
  } catch (err) {
    console.error('❌ 資料載入失敗', err)
  } finally {
    loading.value = false
  }
})
</script>
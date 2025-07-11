<template>
  <div class="min-h-screen bg-[#F28157] text-gray-900">
    <main class="flex flex-col min-h-screen">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, provide, onMounted } from 'vue'
import { fetchMenu, fetchHolidays } from '@/utils/dataLoaders'

// 建立 reactive 資料
const menu = ref({
  main: [],
  drink: [],
  side: [],
  addon: []
})
const holidays = ref([])

// 提供給全站其他元件 inject 使用
provide('menu', menu)
provide('holidays', holidays)

// 預抓資料
onMounted(async () => {
  try {
    const [menuData, holidayData] = await Promise.all([fetchMenu(), fetchHolidays()])
    menu.value = menuData
    holidays.value = holidayData
    console.log('✅ 假日與菜單資料已載入完成')
  } catch (err) {
    console.error('❌ 載入初始化資料失敗', err)
  }
})
</script>

<style>
@import 'flatpickr/dist/flatpickr.min.css';

body {
  font-family: 'DM Sans', sans-serif;
  font-size: 16px;
  line-height: 1.5;
  margin: 0;
  background-color: #fff;
  color: #333;
}

.holiday-highlight {
  color: red !important;
  font-weight: bold !important;
}
.holiday-highlight.selected,
.holiday-highlight.selected:hover {
  background: #ffe5e5 !important;
  color: red !important;
  font-weight: bold !important;
}
</style>

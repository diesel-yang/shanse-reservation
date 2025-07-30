<template>
  <div class="min-h-screen bg-orange-50 text-gray-800 font-sans">
    <RouterView />
    <BottomNav v-if="showNav" />
  </div>
</template>

<script setup>
import { reactive, provide, ref, onMounted, computed } from 'vue'
import { fetchMenu, fetchHolidays } from '@/utils/dataLoaders'
import { RouterView, useRoute } from 'vue-router'
import BottomNav from '@/components/BottomNav.vue'

const route = useRoute()

const showNav = computed(() => route.path !== '/home') // 你可改成不想顯示導覽列的頁面

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

<style scoped>
nav span {
  transform-origin: top center;
}
</style>
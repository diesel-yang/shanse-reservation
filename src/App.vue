<template>
  <RouterView />
  <FloatingNav />
</template>

<script setup>
import { reactive, provide, ref, onMounted, computed } from 'vue'
import { fetchMenu, fetchHolidays } from '@/utils/dataLoaders'
import { useRoute } from 'vue-router'
import FloatingNav from '@/components/FloatingNav.vue'

const menu = reactive({ main: [], drink: [], side: [], addon: [] })
const holidays = reactive([])
const loading = ref(true)
const route = useRoute()

provide('menu', menu)
provide('holidays', holidays)

const showNav = computed(() => route.path !== '/') // ✅ 只在非首頁時顯示

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

<template>
  <RouterView />
  <FloatingNav v-if="showNav" />
</template>

<script setup>
import { reactive, provide, ref, onMounted, computed, onBeforeUnmount } from 'vue'
import { fetchMenu, fetchHolidays, preloadAll } from '@/utils/dataLoaders'
import { useRoute } from 'vue-router'
import FloatingNav from '@/components/FloatingNav.vue'

/** 全域提供：menu / holidays */
const menu = reactive({ main: [], drink: [], side: [], addon: [] })
const holidays = reactive([])
const loading = ref(true)
const route = useRoute()

provide('menu', menu)
provide('holidays', holidays)

const showNav = computed(() => route.path !== '/') // ✅ 非首頁才顯示

/** 啟動：載入菜單 + 假日，並在背景預抓 notice / retail */
onMounted(async () => {
  try {
    const [menuData, holidayList] = await Promise.all([fetchMenu(), fetchHolidays()])
    Object.assign(menu, menuData)
    holidays.splice(0, holidays.length, ...holidayList)
  } catch (err) {
    console.error('❌ 資料載入失敗', err)
  } finally {
    loading.value = false
  }

  // ✅ 背景預抓（SWR）：notice 與 retail 會先回快取、再靜默更新
  preloadAll().catch(() => {})

  // 若你原本還有自寫的 prefetchNoticeIfStale() / visibilitychange，
  // 建議拿掉以免重覆抓取；若要保留，請擇一即可。
})

onBeforeUnmount(() => {
  // 如有額外事件監聽請在這裡移除
})
</script>

<style scoped>
nav span {
  transform-origin: top center;
}
</style>

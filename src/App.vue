<template>
  <RouterView />
  <!-- 只在非首頁顯示懸浮導覽 -->
  <FloatingNav v-if="showNav" />
</template>

<script setup>
import { reactive, provide, ref, onMounted, computed, onBeforeUnmount } from 'vue'
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

// ===== Notice 預抓（全站共用快取） =====
const NOTICE_CACHE_KEY = 'noticeCache:v1'
const STALE_MS = 6 * 60 * 60 * 1000 // 快取 6 小時視為過期

function prefetchNoticeIfStale() {
  try {
    const cached = JSON.parse(localStorage.getItem(NOTICE_CACHE_KEY) || 'null')
    const isFresh = cached && typeof cached.ts === 'number' && Date.now() - cached.ts < STALE_MS
    // 有快取而且還新鮮就不打；否則打一次更新快取（不阻擋 UI）
    if (isFresh) return
  } catch (_) {}

  // 背景抓取（SWR）
  const controller = new AbortController()
  setTimeout(() => controller.abort(), 8000) // 8 秒逾時避免卡住

  fetch(`${import.meta.env.VITE_GAS_URL}?type=notice`, {
    cache: 'no-store',
    signal: controller.signal
  })
    .then(r => r.json())
    .then(json => {
      if (Array.isArray(json?.data)) {
        localStorage.setItem(NOTICE_CACHE_KEY, JSON.stringify({ data: json.data, ts: Date.now() }))
      }
    })
    .catch(err => console.error('❌ 預抓 notice 失敗或逾時', err))
}

// 首次載入時預抓
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

  // 不阻塞 UI 的預抓
  prefetchNoticeIfStale()

  // 使用者回到頁面時（例如從背景回來）檢查是否過期→再預抓一次
  window.addEventListener('visibilitychange', onVisibility)
})

function onVisibility() {
  if (document.visibilityState === 'visible') {
    prefetchNoticeIfStale()
  }
}

onBeforeUnmount(() => {
  window.removeEventListener('visibilitychange', onVisibility)
})
</script>

<style scoped>
nav span {
  transform-origin: top center;
}
</style>

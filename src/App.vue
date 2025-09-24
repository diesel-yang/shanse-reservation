<!-- src/App.vue -->
<template>
  <!-- 需要全域 gate 的話可以改成 v-if="!loadingAll" 再渲染 RouterView -->
  <RouterView />
  <FloatingNav v-if="showNav" />
</template>

<script setup>
import { reactive, ref, computed, provide, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import FloatingNav from '@/components/FloatingNav.vue'
import { preloadAll } from '@/utils/dataLoaders'
import { gasGet } from '@/utils/gas' // 用於 notice 背景更新（SWR）
import { provideCart } from '@/composables/useCart'


/** -------- 全域狀態（provide 給頁面 inject） -------- */
const menu = reactive({ main: [], drink: [], side: [], addon: [] })
const holidays = reactive([]) // 用 splice 維持同一個 array 參考
const retail = reactive({ frozen: [], dessert: [] })
const notice = reactive([])
provideCart() // ✅ 讓整個 app 都能用


/** -------- 載入狀態（細分） -------- */
const loading = reactive({
  menu: true,
  holidays: true,
  retail: true,
  notice: true
})
// 由細分旗標自動推導整體 loading
const loadingAll = computed(
  () => loading.menu || loading.holidays || loading.retail || loading.notice
)

// 給 Retail.vue 避免「瞬間空清單」的獨立旗標
const retailLoading = ref(true)

/** -------- provide 到各頁 -------- */
provide('menu', menu)
provide('holidays', holidays)
provide('retail', retail)
provide('notice', notice)
provide('retailLoading', retailLoading)

/** -------- UI：非首頁才顯示底部導覽 -------- */
const route = useRoute()
const showNav = computed(() => route.path !== '/')

/** -------- AbortController：可中止預載 -------- */
let preloadController = null

/** -------- Notice SWR（快取過舊就背景更新） -------- */
const NOTICE_CACHE_KEY = 'noticeCache:v1'
const STALE_MS = 6 * 60 * 60 * 1000 // 6 小時
function prefetchNoticeIfStale() {
  try {
    const cached = JSON.parse(localStorage.getItem(NOTICE_CACHE_KEY) || 'null')
    const fresh = cached && typeof cached.ts === 'number' && Date.now() - cached.ts < STALE_MS
    if (fresh) return
  } catch {}

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 8000)

  gasGet({ type: 'notice' }, { signal: controller.signal })
    .then(json => {
      if (Array.isArray(json?.data)) {
        notice.splice(0, notice.length, ...json.data) // 更新全域狀態
        localStorage.setItem(NOTICE_CACHE_KEY, JSON.stringify({ data: json.data, ts: Date.now() }))
      }
    })
    .catch(err => {
      if (err?.name !== 'AbortError') console.error('❌ 預抓 notice 失敗或逾時', err)
    })
    .finally(() => clearTimeout(timeoutId))
}
function onVisibility() {
  if (document.visibilityState === 'visible') prefetchNoticeIfStale()
}

/** -------- 啟動時預載所有資料 -------- */
onMounted(async () => {
  try {
    preloadController = new AbortController()
    const { signal } = preloadController

    // ✅ 對齊 dataLoaders.js：{ menu, holidays, retail, notice }
    const { menu: m, holidays: h, retail: r, notice: n } = await preloadAll({ signal })

    // menu
    Object.assign(menu, m || { main: [], drink: [], side: [], addon: [] })
    loading.menu = false

    // holidays
    holidays.splice(0, holidays.length, ...(Array.isArray(h) ? h : []))
    loading.holidays = false

    // retail
    retail.frozen = r?.frozen || []
    retail.dessert = r?.dessert || []
    loading.retail = false
    retailLoading.value = false

    // notice
    if (Array.isArray(n)) {
      notice.splice(0, notice.length, ...n)
    } else {
      notice.splice(0, notice.length)
    }
    loading.notice = false
  } catch (err) {
    if (err?.name !== 'AbortError') console.error('❌ 預載失敗或中止：', err)

    // 安全 fallback，避免頁面卡住
    Object.assign(menu, { main: [], drink: [], side: [], addon: [] })
    holidays.splice(0, holidays.length)
    retail.frozen = []
    retail.dessert = []
    notice.splice(0, notice.length)
    loading.menu = loading.holidays = loading.retail = loading.notice = false
    retailLoading.value = false
  } finally {
    // 啟動 notice 的 SWR 預抓 & 聚焦時刷新
    prefetchNoticeIfStale()
    window.addEventListener('visibilitychange', onVisibility)
  }
})

onBeforeUnmount(() => {
  if (preloadController) {
    try {
      preloadController.abort()
    } catch {}
    preloadController = null
  }
  window.removeEventListener('visibilitychange', onVisibility)
})
</script>

<style scoped>
nav span {
  transform-origin: top center;
}
</style>

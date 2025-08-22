<template>
  <RouterView />
  <FloatingNav v-if="showNav" />
</template>

<script setup>
import { reactive, provide, ref, onMounted, computed, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import FloatingNav from '@/components/FloatingNav.vue'
import { preloadAll } from '@/utils/dataLoaders'
import { gasGet } from '@/utils/gas' // 用於 notice 背景更新（SWR）

/** -------- 全域狀態：提供給各頁面 inject 使用 -------- */
const menu = reactive({ main: [], drink: [], side: [], addon: [] })
const holidays = reactive([]) // 陣列用 reactive/splice 保持原型
const retail = reactive({ frozen: [], dessert: [] })
const notice = reactive([])

// 載入狀態（細分與總和）
const loading = reactive({
  menu: true,
  holidays: true,
  retail: true,
  notice: true,
  all: true
})

// 額外提供給零售頁用的載入旗標（避免閃出「沒有商品」）
const retailLoading = ref(true)

// ===== provide 到各頁 =====
provide('menu', menu)
provide('holidays', holidays)
provide('retail', retail)
provide('notice', notice)
provide('retailLoading', retailLoading) // 給 Retail.vue 判斷是否顯示骨架

/** -------- UI：非首頁才顯示底部導覽 -------- */
const route = useRoute()
const showNav = computed(() => route.path !== '/')

// ===== AbortController：可中止預載請求 =====
let preloadController = null

onMounted(async () => {
  try {
    preloadController = new AbortController()
    const { signal } = preloadController

    // 這裡對齊你最新版 dataLoaders：回傳 { menuData, holidayList, retailData, noticeData }
    const { menuData, holidayList, retailData, noticeData } = await preloadAll({ signal })

    // 寫入 menu
    Object.assign(menu, menuData || { main: [], drink: [], side: [], addon: [] })
    loading.menu = false

    // 寫入 holidays
    holidays.splice(0, holidays.length, ...(holidayList || []))
    loading.holidays = false

    // 寫入 retail
    retail.frozen = retailData?.frozen || []
    retail.dessert = retailData?.dessert || []
    loading.retail = false
    retailLoading.value = false

    // 寫入 notice
    if (Array.isArray(noticeData)) {
      notice.splice(0, notice.length, ...noticeData)
    } else {
      notice.splice(0, notice.length) // 清空
    }
    loading.notice = false
  } catch (err) {
    // 若被中止或失敗，填預設值並關閉 loading 旗標，避免頁面卡住
    console.error('❌ 預載失敗或中止：', err?.message || err)

    Object.assign(menu, { main: [], drink: [], side: [], addon: [] })
    holidays.splice(0, holidays.length)
    retail.frozen = []
    retail.dessert = []
    notice.splice(0, notice.length)

    loading.menu = false
    loading.holidays = false
    loading.retail = false
    loading.notice = false
    retailLoading.value = false
  } finally {
    loading.all = false
  }
})

onBeforeUnmount(() => {
  // 離開 App（或 HMR 重載）時，主動中止未完成請求，避免記憶體/網路浪費
  if (preloadController) {
    try {
      preloadController.abort()
    } catch {}
    preloadController = null
  }
})

/** -------- Notice SWR：快取過舊就背景更新 -------- */
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
        // 更新全域狀態 + 寫入快取
        notice.splice(0, notice.length, ...json.data)
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
</script>

<style scoped>
nav span {
  transform-origin: top center;
}
</style>

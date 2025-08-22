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

provide('menu', menu)
provide('holidays', holidays)
provide('retail', retail)
provide('notice', notice)

/** -------- UI：非首頁才顯示底部導覽 -------- */
const route = useRoute()
const showNav = computed(() => route.path !== '/')

/** -------- 啟動時預載所有資料（支援 AbortController） -------- */
const loading = ref(true)
let preloadController // 供卸載或切換時中止請求

onMounted(async () => {
  try {
    preloadController = new AbortController()
    const { signal } = preloadController

    const { menu: m, holidays: h, retail: r, notice: n } = await preloadAll({ signal })

    Object.assign(menu, m)
    holidays.splice(0, holidays.length, ...(Array.isArray(h) ? h : []))
    Object.assign(retail, r)
    notice.splice(0, notice.length, ...(Array.isArray(n) ? n : []))
  } catch (err) {
    if (err?.name !== 'AbortError') console.error('❌ 預載資料失敗', err)
  } finally {
    loading.value = false
  }

  // 啟動 SWR 預抓 notice（若快取過舊）
  prefetchNoticeIfStale()
  window.addEventListener('visibilitychange', onVisibility)
})

onBeforeUnmount(() => {
  try {
    preloadController?.abort()
  } catch {}
  window.removeEventListener('visibilitychange', onVisibility)
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

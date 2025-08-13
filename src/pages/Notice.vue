<template>
  <div class="min-h-screen bg-gradient-to-b from-[#dc5f20] to-[#e26a1e] flex flex-col">
    <!-- LOGO -->
    <img
      src="/hero-transparent.png"
      alt="山色主視覺"
      class="w-[140px] h-auto mt-6 mx-auto object-contain bg-transparent"
    />
    <!-- 頁面名稱 -->
    <h1 class="text-3xl sm:text-4xl font-bold text-orange-50/85 text-center tracking-widest mb-6">
      訂位及用餐須知
    </h1>

    <!-- 內容：不再有 loading gate，進頁立即渲染 -->
    <main class="w-full max-w-xl mx-auto px-4 pb-28 space-y-4">
      <!-- 有資料時顯示 Accordion -->
      <section
        v-if="hasData"
        v-for="(group, cat) in groupedItems"
        :key="cat"
        class="rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.15)] bg-white/95 backdrop-blur-sm border border-black/10 overflow-hidden"
      >
        <!-- 分類標題（置中），Chevron 在右 -->
        <button
          type="button"
          class="relative w-full flex items-center justify-center px-6 py-4"
          @click="toggleCategory(cat)"
          :aria-expanded="isOpen(cat)"
          :aria-controls="`panel-${slug(cat)}`"
        >
          <span class="text-lg sm:text-xl font-semibold text-gray-800 text-center">{{ cat }}</span>
          <svg
            class="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-700 transition-transform duration-200"
            :class="isOpen(cat) ? 'rotate-180' : ''"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>

        <!-- 條文內容：支援粗體（**粗體** 或 <b>粗體</b>）與換行 -->
        <div :id="`panel-${slug(cat)}`" v-show="isOpen(cat)" class="px-6 pb-5">
          <ul
            class="list-disc pl-5 space-y-2 leading-relaxed text-base sm:text-[17px] text-gray-800"
          >
            <li v-for="(rule, i) in group" :key="i" v-html="renderRule(rule.rule)"></li>
          </ul>
        </div>
      </section>

      <!-- 沒快取而且資料還沒回來：骨架畫面 -->
      <section
        v-else
        v-for="n in 4"
        :key="n"
        class="rounded-2xl bg-white/80 border border-black/10 overflow-hidden"
      >
        <div class="px-6 py-4 flex items-center justify-center">
          <div class="h-5 w-40 rounded animate-pulse bg-gray-300/70"></div>
        </div>
        <div class="px-6 pb-5 space-y-2">
          <div class="h-3 w-11/12 rounded animate-pulse bg-gray-200/80"></div>
          <div class="h-3 w-10/12 rounded animate-pulse bg-gray-200/80"></div>
          <div class="h-3 w-9/12 rounded animate-pulse bg-gray-200/80"></div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const items = ref([]) // [{ category, rule }, ...]
const openCategories = ref([]) // 預設閉合
const hasData = computed(() => items.value.length > 0)

// 依分類群組
const groupedItems = computed(() => {
  const acc = {}
  for (const it of items.value) {
    if (!it || !it.category) continue
    if (!acc[it.category]) acc[it.category] = []
    acc[it.category].push(it)
  }
  return acc
})

const isOpen = cat => openCategories.value.includes(cat)
const toggleCategory = cat => {
  const i = openCategories.value.indexOf(cat)
  if (i >= 0) openCategories.value.splice(i, 1)
  else openCategories.value.push(cat)
}
const slug = s =>
  String(s || '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')

/**
 * 讓條文支援粗體
 * - 允許寫法：
 *   1) **重要文字**（Markdown 風格）
 *   2) <b>重要文字</b> 或 <strong>重要文字</strong>
 * - 其他內容全部 escape，避免 XSS
 * - 換行 \n -> <br />
 */
function renderRule(input) {
  const text = String(input ?? '')

  // 先把 HTML 字元轉義（全部當純文字）
  const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  // 轉換 **粗體** 成 <b>粗體</b>
  const withMarkdownBold = escaped.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')

  // 把已被轉義的 <b> 與 <strong> 還原（只還原開/閉標籤，其他標籤不允許）
  const allowB = withMarkdownBold
    .replace(/&lt;b&gt;/g, '<b>')
    .replace(/&lt;\/b&gt;/g, '</b>')
    .replace(/&lt;strong&gt;/g, '<strong>')
    .replace(/&lt;\/strong&gt;/g, '</strong>')

  // \n 換行
  return allowB.replace(/\n/g, '<br />')
}

// —— SWR：先讀快取立即顯示，再背景更新 —— //
const CACHE_KEY = 'noticeCache:v1'

// 1) 立即讀快取（若有）
try {
  const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null')
  if (cached && Array.isArray(cached.data)) {
    items.value = cached.data
  }
} catch (e) {
  /* ignore */
}

// 2) 背景更新（含逾時，避免長時間卡住）
onMounted(async () => {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), 8000)

  try {
    const res = await fetch(`${import.meta.env.VITE_GAS_URL}?type=notice`, {
      cache: 'no-store',
      signal: controller.signal
    })
    const json = await res.json()
    if (Array.isArray(json?.data)) {
      items.value = json.data
      localStorage.setItem(CACHE_KEY, JSON.stringify({ data: json.data, ts: Date.now() }))
    }
  } catch (err) {
    console.error('❌ 取得須知失敗或逾時', err)
  } finally {
    clearTimeout(id)
  }
})
</script>

<style scoped>
@media (max-width: 640px) {
  .pb-28 {
    padding-bottom: 7rem;
  } /* 預留底部導覽列距離 */
}
</style>

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

    <!-- template 內資料區：移除 v-if loading，直接用 hasData / 骨架畫面 -->
    <main class="w-full max-w-xl mx-auto px-4 pb-28 space-y-4">
      <!-- 有資料：正常 Accordion -->
      <section
        v-if="hasData"
        v-for="(group, cat) in groupedItems"
        :key="cat"
        class="rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.15)] bg-white/95 border border-black/10 overflow-hidden"
      >
        <button
          type="button"
          class="relative w-full flex items-center justify-center px-6 py-4"
          @click="toggleCategory(cat)"
          :aria-expanded="isOpen(cat)"
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
        <div v-show="isOpen(cat)" class="px-6 pb-5">
          <ul
            class="list-disc pl-5 space-y-2 leading-relaxed text-base sm:text-[17px] text-gray-800"
          >
            <!-- 支援 **粗體** / <b>粗體</b> / 換行 -->
            <li v-for="(rule, i) in group" :key="i" v-html="renderRule(rule.rule)"></li>
          </ul>
        </div>
      </section>

      <!-- 沒有快取且資料未回來：骨架 -->
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
import { ref, computed, onMounted, watch } from 'vue'

const items = ref([]) // [{category, rule}, ...]
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

// 條文渲染：只允許 <b>/<strong>，支援 **粗體** 與 \n
function renderRule(input) {
  const text = String(input ?? '')
  const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const mdBold = escaped.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
  const allowBold = mdBold
    .replace(/&lt;b&gt;/g, '<b>')
    .replace(/&lt;\/b&gt;/g, '</b>')
    .replace(/&lt;strong&gt;/g, '<strong>')
    .replace(/&lt;\/strong&gt;/g, '</strong>')
  return allowBold.replace(/\n/g, '<br />')
}

// —— SWR：先讀快取立即顯示，再背景更新 —— //
const CACHE_KEY = 'noticeCache:v1'

// 1) 讀快取
try {
  const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null')
  if (cached && Array.isArray(cached.data)) items.value = cached.data
} catch {}

// 2) 背景更新（加逾時）
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

// —— 保留開合狀態：重新整理也不會收回 —— //
const OPEN_KEY = 'notice:openCats'
onMounted(() => {
  try {
    const saved = JSON.parse(sessionStorage.getItem(OPEN_KEY) || '[]')
    if (Array.isArray(saved)) openCategories.value = saved
  } catch {}
})
watch(
  openCategories,
  v => {
    sessionStorage.setItem(OPEN_KEY, JSON.stringify(v))
  },
  { deep: true }
)
</script>

<style scoped>
@media (max-width: 640px) {
  .pb-28 {
    padding-bottom: 7rem;
  } /* 避開底部導覽列 */
}
</style>

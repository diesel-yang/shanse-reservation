<template>
  <div class="min-h-screen bg-gradient-to-b from-[#dc5f20] to-[#e26a1e] flex flex-col">
    <!-- LOGO（與 about.vue 一致尺寸與風格） -->
    <img
      src="/hero-transparent.png"
      alt="山色主視覺"
      class="w-[70px] h-auto mt-6 mb-4 mx-auto object-contain bg-transparent"
    />

    <!-- 標題（呼應 faq.vue 的字級與配色） -->
    <h1 class="text-3xl font-bold text-orange-600 text-center mb-4">訂位及用餐須知</h1>

    <!-- 內容容器（置中寬度、左右內距；與底部導覽列預留空間） -->
    <main class="w-full max-w-3xl mx-auto px-4 pb-28 space-y-4">
      <!-- Accordion：依分類群組，預設閉合 -->
      <section
        v-for="(group, cat) in groupedItems"
        :key="cat"
        class="bg-white/95 backdrop-blur-sm rounded-lg shadow border border-black/10 overflow-hidden"
      >
        <!-- 標題列 -->
        <button
          type="button"
          class="w-full flex items-center justify-between px-5 py-3 text-left"
          @click="toggleCategory(cat)"
          :aria-expanded="openCategories.includes(cat) ? 'true' : 'false'"
          :aria-controls="`panel-${slug(cat)}`"
        >
          <span class="font-semibold text-gray-800">{{ cat }}</span>

          <!-- 小箭頭：開啟時旋轉 -->
          <svg
            class="w-5 h-5 transform transition-transform duration-200"
            :class="openCategories.includes(cat) ? 'rotate-180' : ''"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>

        <!-- 內容：預設閉合；使用 v-show 避免延遲訊息 -->
        <div
          :id="`panel-${slug(cat)}`"
          role="region"
          class="px-6 pb-5"
          v-show="openCategories.includes(cat)"
        >
          <ul class="list-disc pl-5 space-y-2 leading-relaxed text-gray-800">
            <li v-for="(rule, idx) in group" :key="idx">{{ rule.rule }}</li>
          </ul>
        </div>
      </section>

      <!-- 若後端目前沒有任何資料，就什麼都不顯示（不再出現「目前沒有須知」） -->
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

/**
 * 要點：
 * 1) 不顯示「目前沒有須知」的延遲訊息：移除 loading gate，直接渲染頁面。
 * 2) Accordion 預設為閉合：openCategories 預設為 []。
 * 3) 與底部導覽列保持距離：容器使用 pb-28。
 * 4) 版面配色與 logo 尺寸呼應 about.vue / faq.vue。
 */

const items = ref([]) // 來源資料：[{ category, rule }, ...]
const openCategories = ref([]) // 目前展開的分類 key 陣列（預設全閉合）

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

// 切換展開/收合
const toggleCategory = cat => {
  const i = openCategories.value.indexOf(cat)
  if (i >= 0) openCategories.value.splice(i, 1)
  else openCategories.value.push(cat)
}

// 簡單 slug 工具（供 aria-controls 使用）
const slug = s =>
  String(s || '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')

// 進頁即抓取資料，但不阻擋 UI（不顯示 loading 文字）
onMounted(async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_GAS_URL}?type=notice`, { cache: 'no-store' })
    const json = await res.json()
    items.value = Array.isArray(json?.data) ? json.data : []
    // 預設閉合：不主動填入 openCategories
  } catch (err) {
    console.error('❌ 載入須知失敗', err)
    items.value = [] // 失敗時也保持空陣列，不顯示任何占位字樣
  }
})
</script>

<style scoped>
/* 額外保險：小螢幕也留足夠底部空間，避免被固定導覽列遮住。 */
@media (max-width: 640px) {
  .pb-28 {
    padding-bottom: 7rem;
  }
}
</style>

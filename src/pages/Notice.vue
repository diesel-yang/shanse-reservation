<template>
  <div class="min-h-screen bg-gradient-to-b from-[#dc5f20] to-[#e26a1e] flex flex-col">
    <!-- LOGO -->
    <img
      src="/hero-transparent.png"
      alt="山色主視覺"
      class="w-[140px] h-auto mt-6 mx-auto object-contain bg-transparent"
    />
    <!-- 頁面名稱 -->
    <h1 class="text-3xl sm:text-4xl font-bold text-orange-50/80 text-center tracking-widest mb-6">
      訂位及用餐須知
    </h1>

    <!-- Accordion 區塊 -->
    <main class="w-full max-w-xl mx-auto px-4 pb-28 space-y-4">
      <section
        v-for="(group, cat) in groupedItems"
        :key="cat"
        class="rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.15)] bg-white/95 backdrop-blur-sm border border-black/10 overflow-hidden"
      >
        <!-- 分類標題 -->
        <button
          type="button"
          class="relative w-full flex items-center justify-center px-6 py-4"
          @click="toggleCategory(cat)"
          :aria-expanded="isOpen(cat)"
        >
          <span class="text-lg sm:text-xl font-semibold text-gray-800">{{ cat }}</span>
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

        <!-- 條文內容 -->
        <div v-show="isOpen(cat)" class="px-6 pb-5">
          <ul
            class="list-disc pl-5 space-y-2 leading-relaxed text-base sm:text-[17px] text-gray-800"
          >
            <li v-for="(rule, idx) in group" :key="idx">{{ rule.rule }}</li>
          </ul>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const items = ref([])
const openCategories = ref([]) // 預設閉合

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

onMounted(async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_GAS_URL}?type=notice`, { cache: 'no-store' })
    const json = await res.json()
    items.value = Array.isArray(json?.data) ? json.data : []
  } catch (err) {
    console.error('❌ 載入須知失敗', err)
    items.value = []
  }
})
</script>

<style scoped>
@media (max-width: 640px) {
  .pb-28 {
    padding-bottom: 7rem; /* 避開底部導覽列 */
  }
}
</style>

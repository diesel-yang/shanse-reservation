<!-- src/pages/Retail.vue -->
<template>
  <div class="max-w-3xl mx-auto px-4 py-6" :style="pagePadStyle">
    <!-- 頁首 -->
    <header class="mb-4">
      <div class="flex items-center gap-3 mb-3">
        <img src="/icon/shane-logo-orange.svg" alt="山色" class="w-8 h-8" />
        <h1 class="text-2xl font-bold">零售商店</h1>
      </div>
      <nav class="flex gap-2">
        <button :class="tabBtn('frozen')" @click="tab = 'frozen'">冷凍即食</button>
        <button :class="tabBtn('dessert')" @click="tab = 'dessert'">甜點</button>
      </nav>
    </header>

    <!-- 骨架 -->
    <div v-if="retailLoading?.value" class="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <div v-for="i in 6" :key="i" class="rounded-2xl border bg-white overflow-hidden p-3">
        <div class="shimmer h-28 rounded-xl mb-3"></div>
        <div class="shimmer h-4 w-3/4 rounded mb-2"></div>
        <div class="shimmer h-4 w-1/2 rounded mb-3"></div>
        <div class="shimmer h-10 w-full rounded"></div>
      </div>
    </div>

    <!-- 商品清單 -->
    <SectionCard
      v-else
      :title="groups.title"
      :items="displayItems"
      mode="retail"
      @open-detail="openDetail"
    />

    <!-- 商品詳情視窗 -->
    <transition name="fade">
      <div v-if="detail" class="fixed inset-0 z-[60]">
        <div class="absolute inset-0 bg-black/50" @click="closeDetail"></div>
        <div
          class="absolute left-1/2 -translate-x-1/2 w-[95%] max-w-3xl top-6 bottom-6 bg-white shadow-xl flex flex-col"
        >
          <div class="px-5 py-4 border-b flex items-center justify-between">
            <h2 class="text-lg font-semibold truncate">{{ detail.name }}</h2>
            <button class="text-gray-500 hover:text-black" @click="closeDetail">✕</button>
          </div>

          <div class="flex-1 overflow-auto">
            <div v-if="detail.image" class="aspect-[16/10] w-full overflow-hidden">
              <img :src="detail.image" class="w-full h-full object-cover" />
            </div>
            <div class="px-5 py-4 space-y-3">
              <div class="text-sm text-gray-700 whitespace-pre-line">
                {{ detail.description || detail.note || '' }}
              </div>
            </div>
          </div>

          <!-- 🟧 改動：詳情頁底部操作，與 SectionCard 一致（黃底條形 + 動態垃圾桶/減號） -->
          <div class="border-t px-5 py-3">
            <div class="flex items-center justify-between gap-3">
              <div class="text-xl font-semibold shrink-0">
                {{ Number(detail.price || 0).toLocaleString() }}
                <span class="text-xs text-gray-500">/ {{ detail.unit || '份' }}</span>
              </div>

              <!-- 若已在購物車，顯示黃底控制條 -->
              <div
                v-if="cartMap[detail.code]"
                class="flex items-center bg-yellow-400 rounded-lg px-4 h-12 flex-1"
              >
                <button
                  v-if="cartMap[detail.code].qty <= 1"
                  @click="onRemove(detail.code)"
                  class="inline-flex items-center justify-center"
                  aria-label="移除"
                >
                  <TrashIcon class="w-5 h-5 text-red-600" />
                </button>
                <button
                  v-else
                  @click="onDec(detail.code)"
                  class="font-bold text-black"
                  aria-label="減少"
                >－</button>

                <span class="flex-1 text-center font-semibold">{{ cartMap[detail.code].qty }}</span>

                <button
                  @click="onInc(detail.code)"
                  class="font-bold text-black"
                  aria-label="增加"
                >＋</button>
              </div>

              <!-- 未在購物車，顯示「加入購物車」 -->
              <button
                v-else
                class="flex-1 h-12 bg-yellow-400 text-black rounded-lg font-semibold hover:bg-yellow-500"
                @click="onAdd(detail)"
              >
                加入購物車
              </button>
            </div>
          </div>
          <!-- 🟧 改動結束 -->
        </div>
      </div>
    </transition>

    <!-- spacer -->
    <div aria-hidden="true" :style="bottomSpacerStyle"></div>
  </div>
</template>

<script setup>
import { inject, ref, computed } from 'vue'
import SectionCard from '@/components/SectionCard.vue'

/* 🟧 新增：接上全域購物車 + 垃圾桶 icon（其餘原樣保留） */
import { useCart } from '@/composables/useCart'             // 🟧
import { TrashIcon } from '@heroicons/vue/24/outline'       // 🟧

const pagePadStyle = { 'padding-bottom': 'var(--nav-height, 100px)' }
const bottomSpacerStyle = { height: 'calc(var(--nav-height, 100px) + 12px)' }

const providedRetail = inject('retail', { frozen: [], dessert: [] })
const retailLoading = inject('retailLoading', ref(false))

const tab = ref('frozen')
const groups = computed(() => ({
  title: tab.value === 'frozen' ? '冷凍即食' : '甜點',
  items: providedRetail?.[tab.value] || []
}))
const displayItems = computed(() =>
  (groups.value.items || []).map(i => ({
    ...i,
    disabled: Boolean(i.stop || Number(i.stock ?? 0) <= 0)
  }))
)

const detail = ref(null)
function openDetail(item) { detail.value = item }
function closeDetail() { detail.value = null }

/* 🟧 新增：購物車狀態映射（不動原有資料流） */
const { items: cartItems, add, inc, dec, remove } = useCart()  // 🟧
const cartMap = computed(() => {                               // 🟧
  const m = Object.create(null)
  for (const it of cartItems.value || []) {
    if (it && it.code) m[it.code] = it
  }
  return m
})
function onAdd(item) { if (item) add(item, 1) }                // 🟧
function onInc(code) { const i = cartItems.value.findIndex(x => x?.code === code); if (i > -1) inc(i) }   // 🟧
function onDec(code) { const i = cartItems.value.findIndex(x => x?.code === code); if (i > -1) dec(i) }   // 🟧
function onRemove(code) { const i = cartItems.value.findIndex(x => x?.code === code); if (i > -1) remove(i) } // 🟧

const tabBtn = t =>
  `px-3 py-1 rounded-full border ${
    tab.value === t ? 'bg-black text-white border-black' : 'bg-white text-black'
  }`
</script>

<style scoped>
.shimmer {
  position: relative;
  overflow: hidden;
  background: #f3f4f6;
}
.shimmer::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
  animation: shimmer 1.2s infinite;
}
@keyframes shimmer {
  100% { transform: translateX(100%); }
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.18s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

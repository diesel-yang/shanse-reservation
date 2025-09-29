<template>
  <div class="mb-4">
    <h4 v-if="!hideTitle && title" class="text-xl font-bold text-orange-600 mb-3">
      {{ title }}
    </h4>

    <!-- 零售卡片版 -->
    <div v-if="mode === 'retail'" class="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <div
        v-for="item in filteredItems"
        :key="item.code"
        class="group relative rounded-2xl border bg-white overflow-hidden shadow-sm flex flex-col"
      >
        <!-- 售完遮罩 -->
        <div
          v-if="item.disabled"
          class="absolute inset-0 z-10 grid place-items-center bg-white/70 text-red-500 font-semibold"
        >
          售完／補貨中
        </div>

        <!-- 圖片（點擊開詳情） -->
        <button class="text-left" @click="emit('open-detail', item)" :disabled="item.disabled">
          <img
            v-if="item.image"
            :src="item.image"
            alt=""
            class="w-full h-28 object-cover"
            @error="handleImgError"
          />
        </button>

        <!-- 文字區 -->
        <div class="p-3 flex-1 flex flex-col">
          <button class="text-left mb-2" @click="emit('open-detail', item)" :disabled="item.disabled">
            <div class="text-sm font-semibold text-gray-900 line-clamp-2 min-h-[2.5rem]">
              {{ item.name }}
            </div>
            <div class="mt-1 text-base font-bold text-gray-900">
              {{ currency(item.price) }}
              <span class="text-xs text-gray-500">/ {{ item.unit || '份' }}</span>
            </div>
          </button>

          <!-- 🟧 加入購物車 / 數量控制 -->
          <div v-if="cartMap[item.code]?.qty > 0" class="flex items-center justify-between mt-2 border rounded-lg px-2 py-1">
            <!-- 垃圾桶 -->
            <button class="text-red-500" @click.stop="removeItem(item)">🗑</button>
            <!-- 數量 -->
            <span class="font-semibold">{{ cartMap[item.code].qty }}</span>
            <!-- + 按鈕 -->
            <button class="text-blue-600" @click.stop="incItem(item)">＋</button>
          </div>

          <button
            v-else
            class="mt-2 h-10 rounded-lg font-semibold bg-yellow-400 text-black hover:bg-yellow-500 transition"
            :disabled="item.disabled"
            @click.stop="addItem(item)"
          >
            加入購物車
          </button>
        </div>
      </div>
    </div>

    <!-- 原一般菜單版（保留） -->
    <div v-else class="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <div
        v-for="item in filteredItems"
        :key="item.code"
        @click="handleClick(item)"
        class="relative card-item"
        :class="{
          selected: isSelected(item.code),
          disabled: item.disabled,
          'as-button': type === 'addon'
        }"
      >
        <img v-if="item.image" :src="item.image" alt="" class="w-full h-24 object-cover rounded mb-1" @error="handleImgError" />
        <div class="text-sm font-semibold text-gray-900">{{ item.name }}</div>
        <div v-if="type === 'addon' && item.price > 0" class="text-xs text-gray-800 mt-0.5">{{ item.price }} 元</div>
        <div v-if="item.disabled" class="text-xs text-red-500 mt-1">售完／補貨中</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCart } from '@/composables/useCart'

const props = defineProps({
  title: String,
  items: Array,
  selectedCode: String,
  selectedList: Array,
  type: String,
  mode: { type: String, default: 'menu' },
  hideTitle: { type: Boolean, default: false }
})
const emit = defineEmits(['select', 'toggle', 'preview', 'add-to-cart', 'open-detail'])

const { items: cartItems, add, inc, remove } = useCart()

// 🟧 快速查詢購物車內容 { code: { qty } }
const cartMap = computed(() => {
  const map = {}
  for (const c of cartItems.value) {
    map[c.code] = c
  }
  return map
})

function addItem(item) {
  add(item, 1)
}
function incItem(item) {
  const found = cartMap.value[item.code]
  if (found) inc(cartItems.value.indexOf(found))
}
function removeItem(item) {
  const found = cartMap.value[item.code]
  if (found) remove(cartItems.value.indexOf(found))
}

const filteredItems = computed(() => (Array.isArray(props.items) ? props.items : []))
const currency = n => `NT$ ${Number(n || 0).toLocaleString()}`
function handleImgError(e) {
  e.target.style.display = 'none'
}
const isSelected = code =>
  props.type === 'addon' ? props.selectedList?.includes(code) : props.selectedCode === code
</script>

<style scoped>
.card-item {
  @apply border rounded p-3 cursor-pointer transition bg-white text-left;
}
.card-item.selected {
  @apply bg-orange-100 border-orange-400 text-orange-800;
}
.card-item.disabled {
  @apply opacity-50 cursor-not-allowed bg-gray-100 border-gray-300;
}
.card-item.as-button {
  @apply text-center py-2 px-3 bg-white border border-gray-300 rounded font-medium;
}
.card-item.as-button.selected {
  @apply bg-orange-100 text-orange-800 border-orange-400;
}
</style>

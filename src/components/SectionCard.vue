<!-- src/components/SectionCard.vue -->
<template>
  <div class="mb-4">
    <h4 v-if="!hideTitle && title" class="text-xl font-bold text-orange-600 mb-3">
      {{ title }}
    </h4>

    <!-- 🛒 零售卡片版 -->
    <div v-if="mode === 'retail'" class="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <div
        v-for="(item, idx) in filteredItems"
        :key="item.code || idx"
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
          <button class="text-left" @click="emit('open-detail', item)" :disabled="item.disabled">
            <div class="text-sm font-semibold text-gray-900 line-clamp-2 min-h-[2.5rem]">
              {{ item.name }}
            </div>
            <div class="mt-1 text-base font-bold text-gray-900">
              {{ currency(item.price) }}
              <span class="text-xs text-gray-500">/ {{ item.unit || '份' }}</span>
            </div>
            <div v-if="item.note" class="mt-1 text-xs text-gray-500 line-clamp-1">
              {{ item.note }}
            </div>
          </button>

          <!-- ✅ 底部按鈕區塊 -->
          <div class="mt-3">
            <!-- 如果已加入購物車，顯示數量控制 -->
            <div
              v-if="cartMap[item.code]"
              class="flex items-center justify-between border rounded-lg px-2 py-1"
            >
              <button
                class="text-red-500 text-sm px-2"
                @click.stop="emit('remove-from-cart', item)"
              >
                🗑 移除
              </button>
              <div class="flex items-center gap-2">
                <button
                  class="px-2 py-1 border rounded"
                  @click.stop="emit('dec', item)"
                  :disabled="cartMap[item.code].qty <= 1"
                >
                  －
                </button>
                <span class="w-6 text-center">{{ cartMap[item.code].qty }}</span>
                <button class="px-2 py-1 border rounded" @click.stop="emit('inc', item)">
                  ＋
                </button>
              </div>
            </div>

            <!-- 尚未加入購物車 -->
            <button
              v-else
              class="w-full h-10 rounded-lg font-semibold transition bg-blue-600 text-white hover:bg-blue-700"
              :disabled="item.disabled"
              @click.stop="onAdd(item)"
            >
              加入購物車
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 🍽️ 原一般菜單版（保留） -->
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
        <!-- ICONs -->
        <img
          v-if="item.note?.includes('限預訂') || item.note?.includes('限訂')"
          src="/icon/limited.svg"
          alt="限訂"
          class="w-12 h-12 absolute top-1 left-1 z-10"
        />
        <img
          v-else-if="item.note?.includes('熱湯')"
          src="/icon/hot-soup.svg"
          alt="熱湯"
          class="w-12 h-12 absolute top-1 left-1 z-10"
        />
        <img
          v-else-if="item.note?.includes('熱飲')"
          src="/icon/hot-drink.svg"
          alt="熱飲"
          class="w-9 h-9 absolute top-1 left-1 z-10"
        />

        <img
          v-if="type !== 'addon' && item.image"
          :src="item.image"
          alt=""
          class="w-full h-24 object-cover rounded mb-1"
          @error="handleImgError"
        />
        <div class="text-sm font-semibold text-gray-900">{{ item.name }}</div>
        <div v-if="type === 'addon' && item.price > 0" class="text-xs text-gray-800 mt-0.5">
          {{ item.price }} 元
        </div>
        <div v-if="item.disabled" class="text-xs text-red-500 mt-1">售完／補貨中</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'

const props = defineProps({
  title: String,
  items: Array,
  selectedCode: String,
  selectedList: Array,
  type: String,
  mode: { type: String, default: 'menu' }, // 'menu' | 'retail'
  hideTitle: { type: Boolean, default: false },
  cartMap: { type: Object, default: () => ({}) } // 🆕 用 code 對應購物車數量
})
const emit = defineEmits([
  'select',
  'toggle',
  'preview',
  'add-to-cart',
  'open-detail',
  'inc',
  'dec',
  'remove-from-cart'
])

/** 加入購物車 */
function onAdd(item) {
  if (!item || item.disabled) return
  emit('add-to-cart', item)
}

/** 一般菜單版點擊行為 */
const handleClick = item => {
  if (!item || item.disabled) return
  if (props.mode === 'retail') {
    emit('add-to-cart', item)
  } else if (props.type === 'addon') {
    emit('toggle', item.code)
  } else {
    emit('preview', item)
  }
}

const isSelected = code =>
  props.type === 'addon' ? props.selectedList?.includes(code) : props.selectedCode === code
const filteredItems = computed(() => (Array.isArray(props.items) ? props.items : []))
const currency = n => `NT$ ${Number(n || 0).toLocaleString()}`
function handleImgError(e) {
  e.target.style.display = 'none'
}
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

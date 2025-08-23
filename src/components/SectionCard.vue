<template>
  <div class="mb-4">
    <!-- 是否顯示分組標題 -->
    <h4 v-if="showTitle" class="text-xl font-bold text-orange-600 mb-3">{{ title }}</h4>

    <!-- 零售版 -->
    <div v-if="mode === 'retail'" class="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <div
        v-for="item in filteredItems"
        :key="item.code"
        class="group relative rounded-2xl border bg-white overflow-hidden shadow-sm cursor-pointer"
        @click="$emit('open-detail', item)"
      >
        <!-- 售完遮罩 -->
        <div
          v-if="item.disabled"
          class="absolute inset-0 z-10 grid place-items-center bg-white/70 text-red-500 font-semibold"
        >
          售完／補貨中
        </div>

        <!-- 圖 -->
        <img
          v-if="item.image"
          :src="item.image"
          alt=""
          class="w-full h-32 object-cover"
          @error="handleImgError"
        />

        <!-- 內容 -->
        <div class="p-3 space-y-2">
          <div class="text-sm font-semibold text-gray-900 line-clamp-2 min-h-[2.5rem]">
            {{ item.name }}
          </div>
          <div class="flex items-end justify-between">
            <div class="text-base font-bold text-gray-900">
              {{ currency(item.price) }}
              <span class="text-xs text-gray-500 ml-1">/ {{ item.unit || '份' }}</span>
            </div>

            <!-- 長方形加入按鈕；阻止冒泡避免直接開視窗 -->
            <button
              class="px-3 py-2 rounded-md text-sm font-semibold text-white"
              :class="
                item.disabled
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : inCart(item.code)
                    ? 'bg-green-600'
                    : 'bg-blue-600 hover:bg-blue-700'
              "
              :disabled="item.disabled"
              @click.stop="$emit('add-to-cart', item)"
            >
              {{ inCart(item.code) ? '✓ 已加入購物車' : '加入購物車' }}
            </button>
          </div>

          <div v-if="item.note" class="text-xs text-gray-500 line-clamp-1">
            {{ item.note }}
          </div>
        </div>
      </div>
    </div>

    <!-- 一般菜單版（原樣保持） -->
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
        <!-- 限訂 / 熱湯 / 熱飲 ICON -->
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
import { computed } from 'vue'

const props = defineProps({
  title: String,
  items: Array,
  selectedCode: String,
  selectedList: Array,
  type: String,
  mode: { type: String, default: 'menu' }, // 'menu' | 'retail'
  showTitle: { type: Boolean, default: true },
  /** 由父層傳入已在購物車的 code 用來改變按鈕樣式 */
  inCartCodes: { type: Array, default: () => [] }
})
const emit = defineEmits(['select', 'toggle', 'preview', 'add-to-cart', 'open-detail'])

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

const isSelected = code => {
  return props.type === 'addon' ? props.selectedList?.includes(code) : props.selectedCode === code
}
const inCart = code => props.inCartCodes?.includes(code)

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

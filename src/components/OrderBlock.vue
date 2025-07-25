<template>
  <div class="bg-white rounded-lg shadow-md p-4 mb-6 border border-gray-200">
    <h3 v-if="!hideTitle" class="text-lg font-semibold text-gray-800 mb-3">
      第 {{ index + 1 }} 位顧客
    </h3>

    <!-- 分類區塊：主餐、飲品、副餐、加點 -->
    <div v-for="type in ['main', 'drink', 'side', 'addon']" :key="type" class="mb-6">
      <h4 class="font-semibold mb-2">
        {{
          type === 'main'
            ? '主餐'
            : type === 'drink'
              ? '飲品'
              : type === 'side'
                ? '副餐'
                : '加點（可複選）'
        }}
      </h4>

      <div class="flex flex-wrap gap-3">
        <div
          v-for="item in menu[type] || []"
          :key="item.code"
          class="relative group w-32 cursor-pointer transition-transform"
          :class="{
            'ring-2 ring-orange-500 scale-105': isSelected(type, item.code),
            'opacity-50': item.stop
          }"
          @click="handleClick(type, item)"
        >
          <!-- 商品圖片 -->
          <img
            :src="item.image"
            alt="item.name"
            class="w-full h-24 object-cover rounded-lg border border-gray-300"
            @error="onImageError"
          />

          <!-- 品名 -->
          <p class="text-center mt-1 text-sm font-medium text-gray-800">{{ item.name }}</p>
          <!-- 加價 -->
          <p v-if="item.price > 0" class="text-center text-xs text-orange-600">
            +{{ item.price }} 元
          </p>
          <!-- 停售 -->
          <p
            v-if="item.stop"
            class="absolute top-1 right-1 bg-gray-700 text-white text-xs px-1 rounded"
          >
            停售
          </p>
        </div>
      </div>
    </div>

    <!-- 展開層：放大圖片與說明 -->
    <div
      v-if="expandedItem"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      @click.self="closeExpanded"
    >
      <div
        class="bg-white rounded-lg shadow-xl p-4 w-[90%] max-w-xl max-h-[66vh] overflow-y-auto relative"
      >
        <img
          :src="expandedItem.image"
          alt="expanded"
          class="w-full h-48 object-cover rounded"
          @error="onImageError"
        />
        <h2 class="text-xl font-bold mt-3">{{ expandedItem.name }}</h2>
        <p v-if="expandedItem.price > 0" class="text-orange-600 font-semibold">
          +{{ expandedItem.price }} 元
        </p>
        <p v-if="expandedItem.description" class="text-gray-700 mt-2">
          {{ expandedItem.description }}
        </p>
        <p v-if="expandedItem.note" class="text-gray-600 mt-1">{{ expandedItem.note }}</p>

        <button
          class="absolute top-2 right-3 text-gray-500 hover:text-black text-lg"
          @click="closeExpanded"
        >
          ✕
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject, ref, computed } from 'vue'
import { calcPriceBreakdown } from '@/utils/helpers'

const props = defineProps({
  index: Number,
  order: Object,
  hideTitle: Boolean
})
const emit = defineEmits(['update:order'])

// 注入菜單資料
const menu = inject('menu', {
  main: [],
  drink: [],
  side: [],
  addon: []
})

// 展開中的項目（點選圖片後放大）
const expandedItem = ref(null)

// 展開或收合邏輯
function handleClick(type, item) {
  // 若已展開且點的是同一項 → 收合 + 取消選取
  if (expandedItem.value?.code === item.code) {
    deselectItem(type, item.code)
    expandedItem.value = null
    return
  }

  // 選取品項
  selectItem(type === 'addon' ? 'addons' : type, item.code)
  expandedItem.value = item
}

// 關閉展開層
function closeExpanded() {
  expandedItem.value = null
}

// 單選項目（主餐、飲品、配菜）
function selectItem(type, code) {
  if (type === 'addons') {
    toggleAddon(code)
  } else {
    emit('update:order', { ...props.order, [type]: code })
  }
}

// 多選加點切換
function toggleAddon(code) {
  const current = props.order.addons || []
  const updated = current.includes(code) ? current.filter(c => c !== code) : [...current, code]
  emit('update:order', { ...props.order, addons: updated })
}

// 取消選取（主要在點第二次卡片用）
function deselectItem(type, code) {
  if (type === 'addons') {
    toggleAddon(code) // 會自動取消
  } else {
    if (props.order[type] === code) {
      emit('update:order', { ...props.order, [type]: '' })
    }
  }
}

// 判斷是否選中該項
function isSelected(type, code) {
  if (type === 'addon') {
    return props.order.addons?.includes(code)
  } else {
    return props.order[type] === code
  }
}

// 圖片備援處理
function onImageError(e) {
  e.target.src = 'https://via.placeholder.com/150x100?text=No+Image'
}
</script>

<style>
.menu-card {
  @apply w-32 h-32 sm:w-36 sm:h-36 flex flex-col items-center justify-center border rounded-lg overflow-hidden relative cursor-pointer transition-transform transform hover:scale-105 bg-white;
}

.menu-card--active {
  @apply border-4 border-orange-500;
}

.menu-card__image {
  @apply w-full h-20 object-cover rounded-t;
}

.menu-card--expanded {
  @apply fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-md h-[66vh] transform -translate-x-1/2 -translate-y-1/2 border-4 border-orange-500 rounded-xl shadow-lg bg-white p-4 overflow-y-auto;
}

.menu-card__content {
  @apply mt-2 text-sm text-gray-800;
}

.menu-card__content p + p {
  @apply mt-1;
}

.holiday-highlight {
  color: red !important;
  font-weight: bold !important;
}

.holiday-highlight.selected,
.holiday-highlight.selected:hover {
  background: #ffe5e5 !important;
  color: red !important;
  font-weight: bold !important;
}
</style>

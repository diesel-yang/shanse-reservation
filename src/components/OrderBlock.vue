<template>
  <div class="bg-white rounded-lg shadow-md p-4 mb-6 border border-gray-200">
    <h3 v-if="!props.hideTitle" class="text-lg font-semibold text-gray-800 mb-3">
      第 {{ index + 1 }} 位顧客
    </h3>

    <!-- 主餐 / 飲品 / 副餐 -->
    <SectionCard
      v-for="type in ['main', 'drink', 'side']"
      :key="type"
      :title="typeMap[type]"
      :items="menu[type]"
      :selectedCode="order[type]"
      :type="type"
      @select="selectItem"
      @open-preview="openPreview"
    />

    <!-- 加點（多選） -->
    <SectionCard
      title="加點（可複選）"
      :items="menu.addon"
      :selectedList="order.addons"
      type="addon"
      @toggle="toggleAddon"
      @open-preview="openPreview"
    />

    <!-- 展開 Modal -->
    <ModalItemPreview
      v-if="previewItem"
      :item="previewItem"
      :selected="isSelected(previewItem.code)"
      @select="handleSelectInModal"
      @close="previewItem = null"
    />
  </div>
</template>

<script setup>
import { inject, ref, computed } from 'vue'
import SectionCard from './SectionCard.vue'
import ModalItemPreview from './ModalItemPreview.vue'
import { calcPriceBreakdown } from '@/utils/helpers'

const props = defineProps({
  index: Number,
  order: Object,
  hideTitle: Boolean
})
const emit = defineEmits(['update:order'])

const menu = inject('menu', {
  main: [],
  drink: [],
  side: [],
  addon: []
})

const typeMap = {
  main: '主餐',
  drink: '飲品',
  side: '副餐'
}

const previewItem = ref(null)

// ✅ 單選
function selectItem(type, code) {
  emit('update:order', {
    ...props.order,
    [type]: code
  })
}

// ✅ 多選（加點）
function toggleAddon(code) {
  const current = props.order.addons || []
  const updated = current.includes(code) ? current.filter(c => c !== code) : [...current, code]
  emit('update:order', { ...props.order, addons: updated })
}

// ✅ 判斷是否已選
function isSelected(code) {
  return (
    props.order.main === code ||
    props.order.drink === code ||
    props.order.side === code ||
    (props.order.addons || []).includes(code)
  )
}

// ✅ 開啟預覽彈窗
function openPreview(item) {
  previewItem.value = item
}

// ✅ 在彈窗中選擇
function handleSelectInModal(code) {
  if (!previewItem.value) return
  const item = previewItem.value

  const type = ['main', 'drink', 'side'].find(t => menu[t].some(i => i.code === code))
  if (type) {
    selectItem(type, code)
  } else {
    toggleAddon(code)
  }
  previewItem.value = null
}
</script>

<style>
.card-item {
  @apply cursor-pointer border rounded-lg p-2 shadow-sm transition duration-150 bg-white;
}
.card-item:hover {
  @apply border-orange-400 shadow-md;
}
.card-item.selected {
  @apply border-orange-500 bg-orange-50 shadow-inner;
}
.card-item.disabled {
  @apply opacity-50 cursor-not-allowed bg-gray-100 border-gray-300;
}

/* Modal 基本樣式 */
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50;
}

.modal-content {
  @apply bg-white rounded-lg shadow-xl p-4 max-w-md w-[90%] max-h-[90vh] overflow-y-auto relative;
}

.modal-close {
  @apply absolute top-2 right-2 text-gray-500 hover:text-gray-800 cursor-pointer text-xl;
}

/* 圖片放大效果 */
.modal-image {
  @apply w-full h-auto object-cover rounded-lg mb-4;
  max-height: 60vh;
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

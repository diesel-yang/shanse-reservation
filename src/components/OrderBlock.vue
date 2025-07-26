<script setup>
import { inject, computed, ref } from 'vue'
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

// 彈出視窗
const previewItem = ref(null)
const previewType = ref('')

// ▶️ 選擇單選品項
function selectItem(type, code) {
  emit('update:order', { ...props.order, [type]: code })
}

// ▶️ 多選加點
function toggleAddon(code) {
  const current = props.order.addons || []
  const updated = current.includes(code) ? current.filter(c => c !== code) : [...current, code]
  emit('update:order', { ...props.order, addons: updated })
}

// ▶️ 從 Modal 彈窗選擇品項
function handlePreview(item, type) {
  previewItem.value = item
  previewType.value = type
}
function handleSelectFromPreview(item) {
  selectItem(previewType.value, item.code)
}
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-4 mb-6 border border-gray-200">
    <h3 v-if="!props.hideTitle" class="text-lg font-semibold text-gray-800 mb-3">
      第 {{ index + 1 }} 位顧客
    </h3>

    <SectionCard
      title="主餐"
      :items="menu.main"
      :selectedCode="props.order.main"
      type="main"
      @preview="item => handlePreview(item, 'main')"
    />
    <SectionCard
      title="飲品"
      :items="menu.drink"
      :selectedCode="props.order.drink"
      type="drink"
      @preview="item => handlePreview(item, 'drink')"
    />
    <SectionCard
      title="副餐"
      :items="menu.side"
      :selectedCode="props.order.side"
      type="side"
      @preview="item => handlePreview(item, 'side')"
    />
    <SectionCard
      title="加點"
      :items="menu.addon"
      :selectedList="props.order.addons"
      type="addon"
      @toggle="toggleAddon"
    />

    <ModalItemPreview
      v-if="previewItem"
      :item="previewItem"
      @close="previewItem = null"
      @select="handleSelectFromPreview"
    />
  </div>
</template>
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

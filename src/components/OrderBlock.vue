<template>
  <div class="bg-white rounded-lg shadow-md p-4 mb-6 border border-gray-200">
    <h3 v-if="!hideTitle" class="text-lg font-semibold text-gray-800 mb-3">
      第 {{ index + 1 }} 位顧客
    </h3>

    <SectionCard
      title="主餐"
      :items="menu.main"
      :selectedCode="order.main"
      type="main"
      @select="selectItem"
      @preview="previewItem"
    />
    <SectionCard
      title="飲品"
      :items="menu.drink"
      :selectedCode="order.drink"
      type="drink"
      @select="selectItem"
      @preview="previewItem"
    />
    <SectionCard
      title="副餐"
      :items="menu.side"
      :selectedCode="order.side"
      type="side"
      @select="selectItem"
      @preview="previewItem"
    />
    <SectionCard
      title="加點（可複選）"
      :items="menu.addon"
      :selectedList="order.addons"
      type="addon"
      @toggle="toggleAddon"
    />

    <ModalItemPreview :visible="showPreview" :item="previewData" @close="showPreview = false" />
  </div>
</template>

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

function selectItem(type, code) {
  emit('update:order', {
    ...props.order,
    [type]: code
  })
}

function toggleAddon(code) {
  const current = props.order.addons || []
  const updated = current.includes(code) ? current.filter(c => c !== code) : [...current, code]
  emit('update:order', { ...props.order, addons: updated })
}

const showPreview = ref(false)
const previewData = ref({})

function previewItem(item) {
  previewData.value = item
  showPreview.value = true
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

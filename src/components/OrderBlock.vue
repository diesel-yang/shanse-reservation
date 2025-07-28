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

// Modal 狀態
const previewItem = ref(null)
const previewType = ref('')

// ▶️ 單選：主餐 / 飲品 / 副餐
function selectItem(type, code) {
  emit('update:order', { ...props.order, [type]: code })
}

// ▶️ 加點多選
function toggleAddon(code) {
  const current = props.order.addons || []
  const updated = current.includes(code)
    ? current.filter(c => c !== code)
    : [...current, code]
  emit('update:order', { ...props.order, addons: updated })
}

// ▶️ 點選卡片 → 開啟 Modal 預覽
function handlePreview(item, type) {
  previewItem.value = item
  previewType.value = type
}

// ▶️ Modal 點「我要這個」
function handleSelectItem(item) {
  if (previewType.value === 'addon') {
    toggleAddon(item.code)
  } else {
    selectItem(previewType.value, item.code)
  }
}
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-4 mb-6 border border-gray-200">
    <!-- 顧客編號 -->
    <h3 v-if="!props.hideTitle" class="text-lg font-semibold text-gray-800 mb-3">
      第 {{ index + 1 }} 位顧客
    </h3>

    <!-- 主餐 -->
    <SectionCard
      title="主餐"
      :items="menu.main"
      :selectedCode="props.order.main"
      type="main"
      @preview="item => handlePreview(item, 'main')"
    />

    <!-- 飲品 -->
    <SectionCard
      title="飲品"
      :items="menu.drink"
      :selectedCode="props.order.drink"
      type="drink"
      @preview="item => handlePreview(item, 'drink')"
    />

    <!-- 副餐 -->
    <SectionCard
      title="副餐"
      :items="menu.side"
      :selectedCode="props.order.side"
      type="side"
      @preview="item => handlePreview(item, 'side')"
    />

    <!-- 加點 -->
    <SectionCard
      title="加點"
      :items="menu.addon"
      :selectedList="props.order.addons"
      type="addon"
      @toggle="toggleAddon"
    />

    <!-- Modal 預覽視窗 -->
    <ModalItemPreview
      v-if="previewItem"
      :item="previewItem"
      @select="handleSelectItem"
      @close="previewItem = null"
    />
  </div>
</template>

<style>
.card-item {
  @apply cursor-pointer border rounded-lg p-2 shadow-sm transition duration-200 bg-white;
  transform: scale(1);
  transition: transform 0.15s ease, box-shadow 0.2s ease;
}
.card-item:hover {
  @apply border-orange-400 shadow-md;
  transform: scale(1.03);
}
.card-item:active {
  transform: scale(0.97);
}
.card-item.selected {
  @apply border-orange-500 bg-orange-50 shadow-inner;
}
.card-item.disabled {
  @apply opacity-50 cursor-not-allowed bg-gray-100 border-gray-300;
  pointer-events: none;
}
</style>
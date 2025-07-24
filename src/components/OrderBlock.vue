<template>
  <div class="bg-white rounded-lg shadow-md p-4 mb-6 border border-gray-200">
    <h3 v-if="!props.hideTitle" class="text-lg font-semibold text-gray-800 mb-3">
      第 {{ index + 1 }} 位顧客
    </h3>

    <!-- 主餐 -->
    <SectionCard
      title="主餐"
      :items="menu.main"
      :selectedCode="order.main"
      type="main"
      @select="updateSelection"
    />

    <!-- 飲品 -->
    <SectionCard
      title="飲品"
      :items="menu.drink"
      :selectedCode="order.drink"
      type="drink"
      @select="updateSelection"
    />

    <!-- 副餐 -->
    <SectionCard
      title="副餐"
      :items="menu.side"
      :selectedCode="order.side"
      type="side"
      @select="updateSelection"
    />

    <!-- 加點 -->
    <SectionCard
      title="加點（可複選）"
      :items="menu.addon"
      :selectedList="order.addons"
      type="addon"
      @toggle="toggleAddon"
    />
  </div>
</template>

<script setup>
import { inject, computed } from 'vue'
import SectionCard from './SectionCard.vue'
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

const order = props.order

function updateSelection(type, code) {
  emit('update:order', {
    ...order,
    [type]: code
  })
}

function toggleAddon(code) {
  const list = order.addons || []
  const updated = list.includes(code) ? list.filter(c => c !== code) : [...list, code]
  emit('update:order', { ...order, addons: updated })
}

const priceDetail = computed(() => calcPriceBreakdown(order, menu))
</script>

<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden transition-all border border-gray-200">
    <!-- 收合標題 -->
    <button
      class="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 flex justify-between items-center"
      @click="collapsed = !collapsed">
      <span class="font-semibold text-blue-900">第 {{ index + 1 }} 位</span>
      <svg
        :class="['w-5 h-5 transition-transform', { 'rotate-180': !collapsed }]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- 點餐內容 -->
    <div v-show="!collapsed" class="p-4 space-y-6">
      <SectionCard title="主餐" :items="menu.main" type="main" v-model:selected="order.main" />
      <SectionCard title="飲品" :items="menu.drink" type="drink" v-model:selected="order.drink" />
      <SectionCard title="副餐" :items="menu.side" type="side" v-model:selected="order.side" />
      <SectionCard
        title="加點"
        :items="menu.addon"
        type="addon"
        v-model:selectedList="order.addons"
        multiple />
    </div>

    <!-- 摘要 -->
    <div class="bg-gray-50 px-4 py-2 text-sm text-gray-700 border-t border-gray-200">
      <p>
        主餐：{{ getName('main', order.main) }} / 飲品：{{ getName('drink', order.drink) }} /
        副餐：{{ getName('side', order.side) }}
      </p>
      <p
        v-if="Array.isArray(order.addons) && order.addons.length"
        class="text-xs text-gray-500 mt-1">
        加點：{{ order.addons.map((code) => getName('addon', code)).join('、') }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'
import { getItemByCode } from '@/utils/helpers'
import SectionCard from './SectionCard.vue'

defineProps({
  index: Number,
  order: Object
})
defineEmits(['update:order'])

const collapsed = ref(false)
const menu = inject('menu', { main: [], drink: [], side: [], addon: [] })
const getName = (type, code) => getItemByCode(type, code, menu)?.name || '－'
</script>

<style scoped>
.rotate-180 {
  transform: rotate(180deg);
}
</style>

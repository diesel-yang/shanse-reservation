<template>
  <div class="bg-white rounded-lg shadow-md p-4 mb-6 border border-gray-200">
    <h3 v-if="!hideTitle" class="text-lg font-semibold text-gray-800 mb-4">
      第 {{ index + 1 }} 位顧客
    </h3>

    <!-- 主餐 -->
    <div class="mb-4">
      <h4 class="font-semibold mb-2">主餐</h4>
      <div class="flex flex-wrap gap-3">
        <div
          v-for="item in menu?.main || []"
          :key="item.code"
          class="card-button"
          :class="{ selected: order.main === item.code }"
          @click="updateSelection('main', item.code)"
        >
          <img v-if="item.image" :src="item.image" alt="" class="w-16 h-16 object-cover rounded" />
          <div class="text-sm font-semibold">{{ item.name }}</div>
          <div class="text-xs text-gray-500">{{ item.note }}</div>
        </div>
      </div>
    </div>

    <!-- 飲品 -->
    <div class="mb-4">
      <h4 class="font-semibold mb-2">飲品</h4>
      <div class="flex flex-wrap gap-3">
        <div
          v-for="item in menu?.drink || []"
          :key="item.code"
          class="card-button"
          :class="{ selected: order.drink === item.code }"
          @click="updateSelection('drink', item.code)"
        >
          <img v-if="item.image" :src="item.image" alt="" class="w-16 h-16 object-cover rounded" />
          <div class="text-sm font-semibold">{{ item.name }}</div>
          <div class="text-xs text-gray-500">{{ item.note }}</div>
        </div>
      </div>
    </div>

    <!-- 副餐 -->
    <div class="mb-4">
      <h4 class="font-semibold mb-2">副餐</h4>
      <div class="flex flex-wrap gap-3">
        <div
          v-for="item in menu?.side || []"
          :key="item.code"
          class="card-button"
          :class="{ selected: order.side === item.code }"
          @click="updateSelection('side', item.code)"
        >
          <img v-if="item.image" :src="item.image" alt="" class="w-16 h-16 object-cover rounded" />
          <div class="text-sm font-semibold">{{ item.name }}</div>
          <div class="text-xs text-gray-500">{{ item.note }}</div>
        </div>
      </div>
    </div>

    <!-- 加點 -->
    <div>
      <h4 class="font-semibold mb-2">加點（可複選）</h4>
      <div class="flex flex-wrap gap-3">
        <div
          v-for="item in menu?.addon || []"
          :key="item.code"
          class="card-button"
          :class="{ selected: (order.addons || []).includes(item.code) }"
          @click="toggleAddon(item.code)"
        >
          <img v-if="item.image" :src="item.image" alt="" class="w-16 h-16 object-cover rounded" />
          <div class="text-sm font-semibold">{{ item.name }}</div>
          <div class="text-xs text-gray-500">{{ item.note }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject, computed } from 'vue'
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

function updateSelection(type, value) {
  emit('update:order', {
    ...props.order,
    [type]: value
  })
}

function toggleAddon(code) {
  const current = props.order.addons || []
  const updated = current.includes(code) ? current.filter(c => c !== code) : [...current, code]
  emit('update:order', { ...props.order, addons: updated })
}

const priceDetail = computed(() => calcPriceBreakdown(props.order, menu))
</script>

<style scoped>
.card-button {
  @apply w-28 p-2 border border-gray-300 rounded-lg flex flex-col items-center text-center bg-white cursor-pointer transition-all;
}
.card-button:hover {
  @apply border-orange-400 bg-orange-50;
}
.card-button.selected {
  @apply border-orange-500 bg-orange-100 text-orange-800 font-semibold;
}
</style>

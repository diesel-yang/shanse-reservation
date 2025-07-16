<template>
  <div class="bg-white rounded-lg shadow-md p-4 mb-6 border border-gray-200">
    <h3 class="text-lg font-semibold text-gray-800 mb-3">第 {{ index + 1 }} 位顧客</h3>

    <!-- 主餐 -->
    <div class="mb-3">
      <h4 class="font-semibold mb-1">主餐</h4>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="item in menu?.main || []"
          :key="item.code"
          type="button"
          :class="[
            'px-3 py-1 rounded border text-sm',
            props.order.main === item.code
              ? 'bg-orange-500 text-white border-orange-500'
              : 'bg-white text-gray-700 hover:bg-orange-100'
          ]"
          @click="updateSelection('main', item.code)"
        >
          {{ item.name }}
        </button>
      </div>
    </div>

    <!-- 飲品 -->
    <div class="mb-3">
      <h4 class="font-semibold mb-1">飲品</h4>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="item in menu?.drink || []"
          :key="item.code"
          type="button"
          :class="[
            'px-3 py-1 rounded border text-sm',
            props.order.drink === item.code
              ? 'bg-orange-500 text-white border-orange-500'
              : 'bg-white text-gray-700 hover:bg-orange-100'
          ]"
          @click="updateSelection('drink', item.code)"
        >
          {{ item.name }}
        </button>
      </div>
    </div>

    <!-- 副餐 -->
    <div class="mb-3">
      <h4 class="font-semibold mb-1">副餐</h4>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="item in menu?.side || []"
          :key="item.code"
          type="button"
          :class="[
            'px-3 py-1 rounded border text-sm',
            props.order.side === item.code
              ? 'bg-orange-500 text-white border-orange-500'
              : 'bg-white text-gray-700 hover:bg-orange-100'
          ]"
          @click="updateSelection('side', item.code)"
        >
          {{ item.name }}
        </button>
      </div>
    </div>

    <!-- 加點 -->
    <div class="mb-1">
      <h4 class="font-semibold mb-1">加點（可複選）</h4>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="item in menu?.addon || []"
          :key="item.code"
          type="button"
          :class="[
            'px-3 py-1 rounded border text-sm',
            (props.order.addons || []).includes(item.code)
              ? 'bg-orange-500 text-white border-orange-500'
              : 'bg-white text-gray-700 hover:bg-orange-100'
          ]"
          @click="toggleAddon(item.code)"
        >
          {{ item.name }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject, computed } from 'vue'
import { getItemByCode } from '@/utils/helpers'

const props = defineProps({
  index: Number,
  order: Object
})

const emit = defineEmits(['update:order'])
// ✅ 正確注入 menu 並設完整 fallback，避免 undefined 錯誤
const menu = inject('menu', {
  main: [],
  drink: [],
  side: [],
  addon: []
})

// ✅ 單選更新方法
function updateSelection(type, value) {
  emit('update:order', {
    ...props.order,
    [type]: value
  })
}

// ✅ 加點多選 toggle 方法
function toggleAddon(code) {
  const current = props.order.addons || []
  const updated = current.includes(code) ? current.filter(c => c !== code) : [...current, code]
  emit('update:order', { ...props.order, addons: updated })
}
</script>

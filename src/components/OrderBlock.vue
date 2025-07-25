<template>
  <div class="bg-white rounded-lg shadow-md p-4 mb-6 border border-gray-200">
    <h3 v-if="!hideTitle" class="text-lg font-semibold text-gray-800 mb-4">
      第 {{ index + 1 }} 位顧客
    </h3>

    <div v-for="(label, type) in labels" :key="type" class="mb-6">
      <h4 class="text-base font-semibold mb-2">{{ label }}</h4>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        <div
          v-for="item in menu[type]"
          :key="item.code"
          class="relative group border rounded-lg overflow-hidden cursor-pointer transition transform hover:shadow-md"
          :class="{
            'ring-2 ring-orange-500': isSelected(type, item.code),
            'opacity-50 cursor-not-allowed': item.stop
          }"
          @click="
            !item.stop &&
            (selectItem(type === 'addon' ? 'addons' : type, item.code), toggleActive(item.code))
          "
        >
          <img
            :src="item.image"
            alt=""
            class="w-full h-28 object-cover"
            @click.stop="toggleExpand(type, item.code)"
          />
          <div class="p-2">
            <p class="text-sm font-medium truncate">{{ item.name }}</p>
            <p v-if="item.note" class="text-xs text-gray-600 truncate">{{ item.note }}</p>
            <p v-if="item.price > 0" class="text-xs text-orange-600 font-semibold">
              ＋{{ item.price }} 元
            </p>
          </div>

          <!-- 展開區塊 -->
          <div
            v-if="expandedType === type && expandedCode === item.code"
            class="absolute top-0 left-0 w-full h-full bg-white bg-opacity-95 z-20 flex flex-col items-center justify-center text-center p-4"
            @click.stop="toggleExpand(null, null)"
          >
            <img :src="item.image" alt="" class="w-40 h-40 object-cover rounded mb-3" />
            <p class="text-base font-bold">{{ item.name }}</p>
            <p v-if="item.note" class="text-sm text-gray-700 mt-1">{{ item.note }}</p>
            <p v-if="item.price > 0" class="text-sm text-orange-600 mt-1">
              加價：{{ item.price }} 元
            </p>
            <p class="text-xs text-gray-500 mt-2">( 點擊卡片以關閉 )</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject, computed, ref } from 'vue'
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

const labels = {
  main: '主餐',
  drink: '飲品',
  side: '副餐',
  addon: '加點（可複選）'
}

function selectItem(type, code) {
  if (type === 'addons') {
    const current = props.order.addons || []
    const updated = current.includes(code) ? current.filter(c => c !== code) : [...current, code]
    emit('update:order', { ...props.order, addons: updated })
  } else {
    emit('update:order', { ...props.order, [type]: code })
  }
}

function isSelected(type, code) {
  if (type === 'addon') return props.order.addons?.includes(code)
  return props.order[type] === code
}

// 控制展開區塊
const expandedType = ref(null)
const expandedCode = ref(null)

function toggleExpand(type, code) {
  if (expandedType.value === type && expandedCode.value === code) {
    expandedType.value = null
    expandedCode.value = null
  } else {
    expandedType.value = type
    expandedCode.value = code
  }
}

// 顯示橘色邊框
function toggleActive(code) {
  // 這個函式為保留樣式控制，可加上動態樣式處理
}
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

<template>
<div
  v-for="item in filteredItems"
  :key="item.code"
  @click="handleClick(item)"
  class="card-item group"
  :class="{
    selected: isSelected(item.code),
    disabled: item.disabled,
    expanded: expandedCode === item.code
  }"
>
  <img
    v-if="item.image"
    :src="item.image"
    alt=""
    class="w-full h-24 object-cover rounded mb-1 transition duration-200"
    @error="handleImgError"
  />

  <!-- 品名 -->
  <div class="text-sm font-semibold text-gray-900">{{ item.name }}</div>

  <!-- 加價顯示 -->
  <div
    v-if="type === 'addon' && item.price > 0"
    class="text-xs text-gray-800 mt-0.5"
  >
    {{ item.price }} 元
  </div>

  <!-- 售完提示 -->
  <div v-if="item.disabled" class="text-xs text-red-500 mt-1">
    售完／補貨中
  </div>

  <!-- 展開說明區塊 -->
  <div
    v-if="expandedCode === item.code && type !== 'addon'"
    class="mt-2 text-xs text-gray-700 space-y-1"
  >
    <div v-if="item.price > 0">加價：{{ item.price }} 元</div>
    <div v-if="item.note">{{ item.note }}</div>
    <div v-if="item.description">{{ item.description }}</div>
  </div>
</div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  title: String,
  items: Array,
  selectedCode: String,
  selectedList: Array,
  type: String
})
const emit = defineEmits(['select', 'toggle'])

const expandedCode = ref(null) // 展開的卡片 code

const handleClick = item => {
  if (!item || item.disabled) return

  if (props.type === 'addon') {
    emit('toggle', item.code)
  } else {
    // 同一張卡片點兩次 → 收合
    if (expandedCode.value === item.code) {
      expandedCode.value = null
    } else {
      expandedCode.value = item.code
    }
    // 點選後即選取
    emit('select', item.code)
  }
}

const isSelected = code => {
  return props.type === 'addon'
    ? props.selectedList?.includes(code)
    : props.selectedCode === code
}

const filteredItems = computed(() => (Array.isArray(props.items) ? props.items : []))

function handleImgError(e) {
  e.target.style.display = 'none'
}
</script>

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
.card-item.expanded {
  @apply bg-orange-50;
  transform: scale(1.03);
}
.card-item.disabled {
  @apply opacity-50 cursor-not-allowed bg-gray-100 border-gray-300;
  pointer-events: none;
}
</style>
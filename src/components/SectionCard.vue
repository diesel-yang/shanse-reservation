<template>
  <div class="mb-4">
<h4 class="text-xl font-bold text-orange-600 mb-3">{{ title }}</h4>
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <div
        v-for="item in filteredItems"
        :key="item.code"
        @click="handleClick(item)"
        class="card-item"
        :class="{
          selected: isSelected(item.code),
          disabled: item.disabled
        }"
      >
   <!-- 只顯示圖片於非加點 -->
<img
  v-if="section.type !== 'addon' && item.image"
  :src="item.image"
  alt=""
  class="w-full h-24 object-cover rounded mb-1"
  @error="handleImgError"
/>
        <div class="text-sm font-semibold text-gray-900">{{ item.name }}</div>
        <div v-if="type === 'addon' && item.price > 0" class="text-xs text-gray-800 mt-0.5">
          {{ item.price }} 元
        </div>
        <div v-if="item.disabled" class="text-xs text-red-500 mt-1">售完／補貨中</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: String,
  items: Array,
  selectedCode: String,
  selectedList: Array,
  type: String
})
const emit = defineEmits(['select', 'toggle', 'preview'])

const handleClick = item => {
  if (!item || item.disabled) return

  if (props.type === 'addon') {
    emit('toggle', item.code)
  } else {
    emit('preview', item)
  }
}

const isSelected = code => {
  return props.type === 'addon' ? props.selectedList?.includes(code) : props.selectedCode === code
}

const filteredItems = computed(() => (Array.isArray(props.items) ? props.items : []))

function handleImgError(e) {
  e.target.style.display = 'none'
}
</script>


<style scoped>
.card-item {
  @apply border rounded p-3 cursor-pointer transition bg-white text-left;
}
.card-item.selected {
  @apply bg-orange-500 text-white;
}
.card-item.disabled {
  @apply opacity-50 cursor-not-allowed bg-gray-100 border-gray-300;
}
.card-item.as-button {
  @apply text-center py-2 px-3 bg-white border border-gray-300 rounded font-medium;
}
.card-item.as-button.selected {
  @apply bg-orange-500 text-white border-orange-500;
}
</style>
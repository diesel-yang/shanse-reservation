<template>
  <div class="mb-6">
    <h2 class="text-lg font-semibold mb-2">{{ section.title }}</h2>
<div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
  <div
    v-for="(item, idx) in section.items"
    :key="idx"
    v-if="item"
    @click="toggleItem(item)"
    class="card-item"
    :class="{
      selected: isSelected(item),
      disabled: item.disabled,
      'as-button': section.type === 'addon'
    }"
  >
    <!-- ✅ 只顯示品名與價格 -->
    <div class="text-sm font-semibold text-center">{{ item.name }}</div>
    <div
      v-if="item.price && item.price > 0"
      class="text-xs text-gray-700 text-center"
    >
      {{ item.price }} 元
        </div>
         <!-- ✅ 顯示補貨中 -->
        <div
          v-if="item.disabled"
          class="text-xs text-red-500 mt-1 border border-red-300 px-1 py-0.5 rounded inline-block bg-red-50"
        >
          補貨中
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  section: Object,
  modelValue: [String, Array]
})
const emit = defineEmits(['update:modelValue'])

const isMultiple = computed(() => Array.isArray(props.modelValue))

const isSelected = (item) => {
  if (isMultiple.value) return props.modelValue.includes(item.name)
  return props.modelValue === item.name
}

const toggleItem = (item) => {
  if (item.disabled) return
  if (isMultiple.value) {
    const next = [...props.modelValue]
    const index = next.indexOf(item.name)
    if (index >= 0) {
      next.splice(index, 1)
    } else {
      next.push(item.name)
    }
    emit('update:modelValue', next)
  } else {
    emit('update:modelValue', item.name)
  }
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
<template>
  <div class="mb-6">
    <h2 class="text-lg font-semibold mb-2">{{ section.title }}</h2>
    <div class="grid grid-cols-2 gap-3">
      <div
        v-for="(item, idx) in section.items"
        :key="idx"
        class="card-item"
        :class="{
          selected: isSelected(item),
          disabled: item.disabled
        }"
        @click="toggleItem(item)"
      >
        <div class="font-medium">{{ item.name }}</div>
        <div class="text-sm text-gray-500" v-if="item.price && item.price > 0">
          {{ item.price }} 元
        </div>
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
  @apply border rounded p-3 cursor-pointer transition;
}
.card-item.selected {
  @apply bg-orange-500 text-white;
}
.card-item.disabled {
  @apply opacity-50 cursor-not-allowed bg-gray-100 border-gray-300;
}
</style>
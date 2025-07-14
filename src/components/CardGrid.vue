<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div
      v-for="item in items"
      :key="item.code"
      :class="[
        'relative border rounded-lg p-3 cursor-pointer transition',
        item.disabled ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : selectedClass(item.code),
        'hover:shadow-md dark:bg-gray-800 dark:text-gray-100'
      ]"
      @click="!item.disabled && handleClick(item.code)"
    >
      <!-- 圖片區 -->
      <img
        v-if="item.image"
        :src="item.image"
        alt=""
        class="w-full h-32 object-cover rounded mb-2"
        @error="e => (e.target.style.display = 'none')"
      />

      <!-- 名稱與狀態 -->
      <div class="flex items-center justify-between mb-1">
        <span class="font-medium">{{ item.name }}</span>
        <span v-if="item.price > 0" class="text-sm text-orange-600 font-semibold"
          >+${{ item.price }}</span
        >
      </div>

      <!-- 說明文字 -->
      <p v-if="item.description" class="text-sm text-gray-500 dark:text-gray-400">
        {{ item.description }}
      </p>

      <!-- 售完標示 -->
      <div
        v-if="item.disabled"
        class="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-bl"
      >
        補貨中
      </div>
    </div>
  </div>
</template>

<script setup>
const { items, selected, multiple } = defineProps({
  items: Array,
  selected: [String, Array],
  multiple: Boolean
})
const emit = defineEmits(['select'])

const handleClick = code => {
  emit('select', code)
}

const selectedClass = code => {
  if (Array.isArray(selected))
    return selected.includes(code) ? 'border-orange-500 ring-2 ring-orange-300' : ''
  return selected === code ? 'border-orange-500 ring-2 ring-orange-300' : ''
}
</script>

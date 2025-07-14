<template>
  <div class="space-y-2">
    <h3 class="text-md font-semibold text-gray-800 mb-1">{{ title }}</h3>
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <label
        v-for="item in items"
        :key="item.code"
        :class="[
          'relative flex flex-col items-center p-3 rounded-md border text-sm cursor-pointer transition shadow-sm',
          isSelected(item.code)
            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-300'
            : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50',
          item.disabled ? 'opacity-50 pointer-events-none' : ''
        ]"
      >
        <!-- 圖片 -->
        <img
          :src="item.img || fallbackImg"
          @error="handleImgError"
          alt="item.name"
          class="w-16 h-16 object-cover mb-1 rounded"
        />

        <!-- 名稱與加價 -->
        <span class="font-medium text-gray-800 text-center leading-tight">{{ item.name }}</span>
        <span v-if="item.extra" class="text-xs text-gray-500 mt-0.5">+{{ item.extra }} 元</span>

        <!-- 備註／介紹 -->
        <span v-if="item.note" class="text-[10px] text-gray-400 mt-0.5 text-center">
          {{ item.note }}
        </span>

        <!-- 禁用文字 -->
        <div
          v-if="item.disabled"
          class="absolute top-0 right-0 text-[10px] text-white bg-red-400 px-1.5 py-0.5 rounded-bl"
        >
          補貨中
        </div>

        <!-- input 控制（隱藏） -->
        <input
          v-if="multiple"
          type="checkbox"
          class="hidden"
          :checked="modelValue.includes(item.code)"
          @change="toggleItem(item.code)"
        />
        <input
          v-else
          type="radio"
          class="hidden"
          :checked="modelValue === item.code"
          @change="$emit('update:selected', item.code)"
        />
      </label>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { computed } from 'vue'

const props = defineProps({
  title: String,
  items: Array,
  type: String,
  multiple: Boolean,
  selected: String,
  selectedList: Array
})
const emit = defineEmits(['update:selected', 'update:selectedList'])

const fallbackImg = '/placeholder.png'

// 綁定資料
const modelValue = computed(() => (props.multiple ? props.selectedList || [] : props.selected))

// 判斷是否被選中
const isSelected = code => {
  return props.multiple ? modelValue.value.includes(code) : modelValue.value === code
}

// 多選切換
const toggleItem = code => {
  const list = [...(props.selectedList || [])]
  const idx = list.indexOf(code)
  if (idx >= 0) {
    list.splice(idx, 1)
  } else {
    list.push(code)
  }
  emit('update:selectedList', list)
}

// 圖片錯誤處理
const handleImgError = e => {
  e.target.src = fallbackImg
}
</script>

<style scoped>
input:focus + label {
  outline: 2px solid #3b82f6;
}
</style>

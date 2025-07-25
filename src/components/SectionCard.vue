<template>
  <div class="mb-4">
    <h4 class="text-sm font-semibold mb-2 text-gray-700">{{ title }}</h4>

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
        <img
          v-if="item.image"
          :src="item.image"
          alt=""
          class="w-full h-24 object-cover rounded mb-1"
          @error="handleImgError"
        />
        <div class="text-sm font-semibold text-gray-900">{{ item.name }}</div>
        <div v-if="item.note" class="text-xs text-gray-600 mt-0.5">{{ item.note }}</div>
        <div v-if="item.price > 0" class="text-xs text-orange-600 mt-0.5">
          + {{ item.price }} 元
        </div>
        <div v-if="item.disabled" class="text-xs text-red-500 mt-1">停售／補貨中</div>
      </div>
    </div>

    <!-- 展開彈窗元件 -->
    <ModalItemPreview v-if="expandedItem" :item="expandedItem" @close="expandedItem = null" />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import ModalItemPreview from './ModalItemPreview.vue'

const props = defineProps({
  title: String,
  items: Array,
  selectedCode: String,
  selectedList: Array,
  type: String
})
const emit = defineEmits(['select', 'toggle'])

const expandedItem = ref(null)

const handleClick = item => {
  if (!item || item.disabled) return

  // 展開與選取邏輯整合
  if (expandedItem.value?.code === item.code) {
    expandedItem.value = null
    // 再點一下取消選取（加點為 toggle，其他為取消）
    if (props.type === 'addon') {
      emit('toggle', item.code)
    } else if (props.selectedCode === item.code) {
      emit('select', props.type, '')
    }
  } else {
    expandedItem.value = item
    // 同時選取此品項
    if (props.type === 'addon') {
      emit('toggle', item.code)
    } else {
      emit('select', props.type, item.code)
    }
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

<style>
.card-item {
  @apply cursor-pointer border rounded-lg p-2 shadow-sm transition duration-150 bg-white;
}
.card-item:hover {
  @apply border-orange-400 shadow-md;
}
.card-item.selected {
  @apply border-orange-500 bg-orange-50 shadow-inner;
}
.card-item.disabled {
  @apply opacity-50 cursor-not-allowed bg-gray-100 border-gray-300;
}
</style>

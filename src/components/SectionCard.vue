<template>
  <div
    class="menu-card relative border rounded-md overflow-hidden shadow-sm cursor-pointer transition-all duration-300 hover:shadow-lg"
    :class="{
      'border-orange-500 ring-2 ring-orange-500': selected,
      'opacity-50 pointer-events-none': item.disabled
    }"
    @click="handleClick"
  >
    <!-- 圖片區塊（非加點類型才顯示） -->
    <img
      v-if="item.image && type !== 'addon'"
      :src="item.image"
      class="w-full h-28 object-cover"
      @error="imgError = true"
      v-show="!imgError"
    />

    <!-- 文字區塊 -->
    <div
      class="p-3 text-center"
      :class="type === 'addon' ? 'h-20 flex items-center justify-center text-base font-medium' : ''"
    >
      {{ item.name }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  item: Object,
  selected: Boolean,
  type: String // 'main' | 'drink' | 'side' | 'addon'
})

const emit = defineEmits(['click', 'preview'])
const imgError = ref(false)

function handleClick() {
  if (props.item?.disabled) return
  if (props.type === 'addon') {
    emit('click')
  } else {
    emit('preview', props.item)
  }
}
</script>

<style>
/* 響應式樣式 - 加點名稱高度統一 */
.menu-card {
  transition: all 0.3s ease;
  background-color: #fff;
}
</style>
<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <button class="modal-close" @click="$emit('close')">×</button>

      <!-- 圖片 -->
      <img v-if="item.image" :src="item.image" alt="" class="modal-image" @error="handleImgError" />

      <!-- 品名 -->
      <div class="text-xl font-bold text-gray-800 mb-2">
        {{ item.name }}
      </div>

      <!-- 加價 -->
      <div v-if="item.price > 0" class="text-sm text-orange-600 mb-1">
        加價：{{ item.price }} 元
      </div>

      <!-- 備註 -->
      <div v-if="item.note" class="text-sm text-gray-700 mb-1 whitespace-pre-line">
        {{ item.note }}
      </div>

      <!-- 介紹 -->
      <div v-if="item.description" class="text-sm text-gray-600 whitespace-pre-line">
        {{ item.description }}
      </div>

      <!-- 選擇按鈕 -->
      <button
        class="mt-4 px-4 py-2 rounded bg-orange-500 text-white hover:bg-orange-600 transition"
        @click="handleSelect"
      >
        我要這個
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ item: Object })
const emit = defineEmits(['close', 'select'])

function handleImgError(e) {
  e.target.style.display = 'none'
}

function handleSelect() {
  emit('select', props.item)
  emit('close') // ✅ 選擇後自動關閉 Modal
}
</script>

<style>
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50;
}
.modal-content {
  @apply bg-white rounded-lg shadow-xl p-4 max-w-md w-[90%] max-h-[90vh] overflow-y-auto relative;
}
.modal-close {
  @apply absolute top-2 right-2 text-gray-500 hover:text-gray-800 cursor-pointer text-xl;
}
.modal-image {
  @apply w-full h-auto object-cover rounded-lg mb-4;
  max-height: 60vh;
}
</style>

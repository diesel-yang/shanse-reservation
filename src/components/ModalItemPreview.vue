<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center"
    @click.self="close"
  >
    <div class="bg-white rounded-lg shadow-lg w-11/12 max-w-md p-4 max-h-[80vh] overflow-y-auto">
      <img
        v-if="item.image"
        :src="item.image"
        alt=""
        class="w-full h-64 object-cover rounded mb-3"
        @error="handleImgError"
      />
      <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ item.name }}</h3>
      <div v-if="item.price > 0" class="text-sm text-orange-600 mb-1">加價 {{ item.price }} 元</div>
      <div v-if="item.note" class="text-sm text-gray-700 mb-1">{{ item.note }}</div>
      <div v-if="item.description" class="text-sm text-gray-600">{{ item.description }}</div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  visible: Boolean,
  item: Object
})
const emit = defineEmits(['close'])

function close() {
  emit('close')
}
function handleImgError(e) {
  e.target.style.display = 'none'
}
</script>

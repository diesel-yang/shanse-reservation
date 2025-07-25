<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4"
    @click.self="close"
  >
    <div
      class="bg-white rounded-lg shadow-lg overflow-hidden w-full max-w-md max-h-[90vh] flex flex-col"
    >
      <button class="absolute top-2 right-3 text-gray-600 hover:text-black text-xl" @click="close">
        ×
      </button>
      <img
        :src="item?.image"
        class="w-full object-cover max-h-[60vh]"
        :alt="item?.name"
        @error="hideImage"
      />
      <div class="p-4">
        <h3 class="text-lg font-semibold text-gray-800 mb-1">{{ item?.name }}</h3>
        <div v-if="item?.price > 0" class="text-orange-600 font-medium mb-1">
          +{{ item.price }} 元
        </div>
        <div v-if="item?.description" class="text-sm text-gray-700 mb-1 whitespace-pre-line">
          {{ item.description }}
        </div>
        <div v-if="item?.note" class="text-xs text-gray-600">
          {{ item.note }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  item: Object
})
const emit = defineEmits(['close'])

function close() {
  emit('close')
}

function hideImage(e) {
  e.target.style.display = 'none'
}
</script>

<template>
  <div
    v-if="item"
    class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
    @click.self="close"
  >
    <div class="bg-white rounded-lg max-w-sm w-full p-4 shadow-lg relative">
      <button class="absolute top-2 right-2 text-gray-500 hover:text-black" @click="close">
        ✕
      </button>

      <img
        v-if="item.image"
        :src="item.image"
        alt="item image"
        class="w-full h-64 object-cover rounded mb-4"
        @error="e => (e.target.style.display = 'none')"
      />

      <div class="text-lg font-bold text-gray-800 mb-1">{{ item.name }}</div>

      <div v-if="item.price > 0" class="text-sm text-orange-600 mb-1">加價 {{ item.price }} 元</div>
      <div v-if="item.description" class="text-sm text-gray-700 mb-1">
        {{ item.description }}
      </div>
      <div v-if="item.note" class="text-sm text-gray-500">
        {{ item.note }}
      </div>

      <button
        class="mt-4 w-full py-2 rounded bg-orange-500 text-white hover:bg-orange-600 transition"
        @click="selectItem"
      >
        我要這個
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  item: Object
})
const emit = defineEmits(['close', 'select'])

function close() {
  emit('close')
}

function selectItem() {
  emit('select', props.item)
  close()
}
</script>

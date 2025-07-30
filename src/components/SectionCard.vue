<template>
  <div
    class="order-card w-full sm:w-48 md:w-44 rounded border text-center p-2 cursor-pointer shadow-sm transition-transform duration-200 hover:scale-105"
    :class="[
      selected ? 'ring-2 ring-orange-500' : 'border-gray-300',
      item.disabled ? 'opacity-50 grayscale cursor-not-allowed' : 'bg-white'
    ]"
    @click="handleClick"
  >
    <div v-if="type !== 'addon'">
      <img
        :src="item.image"
        alt="item.name"
        class="w-full h-24 object-cover rounded mb-1"
        @error="onImageError"
      />
      <div class="text-sm font-semibold truncate">{{ item.name }}</div>
      <div class="text-xs text-orange-500" v-if="item.price > 0">+{{ item.price }} 元</div>
      <div class="text-xs text-gray-500" v-if="item.note">{{ item.note }}</div>
    </div>

    <div v-else class="flex flex-col justify-center items-center h-full">
      <div class="text-sm font-medium">{{ item.name }}</div>
      <div v-if="item.price > 0" class="text-xs text-orange-500">+{{ item.price }} 元</div>
      <div v-if="item.disabled" class="text-xs text-red-600 font-semibold mt-1">補貨中</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  item: Object,
  selected: Boolean,
  type: String
})
const emit = defineEmits(['click'])

function handleClick() {
  if (!item.disabled) {
    emit('click', item)
  }
}

function onImageError(e) {
  e.target.src = '/default.png'
}
</script>

<style>
.order-card {
  transition: transform 0.2s ease;
}
.order-card:hover {
  transform: scale(1.03);
}
</style>
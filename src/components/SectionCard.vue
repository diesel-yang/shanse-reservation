<template>
  <div>
    <!-- 區塊標題 -->
    <h3 v-if="title" class="text-base font-semibold text-gray-800 mb-2">
      {{ title }}
    </h3>

    <!-- 一般品項（主餐／飲品／副餐） -->
    <div
      v-if="type !== 'addon'"
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
    >
      <div
        v-for="item in items"
        :key="item.code"
        class="cursor-pointer relative border rounded overflow-hidden shadow-sm transition"
        :class="{
          'border-orange-500 ring-2 ring-orange-300': selected === item.code,
          'opacity-50 pointer-events-none': item.disabled
        }"
        @click="onPreview(item)"
      >
        <!-- 圖片 -->
        <img
          v-if="item.image"
          :src="item.image"
          :alt="item.name"
          class="w-full h-28 object-cover"
          @error="handleImageError"
        />
        <!-- 名稱與說明 -->
        <div class="p-2 text-sm text-gray-800">
          <p class="font-semibold">
            {{ item.name }}
            <span v-if="item.price > 0" class="text-orange-600 text-xs">+{{ item.price }}元</span>
          </p>
          <p v-if="item.note" class="text-xs text-gray-500">{{ item.note }}</p>
        </div>

        <!-- 售完標籤 -->
        <div
          v-if="item.disabled"
          class="absolute top-0 left-0 right-0 bg-gray-800 bg-opacity-70 text-white text-xs text-center py-1"
        >
          售完
        </div>
      </div>
    </div>

    <!-- 加點品項（簡化樣式） -->
    <div
      v-else
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2"
    >
      <div
        v-for="item in items"
        :key="item.code"
        class="addon-card text-center text-sm border rounded py-2 cursor-pointer transition"
        :class="{
          'addon-card-selected': selectedList.includes(item.code),
          'opacity-50 pointer-events-none': item.disabled
        }"
        @click="$emit('click', item.code)"
      >
        {{ item.name }}
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  items: Array,
  selected: String, // 主餐、飲品、副餐為單選
  selectedList: {
    type: Array,
    default: () => []
  }, // 加點為多選
  type: {
    type: String,
    default: 'main' // 可為 main、drink、side、addon
  }
})

const emit = defineEmits(['click', 'preview'])

function onPreview(item) {
  if (item.disabled) return
  if (type === 'addon') {
    emit('click', item.code)
  } else {
    emit('preview', item)
  }
}

function handleImageError(e) {
  e.target.style.display = 'none'
}
</script>

<style>
.addon-card {
  @apply bg-white border-gray-300 hover:bg-orange-50 text-gray-700;
}
.addon-card-selected {
  @apply border-orange-500 text-orange-600 font-semibold bg-orange-100;
}
</style>
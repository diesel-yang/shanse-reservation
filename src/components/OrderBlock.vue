<template>
  <div>
    <!-- 主餐 -->
    <SectionCard
      title="主餐"
      :items="menu.main"
      :selectedCode="order.main"
      type="main"
      @select="selectItem('main', $event)"
    />

    <!-- 飲品 -->
    <SectionCard
      title="飲品"
      :items="menu.drink"
      :selectedCode="order.drink"
      type="drink"
      @select="selectItem('drink', $event)"
    />

    <!-- 副餐 -->
    <SectionCard
      title="副餐"
      :items="menu.side"
      :selectedCode="order.side"
      type="side"
      @select="selectItem('side', $event)"
    />

    <!-- 加點 -->
    <div class="mt-6">
      <h3 class="font-semibold text-gray-800 text-base mb-2">加點（可複選）</h3>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        <SectionCard
          v-for="item in menu.addon"
          :key="item.code"
          :item="item"
          :selected="order.addons.includes(item.code)"
          type="addon"
          @click="toggleAddon(item.code)"
          simple
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject, watch } from 'vue'
import SectionCard from './SectionCard.vue'

const props = defineProps({
  order: {
    type: Object,
    required: true
  },
  index: Number,
  hideTitle: Boolean
})

const emit = defineEmits(['update:order'])

const menu = inject('menu')

function selectItem(type, code) {
  emit('update:order', { ...props.order, [type]: code })
}

function toggleAddon(code) {
  const addons = props.order.addons || []
  const index = addons.indexOf(code)
  if (index === -1) {
    addons.push(code)
  } else {
    addons.splice(index, 1)
  }
  emit('update:order', { ...props.order, addons })
}
</script>

<style>
/* 確保卡片排版在小螢幕上也清晰可見 */
@media (max-width: 640px) {
  .grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

/* 卡片共用樣式應寫在 SectionCard.vue 中 */
</style>
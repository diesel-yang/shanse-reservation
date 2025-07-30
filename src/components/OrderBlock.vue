<template>
  <div class="space-y-6">
    <!-- 主餐 -->
    <div>
      <h3 class="text-sm font-semibold mb-2 text-gray-700">主餐</h3>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        <SectionCard
          v-for="item in menu.main"
          :key="item.code"
          :item="item"
          :selected="order.main === item.code"
          type="main"
          @preview="openPreview"
          @click="selectItem('main', item.code)"
        />
      </div>
    </div>

    <!-- 飲品 -->
    <div>
      <h3 class="text-sm font-semibold mb-2 text-gray-700">飲品</h3>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        <SectionCard
          v-for="item in menu.drink"
          :key="item.code"
          :item="item"
          :selected="order.drink === item.code"
          type="drink"
          @preview="openPreview"
          @click="selectItem('drink', item.code)"
        />
      </div>
    </div>

    <!-- 副餐 -->
    <div>
      <h3 class="text-sm font-semibold mb-2 text-gray-700">副餐</h3>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        <SectionCard
          v-for="item in menu.side"
          :key="item.code"
          :item="item"
          :selected="order.side === item.code"
          type="side"
          @preview="openPreview"
          @click="selectItem('side', item.code)"
        />
      </div>
    </div>

    <!-- 加點 -->
    <div>
      <h3 class="text-sm font-semibold mb-2 text-gray-700">加點</h3>
      <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        <SectionCard
          v-for="item in menu.addon"
          :key="item.code"
          :item="item"
          :selected="order.addons.includes(item.code)"
          type="addon"
          @click="toggleAddon(item.code)"
        />
      </div>
    </div>

    <!-- 預覽彈窗 -->
    <ModalItemPreview
      v-if="showModal"
      :item="modalItem"
      @close="closePreview"
      @select="handleSelect"
    />
  </div>
</template>

<script setup>
import { inject, ref } from 'vue'
import SectionCard from './SectionCard.vue'
import ModalItemPreview from './ModalItemPreview.vue'

const props = defineProps({
  order: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:order'])

const menu = inject('menu')

// 👉 選擇主餐、飲品、副餐
function selectItem(type, code) {
  emit('update:order', {
    ...props.order,
    [type]: code
  })
}

// 👉 切換加點
function toggleAddon(code) {
  const newAddons = [...props.order.addons]
  const i = newAddons.indexOf(code)
  if (i === -1) newAddons.push(code)
  else newAddons.splice(i, 1)

  emit('update:order', {
    ...props.order,
    addons: newAddons
  })
}

// 👉 預覽彈窗
const showModal = ref(false)
const modalItem = ref(null)

function openPreview(item) {
  modalItem.value = item
  showModal.value = true
}

function closePreview() {
  showModal.value = false
}

function handleSelect(type, code) {
  selectItem(type, code)
  closePreview()
}
</script>
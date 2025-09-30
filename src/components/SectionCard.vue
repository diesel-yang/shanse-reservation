<!-- src/components/SectionCard.vue -->
<template>
  <div class="mb-4">
    <h4 v-if="!hideTitle && title" class="text-xl font-bold text-orange-600 mb-3">
      {{ title }}
    </h4>

    <!-- 零售卡片版 -->
    <div v-if="mode === 'retail'" class="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <div
        v-for="item in filteredItems"
        :key="item.code"
        class="group relative rounded-2xl border bg-white overflow-hidden shadow-sm flex flex-col"
      >
        <!-- 售完遮罩 -->
        <div
          v-if="item.disabled"
          class="absolute inset-0 z-10 grid place-items-center bg-white/70 text-red-500 font-semibold"
        >
          售完／補貨中
        </div>

        <!-- 圖片 -->
        <button class="text-left" @click="emit('open-detail', item)" :disabled="item.disabled">
          <img
            v-if="item.image"
            :src="item.image"
            alt=""
            class="w-full h-28 object-cover"
            @error="handleImgError"
          />
        </button>

        <!-- 文字 + 加入購物車區 -->
        <div class="p-3 flex-1 flex flex-col">
          <button class="text-left" @click="emit('open-detail', item)" :disabled="item.disabled">
            <div class="text-sm font-semibold text-gray-900 line-clamp-2 min-h-[2.5rem]">
              {{ item.name }}
            </div>
            <div class="mt-1 text-base font-bold text-gray-900">
              {{ currency(item.price) }}
              <span class="text-xs text-gray-500">/ {{ item.unit || '份' }}</span>
            </div>
            <div v-if="item.note" class="mt-1 text-xs text-gray-500 line-clamp-1">
              {{ item.note }}
            </div>
          </button>

          <!-- 加入購物車區塊 -->
          <div class="mt-3">
            <!-- 未加入：黃底按鈕 -->
            <button
              v-if="!cartMap[item.code]"
              class="w-full h-10 bg-yellow-400 text-black rounded-lg font-semibold transition hover:bg-yellow-500"
              :disabled="item.disabled"
              @click.stop="onAdd(item)"
            >
              加入購物車
            </button>

            <!-- 已加入：黃底條形控制 -->
            <div
              v-else
              class="flex items-center justify-between bg-yellow-400 text-black rounded-lg px-4 h-10"
            >
              <!-- 🟧 判斷數量 =1 → 垃圾桶；>=2 → 減少 -->
              <button v-if="cartMap[item.code].qty <= 1" @click.stop="onRemove(item.code)">
                <TrashIcon class="w-5 h-5 text-red-600" />
              </button>
              <button v-else @click.stop="onDec(item.code)" class="font-bold">－</button>

              <span>{{ cartMap[item.code].qty }}</span>
              <button @click.stop="onInc(item.code)" class="font-bold">＋</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 原一般菜單版（保留） -->
    <div v-else class="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <div
        v-for="item in filteredItems"
        :key="item.code"
        @click="handleClick(item)"
        class="relative card-item"
        :class="{
          selected: isSelected(item.code),
          disabled: item.disabled,
          'as-button': type === 'addon'
        }"
      >
        <!-- ICONs -->
        <img
          v-if="item.note?.includes('限預訂') || item.note?.includes('限訂')"
          src="/icon/limited.svg"
          alt="限訂"
          class="w-12 h-12 absolute top-1 left-1 z-10"
        />
        <img
          v-else-if="item.note?.includes('熱湯')"
          src="/icon/hot-soup.svg"
          alt="熱湯"
          class="w-12 h-12 absolute top-1 left-1 z-10"
        />
        <img
          v-else-if="item.note?.includes('熱飲')"
          src="/icon/hot-drink.svg"
          alt="熱飲"
          class="w-9 h-9 absolute top-1 left-1 z-10"
        />

        <img
          v-if="type !== 'addon' && item.image"
          :src="item.image"
          alt=""
          class="w-full h-24 object-cover rounded mb-1"
          @error="handleImgError"
        />
        <div class="text-sm font-semibold text-gray-900">{{ item.name }}</div>
        <div v-if="type === 'addon' && item.price > 0" class="text-xs text-gray-800 mt-0.5">
          {{ item.price }} 元
        </div>
        <div v-if="item.disabled" class="text-xs text-red-500 mt-1">售完／補貨中</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCart } from '@/composables/useCart'
import { TrashIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  title: String,
  items: Array,
  selectedCode: String,
  selectedList: Array,
  type: String,
  mode: { type: String, default: 'menu' },
  hideTitle: { type: Boolean, default: false }
})
const emit = defineEmits(['select', 'toggle', 'preview', 'add-to-cart', 'open-detail'])

const { items: cartItems, add, inc, dec, remove } = useCart()

const cartMap = computed(() => {
  const map = {}
  for (const i of cartItems.value) {
    map[i.code] = i
  }
  return map
})

function onAdd(item) {
  if (!item || item.disabled) return
  add(item, 1)
  emit('add-to-cart', item)
}
function onInc(code) {
  const idx = cartItems.value.findIndex(i => i.code === code)
  if (idx > -1) inc(idx)
}
function onDec(code) {
  const idx = cartItems.value.findIndex(i => i.code === code)
  if (idx > -1) dec(idx)
}
function onRemove(code) {
  const idx = cartItems.value.findIndex(i => i.code === code)
  if (idx > -1) remove(idx)
}

const handleClick = item => {
  if (!item || item.disabled) return
  if (props.mode === 'retail') {
    emit('add-to-cart', item)
  } else if (props.type === 'addon') {
    emit('toggle', item.code)
  } else {
    emit('preview', item)
  }
}

const isSelected = code =>
  props.type === 'addon' ? props.selectedList?.includes(code) : props.selectedCode === code
const filteredItems = computed(() => (Array.isArray(props.items) ? props.items : []))
const currency = n => `NT$ ${Number(n || 0).toLocaleString()}`
function handleImgError(e) {
  e.target.style.display = 'none'
}
</script>

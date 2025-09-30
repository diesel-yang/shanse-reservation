<!-- src/components/SectionCard.vue -->
<template>
  <div class="mb-4">
    <h4 v-if="!hideTitle && title" class="text-xl font-bold text-orange-600 mb-3">
      {{ title }}
    </h4>

    <!-- 零售卡片版 -->
    <div v-if="mode === 'retail'" class="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <div
        v-for="(item, idx) in filteredItems"
        :key="item.code || idx"
        class="group relative rounded-2xl border bg-white overflow-hidden shadow-sm flex flex-col"
      >
        <!-- 售完遮罩 -->
        <div
          v-if="item.disabled"
          class="absolute inset-0 z-10 grid place-items-center bg-white/70 text-red-500 font-semibold"
        >
          售完／補貨中
        </div>

        <!-- 圖片（點擊開詳情） -->
        <button class="text-left" @click="emit('open-detail', item)" :disabled="item.disabled">
          <img
            v-if="item.image"
            :src="item.image"
            alt=""
            class="w-full h-28 object-cover"
            @error="handleImgError"
          />
        </button>

        <!-- 文字區（點擊開詳情） -->
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

          <!-- 底部加入購物車區：黃底 → 🗑 數字 ＋ -->
          <div class="mt-3">
            <!-- 未加入：黃底圓角大鈕 -->
            <button
              v-if="!inCart(item.code)"
              class="w-full h-10 rounded-full font-semibold transition
                     bg-[#f9d24e] text-black border border-black
                     shadow-[4px_4px_0_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0"
              :disabled="item.disabled"
              @click.stop="onAdd(item)"
            >
              加入購物車
            </button>

            <!-- 已加入：黃底條形控制（🗑 數字 ＋） -->
            <div
              v-else
              class="h-10 rounded-full bg-[#f9d24e] border border-black shadow-[4px_4px_0_rgba(0,0,0,1)]
                     flex items-center justify-between px-2"
            >
              <!-- 🗑 移除 -->
              <button
                class="px-3 py-1 rounded-full hover:bg-black/10"
                @click.stop="remove(idxOf(item.code))"
                aria-label="移除商品"
                title="移除"
              >
                🗑
              </button>

              <!-- 數量 -->
              <span class="font-semibold tabular-nums select-none">{{ qtyOf(item.code) }}</span>

              <!-- ＋ 增加 -->
              <button
                class="px-3 py-1 rounded-full hover:bg-black/10"
                @click.stop="inc(idxOf(item.code))"
                aria-label="增加數量"
                title="增加"
              >
                ＋
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 原一般菜單版（保留、不要動） -->
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

const props = defineProps({
  title: String,
  items: Array,
  selectedCode: String,
  selectedList: Array,
  type: String,
  mode: { type: String, default: 'menu' }, // 'menu' | 'retail'
  hideTitle: { type: Boolean, default: false }
})
const emit = defineEmits(['select', 'toggle', 'preview', 'add-to-cart', 'open-detail'])

/* 🟨 連動全域購物車 */
const { items: cartItems, add, inc, remove } = useCart()

/* 購物車查詢工具 */
const inCart = code => cartItems.value.some(i => i.code === code)
const qtyOf = code => cartItems.value.find(i => i.code === code)?.qty || 0
const idxOf = code => cartItems.value.findIndex(i => i.code === code)

/* 加入購


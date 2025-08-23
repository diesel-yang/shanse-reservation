<template>
  <!-- 避免被 FloatingNav 擋住 -->
  <div class="max-w-3xl mx-auto px-4 py-6" :style="pagePadStyle">
    <!-- 頂部：LOGO + 類別切換 -->
    <header class="mb-4">
      <div class="flex items-center justify-between">
        <img src="/icon/shane-logo-orange.svg" alt="山色" class="h-8" />
      </div>
    </header>

    <!-- 類別切換 -->
    <nav class="flex gap-2 mb-4">
      <button :class="tabBtn('frozen')" @click="tab = 'frozen'">冷凍即食</button>
      <button :class="tabBtn('dessert')" @click="tab = 'dessert'">甜點</button>
    </nav>

    <!-- 載入骨架（配合 App.provide 的 retailLoading） -->
    <div v-if="retailLoading?.value" class="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <div v-for="i in 6" :key="i" class="p-4 rounded-2xl border bg-white overflow-hidden">
        <div class="shimmer h-40 rounded-xl mb-3"></div>
        <div class="shimmer h-4 w-3/4 rounded mb-2"></div>
        <div class="shimmer h-4 w-1/2 rounded mb-4"></div>
        <div class="shimmer h-10 rounded-xl"></div>
      </div>
    </div>

    <!-- 商品清單（title 傳空字串 => 不顯示「冷凍即食 / 甜點」字樣） -->
    <SectionCard
      v-else-if="groups.items.length"
      title=""
      :items="displayItems"
      :selectedList="[]"
      type="addon"
      mode="retail"
      @add-to-cart="addToCart"
      @open-detail="openDetail"
    />
    <div v-else class="text-center text-gray-500 py-10">目前沒有可販售商品</div>

    <!-- 浮動購物車 -->
    <div
      v-if="cartCount > 0"
      class="fixed left-1/2 -translate-x-1/2 w-[95%] max-w-3xl drop-shadow-xl z-40"
      :style="cartBarStyle"
    >
      <div class="bg-black text-white rounded-full flex items-center justify-between px-4 py-3">
        <div class="flex items-center gap-3">
          <span class="text-sm">{{ cartCount }} 件</span>
          <span class="opacity-60">｜</span>
          <span class="font-semibold">{{ currency(subtotal) }}</span>
        </div>
        <div class="flex items-center gap-2">
          <button class="text-xs underline opacity-80" @click="openCart = !openCart">
            {{ openCart ? '收合' : '展開' }}
          </button>
          <button class="bg-white text-black rounded-full px-4 py-2" @click="openCheckout = true">
            結帳
          </button>
        </div>
      </div>

      <div v-if="openCart" class="mt-2 bg-white rounded-2xl border p-3 max-h-72 overflow-auto">
        <div
          v-for="(c, idx) in cart"
          :key="c.code + '-' + idx"
          class="flex items-center justify-between py-2 border-b last:border-b-0"
        >
          <div class="min-w-0">
            <div class="font-medium truncate">{{ c.name }}</div>
            <div class="text-xs text-gray-500">{{ currency(c.price) }} / {{ c.unit || '份' }}</div>
          </div>
          <div class="flex items-center gap-2">
            <button class="px-2 py-1 border rounded" @click="dec(idx)" :disabled="c.qty <= 1">
              －
            </button>
            <span class="w-6 text-center">{{ c.qty }}</span>
            <button class="px-2 py-1 border rounded" @click="inc(idx)">＋</button>
            <button class="ml-2 text-xs text-red-500 underline" @click="remove(idx)">移除</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 結帳 -->
    <ModalCheckout
      v-if="openCheckout"
      :cart="cart"
      :subtotal="subtotal"
      :earliest-pickup-date="earliestPickupDate"
      @close="openCheckout = false"
      @submit="submitOrder"
    />

    <!-- 商品詳情（Bottom Sheet） -->
    <transition name="fade">
      <div v-if="detailItem" class="fixed inset-0 z-[60]">
        <!-- 遮罩 -->
        <div class="absolute inset-0 bg-black/50" @click="closeDetail"></div>

        <!-- 內容 -->
        <div
          class="absolute left-0 right-0 bottom-0 md:left-1/2 md:-translate-x-1/2 md:bottom-auto md:top-1/2 md:-translate-y-1/2 w-full md:w-[720px] bg-white rounded-t-3xl md:rounded-2xl overflow-hidden max-h-[85vh] flex flex-col"
        >
          <!-- 標題列 -->
          <div class="px-5 py-4 border-b flex items-center justify-between">
            <h3 class="text-lg font-semibold leading-snug">{{ detailItem?.name }}</h3>
            <button class="text-gray-500 hover:text-black" @click="closeDetail">✕</button>
          </div>

          <!-- 可滾動內容 -->
          <div class="flex-1 overflow-y-auto">
            <img
              v-if="detailImage"
              :src="detailImage"
              alt=""
              class="w-full max-h-[360px] object-cover"
              @error="onDetailImgError"
            />
            <div
              v-if="detailItem?.description"
              class="px-5 py-4 text-[15px] leading-relaxed text-gray-800 whitespace-pre-line"
            >
              {{ detailItem.description }}
            </div>
          </div>

          <!-- 底部操作列 -->
          <div class="border-t px-5 py-4">
            <div class="flex items-center justify-between">
              <!-- 價錢（不顯示 NT$） -->
              <div class="text-xl font-bold text-gray-900">
                {{ Number(detailItem?.price || 0).toLocaleString() }}
                <span class="text-xs text-gray-500 ml-1">/ {{ detailItem?.unit || '份' }}</span>
              </div>

              <!-- 數量進步器（在價錢右邊） -->
              <div class="flex items-center gap-2">
                <button
                  class="w-9 h-9 border rounded"
                  @click="detailQty = Math.max(1, detailQty - 1)"
                >
                  －
                </button>
                <span class="w-6 text-center">{{ detailQty }}</span>
                <button class="w-9 h-9 border rounded" @click="detailQty++">＋</button>
              </div>
            </div>

            <button
              class="mt-3 w-full h-12 rounded-xl font-semibold text-white transition-colors"
              :class="detailAdded ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'"
              @click="addDetailToCart"
            >
              {{ detailAdded ? '✓ 已加入購物車' : '加入購物車' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- spacer，避免被 FloatingNav 擋住 -->
    <div aria-hidden="true" :style="bottomSpacerStyle"></div>
  </div>
</template>

<script setup>
import { inject, ref, computed } from 'vue'
import SectionCard from '@/components/SectionCard.vue'
import ModalCheckout from '@/components/ModalCheckout.vue'
import { gasPost } from '@/utils/gas'

/** 讓購物車浮在導航列上方 8px，並吃到 iOS 安全區 */
const cartBarStyle = {
  bottom: 'calc(env(safe-area-inset-bottom, 0px) + var(--nav-height, 100px) + 8px)'
}
/** 頁面底部預留空間（避免最後一排內容被擋） */
const bottomSpacerStyle = {
  height: 'calc(env(safe-area-inset-bottom, 0px) + var(--nav-height, 100px) + 12px)'
}
/** 與 Menu.vue 同步：底部留白用 CSS 變數 */
const pagePadStyle = { 'padding-bottom': 'var(--nav-height, 100px)' }

/** 由 App.vue 注入的資料與載入旗標 */
const providedRetail = inject('retail', { frozen: [], dessert: [] })
const retailLoading = inject('retailLoading', ref(false))

/** 類別切換 */
const tab = ref('frozen')
const groups = computed(() => ({
  title: tab.value === 'frozen' ? '冷凍即食' : '甜點',
  items: providedRetail?.[tab.value] || []
}))
const displayItems = computed(() =>
  (groups.value.items || []).map(i => ({
    ...i,
    disabled: Boolean(i.stop || Number(i.stock ?? 0) <= 0)
  }))
)

/** 購物車邏輯 */
const cart = ref([])
const openCart = ref(false)
const openCheckout = ref(false)

const cartCount = computed(() => cart.value.reduce((s, i) => s + i.qty, 0))
const subtotal = computed(() => cart.value.reduce((s, i) => s + i.qty * Number(i.price || 0), 0))

const addToCart = item => {
  if (!item || item.disabled) return
  const idx = cart.value.findIndex(x => x.code === item.code)
  if (idx > -1) cart.value[idx].qty++
  else
    cart.value.push({
      code: item.code,
      name: item.name,
      price: Number(item.price || 0),
      qty: 1,
      unit: item.unit || '份',
      lead_days: Number(item.lead_days || 0)
    })
}
const inc = idx => cart.value[idx].qty++
const dec = idx => {
  if (cart.value[idx].qty > 1) cart.value[idx].qty--
}
const remove = idx => cart.value.splice(idx, 1)

/** 最早可取貨日（依購物車最大前置天數） */
const earliestPickupDate = computed(() => {
  const maxLead = cart.value.reduce((m, i) => Math.max(m, Number(i.lead_days || 0)), 0)
  const d = new Date()
  d.setDate(d.getDate() + maxLead)
  return d
})

/** 送出零售訂單（打 GAS） */
function toYMDLocal(dateLike) {
  let d
  if (!dateLike) d = new Date()
  else if (dateLike instanceof Date) d = new Date(dateLike.getTime())
  else d = new Date(dateLike)
  if (isNaN(d)) {
    const m = String(dateLike)
      .trim()
      .match(/^(\d{4})[./-](\d{1,2})[./-](\d{1,2})$/)
    if (m) d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  }
  if (isNaN(d)) d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
const currency = n => `NT$ ${Number(n || 0).toLocaleString()}`

async function submitOrder({ customer }) {
  const items = cart.value.map(i => ({
    code: i.code,
    name: i.name,
    price: Number(i.price || 0),
    qty: Number(i.qty || 1),
    unit: i.unit || '份'
  }))
  const subtotalNum = Number(subtotal.value || 0)
  const shippingNum = customer?.method === '宅配' ? 160 : 0
  const totalNum = subtotalNum + shippingNum
  const pickupYmd = toYMDLocal(customer?.pickup_date || earliestPickupDate.value)

  const out = await gasPost({
    type: 'retailOrder',
    name: customer?.name || '',
    phone: customer?.phone || '',
    method: customer?.method || '自取',
    pickup_date: pickupYmd,
    note: customer?.note || '',
    items: JSON.stringify(items),
    subtotal: String(subtotalNum),
    shipping: String(shippingNum),
    total: String(totalNum)
  })

  if (out?.result === 'success') {
    alert(`下單成功！訂單編號：${out.orderId}`)
    cart.value = []
    openCart.value = false
    openCheckout.value = false
  } else {
    alert('下單失敗，請稍後再試。')
  }
}

/* ====== 詳情視窗 ====== */
const detailItem = ref(null)
const detailQty = ref(1)
const detailAdded = ref(false)

const detailImage = computed(() => {
  if (!detailItem.value) return ''
  // 支援多張圖陣列 images；沒有就用 image
  const imgs = Array.isArray(detailItem.value.images)
    ? detailItem.value.images
    : detailItem.value.image
      ? [detailItem.value.image]
      : []
  return imgs[0] || ''
})

function openDetail(item) {
  if (!item) return
  detailItem.value = item
  detailQty.value = 1
  detailAdded.value = false
}
function closeDetail() {
  detailItem.value = null
}
function onDetailImgError(e) {
  e.target.style.display = 'none'
}

function addDetailToCart() {
  if (!detailItem.value) return
  for (let i = 0; i < detailQty.value; i++) addToCart(detailItem.value)
  detailAdded.value = true
  // 5 秒後恢復藍色（可自行決定是否自動關閉）
  setTimeout(() => (detailAdded.value = false), 5000)
}
</script>

<style scoped>
/* shimmer 骨架 */
.shimmer {
  position: relative;
  overflow: hidden;
  background: #f3f4f6;
}
.shimmer::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
  animation: shimmer 1.2s infinite;
}
@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

/* 詳情淡入 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

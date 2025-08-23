<template>
  <!-- 整頁容器，底部墊高避免被 FloatingNav 蓋住 -->
  <div class="max-w-3xl mx-auto px-4 py-6" :style="pagePadStyle">
    <!-- 頁首：LOGO + 分頁 -->
    <header class="mb-4">
      <div class="flex items-center gap-3 mb-3">
        <img src="/icon/shane-logo-orange.svg" alt="山色" class="w-8 h-8" />
        <h1 class="text-2xl font-bold">零售商店</h1>
      </div>
      <nav class="flex gap-2">
        <button :class="tabBtn('frozen')" @click="tab = 'frozen'">冷凍即食</button>
        <button :class="tabBtn('dessert')" @click="tab = 'dessert'">甜點</button>
      </nav>
    </header>

    <!-- 骨架（沿用 retailLoading） -->
    <div v-if="retailLoading?.value" class="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <div v-for="i in 6" :key="i" class="rounded-2xl border bg-white overflow-hidden p-3">
        <div class="shimmer h-28 rounded-xl mb-3"></div>
        <div class="shimmer h-4 w-3/4 rounded mb-2"></div>
        <div class="shimmer h-4 w-1/2 rounded mb-3"></div>
        <div class="shimmer h-10 w-full rounded"></div>
      </div>
    </div>

    <!-- 商品清單 -->
    <SectionCard
      v-else
      :title="groups.title"
      :items="displayItems"
      mode="retail"
      @add-to-cart="addToCart"
      @open-detail="openDetail"
    />

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

    <!-- 結帳視窗 -->
    <ModalCheckout
      v-if="openCheckout"
      :cart="cart"
      :subtotal="subtotal"
      :earliest-pickup-date="earliestPickupDate"
      @close="openCheckout = false"
      @submit="submitOrder"
    />

    <!-- 商品詳情視窗 -->
    <transition name="fade">
      <div v-if="detail" class="fixed left-0 right-0 top-0 bottom-0 z-[60]">
        <!-- 遮罩 -->
        <div class="absolute inset-0 bg-black/50" @click="closeDetail"></div>

        <!-- 內容：可滾動 + 底部固定操作列；rounded-none -->
        <div
          class="absolute left-1/2 -translate-x-1/2 w-[95%] max-w-3xl top-6 bottom-6 bg-white rounded-none shadow-xl flex flex-col"
        >
          <!-- 標題列 -->
          <div class="px-5 py-4 border-b flex items-center justify-between">
            <h2 class="text-lg font-semibold truncate">{{ detail.name }}</h2>
            <button class="text-gray-500 hover:text-black" @click="closeDetail">✕</button>
          </div>

          <!-- 內容可捲動 -->
          <div class="flex-1 overflow-auto">
            <div v-if="detail.image" class="aspect-[16/10] w-full overflow-hidden">
              <img :src="detail.image" alt="" class="w-full h-full object-cover" />
            </div>
            <div class="px-5 py-4 space-y-3">
              <div class="text-sm text-gray-700 whitespace-pre-line">
                {{ detail.description || detail.note || '' }}
              </div>
            </div>
          </div>

          <!-- 底部操作列（固定） -->
          <div class="border-t px-5 py-3">
            <div class="flex items-center justify-between gap-3">
              <!-- 價格（無 NT 前綴） -->
              <div class="text-xl font-semibold shrink-0">
                {{ Number(detail.price || 0).toLocaleString() }}
                <span class="text-xs text-gray-500">/ {{ detail.unit || '份' }}</span>
              </div>

              <!-- 數量進步器（在價格右側） -->
              <div class="flex items-center gap-2">
                <button
                  class="w-10 h-10 rounded border"
                  @click="detailQty = Math.max(1, detailQty - 1)"
                >
                  －
                </button>
                <span class="w-8 text-center">{{ detailQty }}</span>
                <button class="w-10 h-10 rounded border" @click="detailQty++">＋</button>
              </div>

              <!-- 加入按鈕 -->
              <button
                class="flex-1 h-12 rounded-lg font-semibold transition"
                :class="
                  detailJoined
                    ? 'bg-green-600 text-white'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                "
                @click="addDetailToCart"
              >
                {{ detailJoined ? '✓ 已加入購物車' : '加入購物車' }}
              </button>
            </div>
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

/** --- 版面微調：底部留白配合 FloatingNav --- */
const cartBarStyle = {
  bottom: 'calc(env(safe-area-inset-bottom, 0px) + var(--nav-height, 100px) + 8px)'
}
const bottomSpacerStyle = {
  height: 'calc(env(safe-area-inset-bottom, 0px) + var(--nav-height, 100px) + 12px)'
}
const pagePadStyle = { 'padding-bottom': 'var(--nav-height, 100px)' }

/** --- 由 App.vue 注入資料 --- */
const providedRetail = inject('retail', { frozen: [], dessert: [] })
const retailLoading = inject('retailLoading', ref(false))

/** --- 類別切換 --- */
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

/** --- 購物車 --- */
const cart = ref([])
const openCart = ref(false)
const openCheckout = ref(false)

const cartCount = computed(() => cart.value.reduce((s, i) => s + i.qty, 0))
const subtotal = computed(() => cart.value.reduce((s, i) => s + i.qty * Number(i.price || 0), 0))

function addToCart(item, qty = 1) {
  if (!item || item.disabled) return
  const n = Math.max(1, Number(qty || 1))
  const idx = cart.value.findIndex(x => x.code === item.code)
  if (idx > -1) cart.value[idx].qty += n
  else
    cart.value.push({
      code: item.code,
      name: item.name,
      price: Number(item.price || 0),
      qty: n,
      unit: item.unit || '份',
      lead_days: Number(item.lead_days || 0)
    })
}
const inc = idx => cart.value[idx].qty++
const dec = idx => (cart.value[idx].qty = Math.max(1, cart.value[idx].qty - 1))
const remove = idx => cart.value.splice(idx, 1)

/** --- 最早可取貨日（依購物車最大前置天數） --- */
const earliestPickupDate = computed(() => {
  const maxLead = cart.value.reduce((m, i) => Math.max(m, Number(i.lead_days || 0)), 0)
  const d = new Date()
  d.setDate(d.getDate() + maxLead)
  return d
})

/** --- 工具 --- */
const currency = n => `NT$ ${Number(n || 0).toLocaleString()}`
const tabBtn = t =>
  `px-3 py-1 rounded-full border ${tab.value === t ? 'bg-black text-white border-black' : 'bg-white text-black'}`

/** --- 商品詳情視窗邏輯 --- */
const detail = ref(null) // 目前開啟的商品
const detailQty = ref(1)
const detailJoined = ref(false)
let detailTimer = null

function openDetail(item) {
  if (!item) return
  detail.value = item
  detailQty.value = 1
  detailJoined.value = false
  if (detailTimer) {
    clearTimeout(detailTimer)
    detailTimer = null
  }
}
function closeDetail() {
  detail.value = null
  if (detailTimer) {
    clearTimeout(detailTimer)
    detailTimer = null
  }
}
function addDetailToCart() {
  if (!detail.value) return
  addToCart(detail.value, detailQty.value)
  detailJoined.value = true
  if (detailTimer) clearTimeout(detailTimer)
  detailTimer = setTimeout(() => (detailJoined.value = false), 5000)
}

/** --- 送單（GAS） --- */
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
    address: customer?.address || '',
    payment_method: customer?.payment_method || '到店/貨到',
    bank_ref: customer?.bank_ref || '',
    note: customer?.note || '',
    items: JSON.stringify(items),
    subtotal: String(subtotalNum),
    shipping: String(shippingNum),
    total: String(totalNum)
  })

  if (out?.result === 'success') {
    if (customer?.payment_method === '轉帳匯款') {
      alert(
        `下單成功！訂單編號：${out.orderId}\n\n請於 24 小時內完成匯款：\n玉山銀行（808） 1234-567-890123\n戶名：山色有限公司\n\n完成後請回填匯款後五碼：${customer?.bank_ref || '（尚未填寫）'}`
      )
    } else {
      alert(`下單成功！訂單編號：${out.orderId}`)
    }
    cart.value = []
    openCart.value = false
    openCheckout.value = false
  } else {
    alert('下單失敗，請稍後再試。')
  }
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

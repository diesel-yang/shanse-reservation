<!-- src/views/Retail.vue -->
<template>
  <div class="max-w-3xl mx-auto px-4 py-6" :style="pagePadStyle">
    <!-- 標題 -->
    <header class="mb-4">
      <h1 class="text-2xl font-bold">零售商店</h1>
      <p class="text-sm text-gray-500">冷凍即食品與甜點，可到店自取或宅配</p>
    </header>

    <!-- 分類切換 -->
    <nav class="flex gap-2 mb-4">
      <button :class="tabBtn('frozen')" @click="tab = 'frozen'">冷凍即食</button>
      <button :class="tabBtn('dessert')" @click="tab = 'dessert'">甜點</button>
    </nav>

    <!-- 骨架（loading 狀態） -->
    <div v-if="retailLoading?.value" class="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <div v-for="i in 6" :key="'sk-' + i" class="skeleton">
        <div class="sk-img shimmer"></div>
        <div class="sk-line shimmer"></div>
        <div class="sk-line short shimmer"></div>
      </div>
    </div>

    <!-- 商品卡 -->
    <SectionCard
      v-else-if="groups.items.length"
      :title="groups.title"
      :items="displayItems"
      :selectedList="[]"
      type="addon"
      mode="retail"
      @add-to-cart="addToCart"
    />
    <div v-else class="text-center text-gray-500 py-10">目前沒有可販售商品</div>

    <!-- 浮動購物車列 -->
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

      <!-- 展開購物車明細 -->
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

    <!-- 結帳視窗（支援內層滾動 + sticky 送出鈕，見你的 ModalCheckout.vue） -->
    <ModalCheckout
      v-if="openCheckout"
      :cart="cart"
      :subtotal="subtotal"
      :earliest-pickup-date="earliestPickupDate"
      @close="openCheckout = false"
      @submit="submitOrder"
    />

    <!-- spacer，避免被 FloatingNav 擋住 -->
    <div aria-hidden="true" :style="bottomSpacerStyle"></div>
  </div>
</template>

<script setup>
import { inject, ref, computed } from 'vue'
import SectionCard from '@/components/SectionCard.vue'
import ModalCheckout from '@/components/ModalCheckout.vue'
import { gasPost } from '@/utils/gas'

/* 讓購物車列浮在底部導覽列上緣 +8px，並吃到 iOS 安全區 */
const cartBarStyle = {
  bottom: 'calc(env(safe-area-inset-bottom, 0px) + var(--nav-height, 100px) + 8px)'
}
/* 頁面底部預留空間（避免最後一排被擋） */
const bottomSpacerStyle = {
  height: 'calc(env(safe-area-inset-bottom, 0px) + var(--nav-height, 100px) + 12px)'
}
/* 與 Menu.vue 同步：頁面底部用 CSS 變數控制留白 */
const pagePadStyle = { 'padding-bottom': 'var(--nav-height, 100px)' }

/** 直接使用 App.vue 提供的零售資料與載入旗標 */
const providedRetail = inject('retail', { frozen: [], dessert: [] })
const retailLoading = inject('retailLoading', ref(false))
const tab = ref('frozen')

/** 顯示用集合 */
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

/** 購物車狀態 */
const cart = ref([])
const openCart = ref(false)
const openCheckout = ref(false)

const cartCount = computed(() => cart.value.reduce((s, i) => s + i.qty, 0))
const subtotal = computed(() => cart.value.reduce((s, i) => s + i.qty * Number(i.price || 0), 0))

/** 加入購物車 */
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
const inc = idx => {
  cart.value[idx].qty++
}
const dec = idx => {
  if (cart.value[idx].qty > 1) cart.value[idx].qty--
}
const remove = idx => {
  cart.value.splice(idx, 1)
}

/** 最早可取貨日（回傳真正的 Date，避免 toISOString 錯誤） */
const earliestPickupDate = computed(() => {
  const maxLead = cart.value.reduce((m, i) => Math.max(m, Number(i.lead_days || 0)), 0)
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + maxLead)
  return d
})

/** UI 小工具 */
const tabBtn = t =>
  `px-3 py-1 rounded-full border ${tab.value === t ? 'bg-black text-white border-black' : 'bg-white text-black'}`
const currency = n => `NT$ ${Number(n || 0).toLocaleString()}`

/** 送出零售訂單（打 GAS）— 與 ModalCheckout 的 @submit 對齊 */
async function submitOrder({ customer }) {
  if (!Array.isArray(cart.value) || cart.value.length === 0) {
    alert('購物車是空的')
    return
  }

  const items = cart.value.map(i => ({
    code: i.code,
    name: i.name,
    price: Number(i.price || 0),
    qty: Number(i.qty || 1),
    unit: i.unit || '份'
  }))
  const subtotalNum = Number(subtotal.value || 0)
  const isDelivery = (customer?.method || '') === '宅配'
  const shippingNum = isDelivery ? 160 : 0

  try {
    const res = await gasPost({
      type: 'retailOrder',
      name: customer?.name || '',
      phone: customer?.phone || '',
      method: isDelivery ? '宅配' : '自取',
      pickup_date: customer?.pickup_date || earliestPickupDate.value.toISOString().slice(0, 10), // 保證 earliestPickupDate 是 Date
      address: customer?.address || '',
      note: customer?.note || '',
      items: JSON.stringify(items),
      subtotal: String(subtotalNum),
      shipping: String(shippingNum),
      total: String(subtotalNum + shippingNum)
    })

    if (res?.result === 'success') {
      alert(`下單成功！訂單編號：${res.orderId || ''}`)
      cart.value = []
      openCart.value = false
      openCheckout.value = false
    } else {
      alert('下單失敗，請稍後再試。')
    }
  } catch (err) {
    console.error('零售下單錯誤：', err)
    alert('送單發生錯誤，請稍後再試。')
  }
}
</script>

<style scoped>
/* 骨架樣式（含簡單 shimmer） */
.skeleton {
  @apply border rounded p-3 bg-white;
}
.sk-img {
  @apply w-full h-24 rounded mb-2 bg-gray-200;
}
.sk-line {
  @apply h-3 rounded bg-gray-200 mb-2;
}
.sk-line.short {
  @apply w-1/2;
}
.shimmer {
  position: relative;
  overflow: hidden;
}
.shimmer::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.55), transparent);
  animation: shimmer 1.2s infinite;
}
@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
</style>

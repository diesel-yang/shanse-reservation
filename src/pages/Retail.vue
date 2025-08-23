<template>
  <!-- 避免被 FloatingNav 擋住 -->
  <div class="max-w-3xl mx-auto px-4 py-6" :style="pagePadStyle">
    <!-- 頂部：品牌 Logo 與標題 -->
    <header class="mb-4 flex items-center gap-3">
      <img src="/icon/shane-logo-orange.svg" alt="山色" class="w-10 h-10 object-contain" />
      <h1 class="text-2xl font-bold">零售商店</h1>
      <!-- ✂️ 移除副標 -->
    </header>

    <!-- 類別切換 -->
    <nav class="flex gap-2 mb-4">
      <button :class="tabBtn('frozen')" @click="tab = 'frozen'">冷凍即食</button>
      <button :class="tabBtn('dessert')" @click="tab = 'dessert'">甜點</button>
    </nav>

    <!-- 載入骨架（配合 App.provide 的 retailLoading） -->
    <div v-if="retailLoading?.value" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div v-for="i in 4" :key="i" class="p-4 rounded-2xl border bg-white overflow-hidden">
        <div class="shimmer h-32 rounded-xl mb-3"></div>
        <div class="shimmer h-4 w-3/4 rounded mb-2"></div>
        <div class="shimmer h-4 w-1/2 rounded mb-4"></div>
        <div class="flex gap-2">
          <div class="shimmer h-10 w-28 rounded-lg"></div>
        </div>
      </div>
    </div>

    <!-- 商品清單 -->
    <div v-else>
      <!-- ✂️ 移除大標題：冷凍即食/甜點 -->

      <div v-if="displayItems.length" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <article
          v-for="it in displayItems"
          :key="it.code"
          class="p-4 rounded-2xl border bg-white overflow-hidden cursor-pointer group"
          @click="openItem(it)"
        >
          <div class="relative">
            <img
              :src="firstImage(it)"
              alt=""
              class="w-full h-40 object-cover rounded-xl mb-3"
              loading="lazy"
            />
            <div
              v-if="it.disabled"
              class="absolute inset-0 bg-white/70 rounded-xl flex items-center justify-center text-red-500 font-semibold text-lg"
            >
              售完 / 補貨中
            </div>
          </div>

          <div class="min-h-[3.5rem]">
            <h3 class="font-semibold leading-snug line-clamp-2">
              {{ it.name }}
            </h3>
          </div>
          <div class="text-gray-500 text-sm mb-3">
            {{ it.note || it.description || '' }}
          </div>

          <div class="flex items-center justify-between">
            <div class="text-lg font-semibold">{{ currency(it.price) }}</div>

            <!-- 加入購物車按鈕（卡片上的） -->
            <button
              class="px-3 h-10 rounded-lg text-white text-sm font-medium transition-colors"
              :class="
                inCart(it.code)
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              "
              :disabled="it.disabled"
              @click.stop="quickAdd(it)"
            >
              <span v-if="inCart(it.code)">✓ 已加入</span>
              <span v-else>加入購物車</span>
            </button>
          </div>
        </article>
      </div>

      <div v-else class="text-center text-gray-500 py-10">目前沒有可販售商品</div>
    </div>

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

    <!-- 商品視窗 -->
    <ItemModal
      v-if="active"
      :item="active"
      :in-cart="inCart(active.code)"
      @close="active = null"
      @add="addWithQty"
    />

    <!-- 結帳 -->
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
import { inject, ref, computed, defineComponent } from 'vue'
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
const items = computed(() => providedRetail?.[tab.value] || [])
const displayItems = computed(() =>
  (items.value || []).map(i => ({
    ...i,
    disabled: Boolean(i.stop || Number(i.stock ?? 0) <= 0)
  }))
)

/** 工具 */
const currency = n => `NT$ ${Number(n || 0).toLocaleString()}`
const firstImage = it => {
  if (Array.isArray(it.image) && it.image.length) return it.image[0]
  if (typeof it.image === 'string' && it.image.trim()) {
    const parts = it.image.split(',').map(s => s.trim()).filter(Boolean)
    return parts[0] || '/placeholder.png'
  }
  return '/placeholder.png'
}

/** UI：tab 按鈕 */
const tabBtn = t =>
  `px-3 py-1 rounded-full border ${tab.value === t ? 'bg-black text-white border-black' : 'bg-white text-black'}`

/** 購物車邏輯 */
const cart = ref([])
const openCart = ref(false)
const openCheckout = ref(false)
const active = ref(null) // 目前打開詳情視窗的商品

const inCart = code => cart.value.some(i => i.code === code)
const cartCount = computed(() => cart.value.reduce((s, i) => s + i.qty, 0))
const subtotal = computed(() => cart.value.reduce((s, i) => s + i.qty * Number(i.price || 0), 0))

const quickAdd = item => {
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

const addWithQty = ({ item, qty }) => {
  if (!item || item.disabled || !qty) return
  const idx = cart.value.findIndex(x => x.code === item.code)
  if (idx > -1) cart.value[idx].qty += qty
  else
    cart.value.push({
      code: item.code,
      name: item.name,
      price: Number(item.price || 0),
      qty: qty,
      unit: item.unit || '份',
      lead_days: Number(item.lead_days || 0)
    })
}

const inc = idx => (cart.value[idx].qty++)
const dec = idx => { if (cart.value[idx].qty > 1) cart.value[idx].qty-- }
const remove = idx => cart.value.splice(idx, 1)

const openItem = it => { active.value = it }

/** 最早可取貨日（依購物車最大前置天數） */
const earliestPickupDate = computed(() => {
  const maxLead = cart.value.reduce((m, i) => Math.max(m, Number(i.lead_days || 0)), 0)
  const d = new Date()
  d.setDate(d.getDate() + maxLead)
  return d
})

/** 把任何輸入轉成 yyyy-mm-dd（本地時區） */
function toYMDLocal(dateLike) {
  let d
  if (!dateLike) d = new Date()
  else if (dateLike instanceof Date) d = new Date(dateLike.getTime())
  else d = new Date(dateLike)
  if (isNaN(d)) {
    const m = String(dateLike).trim().match(/^(\d{4})[./-](\d{1,2})[./-](\d{1,2})$/)
    if (m) d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  }
  if (isNaN(d)) d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** 送出零售訂單（打 GAS） */
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

/** ========== 內部元件：商品詳情視窗 ========== */
const ItemModal = defineComponent({
  name: 'ItemModal',
  props: {
    item: { type: Object, required: true },
    inCart: { type: Boolean, default: false }
  },
  emits: ['close', 'add'],
  setup(props, { emit }) {
    const qty = ref(1)
    const imgs = computed(() => {
      const v = props.item?.image
      if (Array.isArray(v)) return v.filter(Boolean)
      if (typeof v === 'string') return v.split(',').map(s => s.trim()).filter(Boolean)
      return []
    })
    const idx = ref(0)
    const show = src => (idx.value = Math.max(0, imgs.value.indexOf(src)))
    const next = () => (idx.value = (idx.value + 1) % Math.max(imgs.value.length || 1, 1))
    const prev = () => (idx.value = (idx.value - 1 + Math.max(imgs.value.length || 1, 1)) % Math.max(imgs.value.length || 1, 1))

    const add = () => emit('add', { item: props.item, qty: qty.value })

    return () => (
      <div class="fixed inset-0 z-50">
        <div class="absolute inset-0 bg-black/50" onClick={() => emit('close')}></div>

        <!-- 覆蓋層：貼齊底邊，無圓角 -->
        <div class="absolute left-0 right-0 bottom-0 w-full">
          <div class="bg-white rounded-none overflow-hidden shadow-xl max-h-[90vh] flex flex-col">
            <!-- 標題列 -->
            <div class="px-5 py-4 border-b flex items-center justify-between">
              <h2 class="text-lg font-semibold">{ props.item?.name || '商品' }</h2>
              <button class="text-gray-500 hover:text-black" onClick={() => emit('close')}>✕</button>
            </div>

            <!-- 內容 -->
            <div class="flex-1 overflow-y-auto p-5 grid md:grid-cols-2 gap-6">
              <!-- 相片 -->
              <div>
                <div class="relative">
                  <img
                    src={ imgs.value[idx.value] || '/placeholder.png' }
                    alt=""
                    class="w-full h-64 object-cover rounded-xl"
                  />
                  <button class="absolute inset-y-0 left-2 my-auto bg-black/50 text-white rounded-full w-8 h-8" onClick={prev}>‹</button>
                  <button class="absolute inset-y-0 right-2 my-auto bg-black/50 text-white rounded-full w-8 h-8" onClick={next}>›</button>
                </div>
                <div class="mt-3 flex gap-2 overflow-x-auto">
                  { imgs.value.map(src => (
                    <img
                      src={src}
                      class={'w-16 h-16 object-cover rounded-md border ' + (src === imgs.value[idx.value] ? 'border-black' : 'border-transparent')}
                      onClick={() => show(src)}
                    />
                  )) }
                </div>
              </div>

              <!-- 資訊 -->
              <div class="space-y-4">
                <div class="text-2xl font-semibold">{ `NT$ ${Number(props.item?.price || 0).toLocaleString()}` }</div>
                <p class="text-gray-600 whitespace-pre-line">{ props.item?.description || props.item?.note || '' }</p>

                <!-- 數量 -->
                <div class="flex items-center gap-3">
                  <span class="text-sm text-gray-600">數量</span>
                  <button class="px-2 py-1 border rounded" onClick={() => qty.value = Math.max(1, qty.value - 1)}>－</button>
                  <span class="w-8 text-center">{ qty.value }</span>
                  <button class="px-2 py-1 border rounded" onClick={() => qty.value++}>＋</button>
                </div>

                <!-- 加入按鈕 -->
                <button
                  class={'w-full h-11 rounded-lg text-white font-medium ' + (props.inCart ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700')}
                  onClick={add}
                >
                  { props.inCart ? '✓ 已加入購物車' : '加入購物車' }
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
})
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
</style>

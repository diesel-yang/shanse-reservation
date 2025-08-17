<template>
  <div class="max-w-3xl mx-auto px-4 py-6">
    <!-- 標題 -->
    <header class="mb-4">
      <h1 class="text-2xl font-bold">零售商店</h1>
      <p class="text-sm text-gray-500">冷凍即食品與甜點，可到店自取或宅配</p>
    </header>

    <!-- 分頁 -->
    <nav class="flex gap-2 mb-4">
      <button :class="tabBtn('frozen')" @click="tab = 'frozen'">冷凍即食</button>
      <button :class="tabBtn('dessert')" @click="tab = 'dessert'">甜點</button>
    </nav>

    <!-- 骨架畫面 -->
    <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <div v-for="n in 6" :key="n" class="h-28 rounded-lg bg-gray-100 animate-pulse"></div>
    </div>

    <!-- 商品群組 -->
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

    <!-- 浮動購物車 -->
    <div
      v-if="cartCount > 0"
      class="fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-3xl drop-shadow-xl"
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

      <!-- 展開清單 -->
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

    <!-- 結帳 Modal（你的元件會在 submit 觸發 submitOrder） -->
    <ModalCheckout
      v-if="openCheckout"
      :cart="cart"
      :subtotal="subtotal"
      :earliest-pickup-date="earliestPickupDate"
      @close="openCheckout = false"
      @submit="submitOrder"
    />
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import SectionCard from '@/components/SectionCard.vue'
import ModalCheckout from '@/components/ModalCheckout.vue'

/** 使用環境變數（請在 .env 設定 VITE_GAS_URL） */
const GAS_BASE = import.meta.env.VITE_GAS_URL

/** 狀態 */
const tab = ref('frozen')
const raw = ref({ frozen: [], dessert: [] })
const loading = ref(true)

const cart = ref([]) // {code, name, price, qty, unit, lead_days?}
const openCart = ref(false)
const openCheckout = ref(false)

/** 取得資料 */
onMounted(async () => {
  try {
    const url = `${GAS_BASE}?type=retail`
    const data = await fetch(url).then(r => r.json())
    raw.value = data?.data || { frozen: [], dessert: [] }
  } catch (e) {
    console.error('❌ 載入零售資料失敗', e)
    raw.value = { frozen: [], dessert: [] }
  } finally {
    loading.value = false
  }
})

/** 顯示群組/分頁 */
const groups = computed(() => ({
  title: tab.value === 'frozen' ? '冷凍即食' : '甜點',
  items: raw.value[tab.value] || []
}))
const displayItems = computed(() =>
  groups.value.items.map(i => ({
    ...i,
    disabled: Boolean(i.stop || Number(i.stock ?? 0) <= 0)
  }))
)

/** 購物車 */
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
const inc = idx => {
  cart.value[idx].qty++
}
const dec = idx => {
  if (cart.value[idx].qty > 1) cart.value[idx].qty--
}
const remove = idx => {
  cart.value.splice(idx, 1)
}

/** 最早可取貨日（取購物車中最大 lead_days） */
const earliestPickupDate = computed(() => {
  const maxLead = cart.value.reduce((m, i) => Math.max(m, Number(i.lead_days || 0)), 0)
  const d = new Date()
  d.setDate(d.getDate() + maxLead)
  return d
})

/** UI 小函式 */
const tabBtn = t =>
  `px-3 py-1 rounded-full border ${tab.value === t ? 'bg-black text-white border-black' : 'bg-white text-black'}`
const currency = n => `NT$ ${Number(n || 0).toLocaleString()}`

/** 下單：呼叫 GAS (type=retailOrder) */
async function submitOrder({ customer }) {
  // 假設 ModalCheckout 會傳入 { customer: { name, phone, method, pickup_date, note } }
  const payload = new URLSearchParams()
  payload.append('type', 'retailOrder')
  payload.append('name', customer?.name || '')
  payload.append('phone', customer?.phone || '')
  payload.append('method', customer?.method || '自取')
  payload.append(
    'pickup_date',
    customer?.pickup_date || earliestPickupDate.value.toISOString().slice(0, 10)
  )
  payload.append('note', customer?.note || '')

  // 品項
  const items = cart.value.map(i => ({
    code: i.code,
    name: i.name,
    price: Number(i.price || 0),
    qty: Number(i.qty || 1),
    unit: i.unit || '份'
  }))
  payload.append('items', JSON.stringify(items))

  // 金額
  const subtotalNum = Number(subtotal.value || 0)
  const shippingNum = customer?.method === '宅配' ? 160 : 0 // 依你的規則調整
  const totalNum = subtotalNum + shippingNum
  payload.append('subtotal', String(subtotalNum))
  payload.append('shipping', String(shippingNum))
  payload.append('total', String(totalNum))

  try {
    const res = await fetch(GAS_BASE, { method: 'POST', body: payload })
    const json = await res.json()
    if (json?.result === 'success') {
      alert(`下單成功！訂單編號：${json.orderId}`)
      cart.value = []
      openCart.value = false
      openCheckout.value = false
    } else {
      alert('下單失敗，請稍後再試。')
    }
  } catch (err) {
    console.error('零售下單失敗：', err)
    alert('系統暫時無法下單，請稍後再試。')
  }
}
</script>

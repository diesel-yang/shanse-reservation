<template>
  <div class="max-w-3xl mx-auto px-4 py-6">
    <h1 class="text-2xl font-bold mb-4">購物車</h1>

    <div v-if="!cart.value.length" class="text-gray-500 text-center py-10">
      購物車是空的
    </div>

    <div v-else class="space-y-3">
      <!-- 購物車清單 -->
      <div
        v-for="(c, idx) in cart.value"
        :key="c.code + '-' + idx"
        class="flex items-center justify-between border-b pb-2"
      >
        <div class="min-w-0">
          <div class="font-medium truncate">{{ c.name }}</div>
          <div class="text-xs text-gray-500">{{ currency(c.price) }} / {{ c.unit || '份' }}</div>
        </div>
        <div class="flex items-center gap-2">
          <button @click="dec(idx)" class="px-2 border rounded" :disabled="c.qty <= 1">－</button>
          <span class="w-6 text-center">{{ c.qty }}</span>
          <button @click="inc(idx)" class="px-2 border rounded">＋</button>
          <button @click="remove(idx)" class="text-red-500 underline text-xs">移除</button>
        </div>
      </div>

      <!-- 小計 -->
      <div class="flex justify-between font-bold text-lg mt-4">
        <span>小計</span>
        <span>{{ currency(subtotal.value) }}</span>
      </div>

      <!-- 按鈕區 -->
      <div class="flex gap-3 mt-6">
        <RouterLink
          to="/retail"
          class="flex-1 text-center bg-gray-200 text-gray-800 rounded-full px-6 py-3"
        >
          回到商店
        </RouterLink>
        <button
          class="flex-1 bg-black text-white rounded-full px-6 py-3"
          @click="openCheckout = true"
        >
          前往結帳
        </button>
      </div>
      <!-- 🟧 新增：退換貨政策連結 -->
<p class="text-xs text-gray-500 mt-2 text-center">
  結帳前請先閱讀
  <RouterLink to="/return-policy" class="underline">退換貨與退款政策</RouterLink>
</p>
    </div>

    <!-- 🟧 新增：結帳視窗 -->
    <ModalCheckout
      v-if="openCheckout"
      :cart="cart"
      :subtotal="subtotal.value"
      :earliest-pickup-date="earliestPickupDate"
      @close="openCheckout = false"
      @submit="submitOrder"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useCart } from '@/composables/useCart'
import ModalCheckout from '@/components/ModalCheckout.vue'
import { submitOrderCommon } from '@/composables/useOrder'

/** 🟧 useCart 取全域購物車 */
const { state, subtotal, total, remove, inc, dec } = useCart()

const openCheckout = ref(false)

/** 小工具 */
const currency = n => `NT$ ${Number(n || 0).toLocaleString()}`

/** --- 最早可取貨日（依購物車最大前置天數） --- */
const earliestPickupDate = computed(() => {
  const maxLead = cart.value.reduce((m, i) => Math.max(m, Number(i.lead_days || 0)), 0)
  const d = new Date()
  d.setDate(d.getDate() + maxLead)
  return d
})

/** --- 下單流程（和 Retail.vue 相同邏輯） --- */
function toYMDLocal(dateLike) {
  let d
  if (!dateLike) d = new Date()
  else if (dateLike instanceof Date) d = new Date(dateLike.getTime())
  else d = new Date(dateLike)
  if (isNaN(d)) d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

async function submitOrder({ customer, done }) {
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
    payment_method: customer?.payment_method || 'cash',
    bank_ref: customer?.bank_ref || '',
    note: customer?.note || '',
    items: JSON.stringify(items),
    subtotal: String(subtotalNum),
    shipping: String(shippingNum),
    total: String(totalNum)
  })

  if (out?.result === 'pending' && out?.paymentUrl) {
    window.location.href = out.paymentUrl
    return
  }

  if (out?.result === 'success') {
    if (typeof done === 'function') {
      done({ orderId: out.orderId })
    }
  } else {
    if (typeof done === 'function') {
      done(null)
    } else {
      alert('下單失敗，請稍後再試。')
    }
  }
}
</script>

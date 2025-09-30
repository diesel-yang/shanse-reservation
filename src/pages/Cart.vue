<!-- src/pages/Cart.vue -->
<template>
  <div class="max-w-3xl mx-auto px-4 py-6">
    <!-- 返回零售商店 -->
    <div class="mb-4">
      <RouterLink
        to="/retail"
        class="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
      >
        ← 返回零售商店
      </RouterLink>
    </div>

    <h1 class="text-2xl font-bold mb-4">購物車</h1>

    <div v-if="items.length === 0" class="text-gray-500">
      購物車是空的，快去逛逛吧！
      <RouterLink to="/retail" class="text-blue-600 underline">零售商店</RouterLink>
    </div>

    <div v-else>
      <!-- 商品清單 -->
      <div
        v-for="(c, idx) in items"
        :key="c.code + '-' + idx"
        class="flex items-center justify-between py-3 border-b"
      >
        <div class="min-w-0">
          <div class="font-medium truncate">{{ c.name }}</div>
          <div class="text-xs text-gray-500">
            {{ currency(c.price) }} / {{ c.unit || '份' }}
          </div>
        </div>

        <!-- 🟨 黃底條形購物車控制 -->
        <div
          class="flex items-center justify-between bg-yellow-400 text-black rounded-lg px-4 h-10 min-w-[110px]"
        >
          <button @click="remove(idx)">
            <TrashIcon class="w-5 h-5 text-red-600" />
          </button>
          <span>{{ c.qty }}</span>
          <button @click="inc(idx)" class="font-bold">＋</button>
        </div>
      </div>

      <!-- 小計 -->
      <div class="flex justify-between items-center mt-6 text-lg font-semibold">
        <span>小計</span>
        <span>{{ currency(subtotal) }}</span>
      </div>

      <!-- 結帳按鈕 -->
      <div class="mt-6">
        <button
          class="w-full bg-black text-white rounded-full py-3 font-semibold hover:bg-gray-900 transition"
          @click="openCheckout = true"
        >
          前往結帳
        </button>
      </div>
      <!-- 退換貨政策 -->
      <p class="text-xs text-gray-500 mt-2 text-center">
        結帳前請先閱讀
        <RouterLink to="/return-policy" class="underline">退換貨與退款政策</RouterLink>
      </p>
    </div>

    <!-- 結帳視窗 -->
    <ModalCheckout
      v-if="openCheckout"
      :cart="items"
      :subtotal="subtotal"
      :earliest-pickup-date="earliestPickupDate"
      @close="openCheckout = false"
      @submit="submitOrder"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { TrashIcon } from '@heroicons/vue/24/outline'
import { useCart } from '@/composables/useCart'
import ModalCheckout from '@/components/ModalCheckout.vue'
import { gasPost } from '@/utils/gas'

/** --- 購物車狀態 --- */
const { items, subtotal, inc, remove, clear } = useCart()
const openCheckout = ref(false)

/** --- 最早可取貨日 --- */
const earliestPickupDate = computed(() => {
  const maxLead = items.value.reduce((m, i) => Math.max(m, Number(i.lead_days || 0)), 0)
  const d = new Date()
  d.setDate(d.getDate() + maxLead)
  return d
})

/** --- 工具 --- */
const currency = n => `NT$ ${Number(n || 0).toLocaleString()}`

/** --- 下單 --- */
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

async function submitOrder({ customer }) {
  const orderItems = items.value.map(i => ({
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
    items: JSON.stringify(orderItems),
    subtotal: String(subtotalNum),
    shipping: String(shippingNum),
    total: String(totalNum)
  })

  if (out?.result === 'pending' && out?.paymentUrl) {
    window.location.href = out.paymentUrl
    return
  }

  if (out?.result === 'success') {
    alert(`下單成功！訂單編號：${out.orderId}`)
    clear() // ✅ 清空購物車
    openCheckout.value = false
    window.location.href = '/retail'
  } else {
    alert('下單失敗，請稍後再試。')
  }
}
</script>

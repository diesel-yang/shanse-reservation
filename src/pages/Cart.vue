<!-- src/pages/Cart.vue -->
<template>
  <div class="max-w-3xl mx-auto px-4 py-6">
    <!-- 🟧 返回零售商店 -->
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
        <div class="flex items-center gap-2">
          <button class="px-2 py-1 border rounded" @click="dec(idx)" :disabled="c.qty <= 1">－</button>
          <span class="w-6 text-center">{{ c.qty }}</span>
          <button class="px-2 py-1 border rounded" @click="inc(idx)">＋</button>
          <button class="ml-2 text-xs text-red-500 underline" @click="remove(idx)">移除</button>
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
      <!-- 🟧 退換貨政策連結 -->
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
import { useCart } from '@/composables/useCart'
import ModalCheckout from '@/components/ModalCheckout.vue'
import { gasPost } from '@/utils/gas'

/** --- 購物車狀態（來自 useCart，全站共用） --- */
const { items, subtotal, inc, dec, remove, clear } = useCart()
const openCheckout = ref(false)

/** --- 最早可取貨日（看所有商品的 lead_days） --- */
const earliestPickupDate = computed(() => {
  const maxLead = items.value.reduce((m, i) => Math.max(m, Number(i.lead_days || 0)), 0)
  const d = new Date()
  d.setDate(d.getDate() + maxLead)
  return d
})

/** --- 工具 --- */
const currency = n => `NT$ ${Number(n || 0).toLocaleString()}`

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

/** --- 下單（含 LINE Pay 分支） --- */
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

  // 🔹 先組一個 orderId（也可以改成由後端生成）
  const orderId = `RT-${Date.now()}`

  // 🔸 若付款方式是 LINE Pay：走 linePayCreate，跳轉到 LINE Pay 付款頁
  if (customer?.payment_method === 'linepay') {
    const payRes = await gasPost({
      type: 'linePayCreate',
      orderId,
      amount: totalNum,
      productName: '山色零售商品',
      // 傳給後端方便之後 confirm/記錄用
      customer: JSON.stringify({
        name: customer?.name || '',
        phone: customer?.phone || '',
        method: customer?.method || '自取',
        pickup_date: pickupYmd,
        address: customer?.address || '',
        note: customer?.note || ''
      }),
      items: JSON.stringify(orderItems)
    })

    if (payRes?.result === 'ok' && payRes.paymentUrl?.web) {
      // 可選：暫存 orderId，之後回來可查詢
      localStorage.setItem('lastLinepayOrderId', payRes.orderId || orderId)
      // 導向 LINE Pay 付款頁
      window.location.href = payRes.paymentUrl.web
      return
    } else {
      alert('無法建立 LINE Pay 付款，請改用其他付款方式或稍後再試。')
      return
    }
  }

  // 🔹 其他付款方式（現金 / 轉帳）維持原本 retailOrder 流程
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
    // 如果你現有後端還會回 paymentUrl，就讓它保留
    window.location.href = out.paymentUrl
    return
  }

  if (out?.result === 'success') {
    alert(`下單成功！訂單編號：${out.orderId}`)
    clear() // ✅ 清空購物車
    openCheckout.value = false
    // ✅ 自動跳轉回零售頁
    window.location.href = '/retail'
  } else {
    alert('下單失敗，請稍後再試。')
  }
}
</script>

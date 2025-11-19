<!-- src/pages/LinepayResult.vue -->
<template>
  <div class="min-h-[100vh] flex items-center justify-center bg-[#fff7f0] px-4">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 text-center">
      <h1 class="text-2xl font-bold mb-4">LINE Pay 付款結果</h1>

      <!-- 處理中 -->
      <div v-if="loading" class="py-6">
        <div class="inline-block w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
        <p class="mt-4 text-sm text-gray-600">付款確認中，請稍候…</p>
      </div>

      <!-- 失敗 -->
      <div v-else-if="error" class="py-6">
        <p class="text-red-600 font-medium mb-2">付款未完成</p>
        <p class="text-sm text-gray-700 mb-6 whitespace-pre-line">
          {{ error }}
        </p>
        <div class="flex flex-col gap-3">
          <RouterLink to="/cart">
            <button class="w-full rounded-full border border-gray-300 py-2 text-sm hover:bg-gray-50">
              返回購物車重新嘗試
            </button>
          </RouterLink>
          <RouterLink to="/retail">
            <button class="w-full rounded-full bg-black text-white py-2 text-sm hover:bg-gray-900">
              回到零售商品
            </button>
          </RouterLink>
        </div>
      </div>

      <!-- 成功 -->
      <div v-else class="py-6">
        <p class="text-green-600 font-semibold mb-2">付款成功！</p>
        <p class="text-sm text-gray-700 mb-4">
          感謝您的訂購，我們已收到您的 LINE Pay 付款。
        </p>

        <div class="inline-block px-4 py-3 rounded-xl bg-gray-50 border mb-6">
          <div class="text-xs text-gray-500 mb-1">訂單編號</div>
          <div class="font-mono text-lg font-semibold text-orange-600 break-all">
            {{ orderId }}
          </div>
        </div>

        <p class="text-xs text-gray-500 mb-6">
          若有任何問題，歡迎透過 Instagram 與我們聯絡。
        </p>

        <RouterLink to="/retail">
          <button class="w-full rounded-full bg-black text-white py-2.5 text-sm font-semibold hover:bg-gray-900">
            返回零售商品
          </button>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { gasGet } from '@/utils/gas'

const route = useRoute()

const loading = ref(true)
const error = ref('')
const orderId = ref('')

onMounted(async () => {
  // 1️⃣ 取出 URL 上的 query 參數
  const order = route.query.orderId
  const tran = route.query.transactionId
  const amount = route.query.amount        // ⚠️ 一定要是 amount（沒有多一個 t）
  const customer = route.query.customer
  const items = route.query.items
  const subtotal = route.query.subtotal
  const shipping = route.query.shipping

  // 基本檢查
  if (!order || !tran) {
    error.value = '缺少必要參數（orderId / transactionId），請重新下單。'
    loading.value = false
    return
  }

  try {
    // 2️⃣ 呼叫 GAS 做 linepayConfirm（確認 + 寫入訂單）
    const res = await gasGet({
      type: 'linepayConfirm',
      orderId: order,
      transactionId: tran,
      amount,
      customer,
      items,
      subtotal,
      shipping
    })

    if (res?.result === 'success') {
      // 後端會回自己的 RXXXXX 訂單編號
      orderId.value = res.orderId || order
    } else {
      error.value = res?.message || '付款確認失敗，請稍後再試或改用其他付款方式。'
    }
  } catch (err) {
    console.error('linepayConfirm error:', err)
    error.value = '伺服器錯誤，請稍後再試。'
  } finally {
    loading.value = false
  }
})
</script>
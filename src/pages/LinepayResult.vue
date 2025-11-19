<!-- src/pages/LinepayResult.vue -->
<template>
  <div class="p-6 max-w-md mx-auto text-center">
    <h1 class="text-2xl font-bold mb-6">LINE Pay 付款結果</h1>

    <!-- Loading -->
    <div v-if="loading" class="text-gray-700">
      付款確認中，請稍候…
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-red-600 space-y-4">
      <p>{{ error }}</p>
      <RouterLink to="/retail">
        <button class="bg-black text-white px-4 py-2 rounded">
          返回零售商店
        </button>
      </RouterLink>
    </div>

    <!-- Success -->
    <div v-else class="text-green-700 space-y-6">
      <div>
        <p class="mb-2">付款成功！</p>
        <p class="text-gray-700">您的訂單編號：</p>
        <p class="font-mono text-xl font-semibold mt-1 text-orange-600">
          {{ orderId }}
        </p>
      </div>

      <RouterLink to="/retail">
        <button class="bg-black text-white px-4 py-2 rounded">
          返回零售商店
        </button>
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { gasGet } from '@/utils/gas'

const loading = ref(true)
const error = ref('')
const orderId = ref('')

onMounted(async () => {
  const url = new URL(window.location.href)

  // 這三個是 LINE Pay redirect 回來會帶的參數
  const order = url.searchParams.get('orderId')
  const tran = url.searchParams.get('transactionId')
  const amount = url.searchParams.get('amount')
    // 這幾個是我們在 confirmUrl 自己塞的
  const customer = url.searchParams.get('customer')
  const items = url.searchParams.get('items')
  const subtotal = url.searchParams.get('subtotal')
  const shipping = url.searchParams.get('shipping')



  if (!order || !tran) {
    error.value = '無效的付款請求（缺少必要資訊）'
    loading.value = false
    return
  }

  try {
    const res = await gasGet({
      type: 'linepayConfirm',
      orderId: order,
      transactionId: tran
      amount,
      customer,
      items,
      subtotal,
      shipping
    })

    if (res?.result === 'success') {
      orderId.value = res.orderId || order
    } else {
      error.value = res?.message || '付款確認失敗'
    }
  } catch (err) {
    console.error(err)
    error.value = '伺服器錯誤，請稍後再試'
  } finally {
    loading.value = false
  }
})
</script>
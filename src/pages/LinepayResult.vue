<template>
  <div class="p-6 max-w-md mx-auto text-center">
    <h1 class="text-2xl font-bold mb-4">付款結果</h1>

    <div v-if="loading">處理中，請稍候…</div>

    <div v-else-if="error" class="text-red-600">
      {{ error }}
    </div>

    <div v-else class="text-green-600">
      付款成功！<br />
      訂單編號：
      <span class="font-mono text-xl">{{ orderId }}</span>

      <div class="mt-6">
        <RouterLink to="/retail">
          <button class="bg-black text-white px-4 py-2 rounded">
            返回零售商品
          </button>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'

const loading = ref(true)
const error = ref('')
const orderId = ref('')

onMounted(async () => {
  try {
    const url = new URL(window.location.href)
    const transactionId = url.searchParams.get('transactionId')
    const amount = url.searchParams.get('amount')
    const orderIdFromLine = url.searchParams.get('orderId')

    // 這幾個是我們在 confirmUrl 上面追加的（如果你有加）
    const customer = url.searchParams.get('customer')
    const items = url.searchParams.get('items')
    const subtotal = url.searchParams.get('subtotal')
    const shipping = url.searchParams.get('shipping')

    if (!transactionId || !amount) {
      error.value = '缺少交易資訊，請確認付款是否成功。'
      loading.value = false
      return
    }

    // 打 Cloud Run /linepay/confirm
    const proxyBase = import.meta.env.VITE_LINEPAY_PROXY_BASE
    const res = await fetch(`${proxyBase}/linepay/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transactionId,
        amount,
        orderId: orderIdFromLine || '',
        customer,
        items,
        subtotal,
        shipping
      })
    })

    const json = await res.json()
    console.log('LINE Pay confirm response:', json)

    if (json.result === 'success') {
      orderId.value = json.orderId || ''
    } else {
      error.value = json.message || '付款確認失敗，請聯繫店家。'
    }
  } catch (err) {
    console.error(err)
    error.value = '系統錯誤，請稍後再試。'
  } finally {
    loading.value = false
  }
})
</script>
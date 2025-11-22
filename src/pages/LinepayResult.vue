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
import { gasGet } from '@/utils/gas'

const loading = ref(true)
const error = ref('')
const orderId = ref('')

onMounted(async () => {
  const url = new URL(window.location.href)

  const transactionId = url.searchParams.get('transactionId')
  const amount = url.searchParams.get('amount')
  const orderIdLine = url.searchParams.get('orderId')

  if (!transactionId) {
    error.value = '找不到交易編號'
    loading.value = false
    return
  }

  try {
    // Cloud Run confirm
    const crRes = await fetch(import.meta.env.VITE_LINEPAY_PROXY + '/linepay/confirm', {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transactionId,
        amount,
        customer: localStorage.getItem('linepay_customer') || '',
        items: localStorage.getItem('linepay_items') || '[]',
        subtotal: localStorage.getItem('linepay_subtotal') || '0',
        shipping: localStorage.getItem('linepay_shipping') || '0'
      })
    })

    const json = await crRes.json()
    console.log("Confirm result:", json)

    if (json.result === 'success') {
      orderId.value = json.orderId
    } else {
      error.value = json.message || '付款確認失敗'
    }
  } catch (err) {
    console.error(err)
    error.value = '伺服器錯誤'
  } finally {
    loading.value = false
  }
})
</script>
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
  const url = new URL(window.location.href)
  const order = url.searchParams.get('orderId')
  const tran = url.searchParams.get('transactionId')
  const amount = url.searchParams.get('amount')

  // 這幾個是我們在 Cloud Run confirm 要回寫 GAS 用的
  const customerRaw = url.searchParams.get('customer')
  const itemsRaw = url.searchParams.get('items')
  const subtotalRaw = url.searchParams.get('subtotal')
  const shippingRaw = url.searchParams.get('shipping')

  if (!order || !tran || !amount) {
    error.value = '缺少必要參數（order / transactionId / amount）'
    loading.value = false
    return
  }

  let customer = {}
  let items = []
  let subtotal = Number(subtotalRaw || 0)
  let shipping = Number(shippingRaw || 0)

  try {
    if (customerRaw) {
      customer = JSON.parse(decodeURIComponent(customerRaw))
    }
  } catch (_) {
    console.warn('parse customer failed')
  }

  try {
    if (itemsRaw) {
      items = JSON.parse(decodeURIComponent(itemsRaw))
    }
  } catch (_) {
    console.warn('parse items failed')
  }

  try {
    const res = await fetch(
      import.meta.env.VITE_LINEPAY_PROXY_BASE + '/linepay/confirm',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: tran,
          amount: Number(amount),
          orderId: order,
          customer,
          items,
          subtotal,
          shipping
        })
      }
    )

    const json = await res.json()
    console.log('LINE Pay confirm response:', json)

    if (json?.result === 'success') {
      orderId.value = json.orderId || '(無訂單編號)'
    } else {
      error.value = json?.message || '付款確認失敗'
    }
  } catch (err) {
    console.error(err)
    error.value = '伺服器錯誤'
  } finally {
    loading.value = false
  }
})
</script>
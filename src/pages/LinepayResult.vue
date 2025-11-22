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
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(true)
const error = ref('')
const orderNo = ref('')

onMounted(async () => {
  try {
    const url = new URL(window.location.href)
    const p = url.searchParams

    const transactionId = p.get('transactionId') || ''
    const amount = p.get('amount') || ''
    const orderId = p.get('orderId') || ''  // LINE Pay 自己帶的

    let rawCustomer = p.get('customer') || ''
    let rawItems = p.get('items') || ''
    const subtotal = p.get('subtotal') || '0'
    const shipping = p.get('shipping') || '0'

    let customer = {}
    let items = []

    if (rawCustomer) {
      try {
        customer = JSON.parse(rawCustomer)
      } catch (_) {
        try { customer = JSON.parse(decodeURIComponent(rawCustomer)) } catch (_) {}
      }
    }

    if (rawItems) {
      try {
        items = JSON.parse(rawItems)
      } catch (_) {
        try { items = JSON.parse(decodeURIComponent(rawItems)) } catch (_) {}
      }
    }

    if (!transactionId || !amount) {
      error.value = '缺少交易資訊，無法確認付款。'
      loading.value = false
      return
    }

    const res = await fetch(
      import.meta.env.VITE_LINEPAY_PROXY_BASE + '/linepay/confirm',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId,
          amount,
          orderId,
          customer,
          items,
          subtotal,
          shipping
        })
      }
    )

    const json = await res.json()
    console.log('LINE Pay confirm response :', json)

    if (json.result === 'success') {
      orderNo.value = json.orderId || ''
    } else {
      error.value = json.message || '付款確認失敗'
    }
  } catch (e) {
    console.error(e)
    error.value = '付款確認過程發生錯誤'
  } finally {
    loading.value = false
  }
})

function goBackToRetail() {
  router.replace('/retail')
}
</script>
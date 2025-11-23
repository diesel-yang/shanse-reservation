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
const orderId = ref('')

onMounted(async () => {
  try {
    const url = new URL(window.location.href)
    const p = url.searchParams

    // LINE Pay 帶回來的
    const transactionId = p.get('transactionId') || ''
    const amount = Number(p.get('amount') || 0)
    const orderKey = p.get('orderId') || localStorage.getItem('lastLinepayOrderId') || ''

    if (!transactionId || !amount || !orderKey) {
      error.value = '缺少交易資訊，無法確認付款。'
      loading.value = false
      return
    }

    // ===== 取回 cart.vue 存的 pending order 資料 =====
    const pendingKey = `linepayPending:${orderKey}`
    let customer = {}
    let items = []
    let subtotal = 0
    let shipping = 0

    try {
      const raw = localStorage.getItem(pendingKey)
      if (raw) {
        const parsed = JSON.parse(raw)
        customer = parsed.customer || {}
        items = parsed.items || []
        subtotal = Number(parsed.subtotal || 0)
        shipping = Number(parsed.shipping || 0)
      }
    } catch (err) {
      console.error('parse pending order error:', err)
    }

    // ===== 呼叫 Cloud Run confirm =====
    const res = await fetch(
      import.meta.env.VITE_LINEPAY_PROXY_BASE + '/linepay/confirm',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId,
          amount,
          orderId: orderKey,
          customer,
          items,
          subtotal,
          shipping
        })
      }
    )

    const json = await res.json()
    console.log('LINE Pay confirm response:', json)

    if (json.result === 'success') {
      orderId.value = json.orderId || '(無訂單編號)'

      // 清除 pending order
      localStorage.removeItem(pendingKey)
      localStorage.removeItem('lastLinepayOrderId')
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
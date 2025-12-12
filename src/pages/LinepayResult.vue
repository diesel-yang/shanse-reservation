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
          <button class="bg-black text-white px-4 py-2 rounded">返回零售商品</button>
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

    const transactionId = p.get('transactionId') || ''
    const amount = Number(p.get('amount') || 0)
    const key = p.get('orderId') || localStorage.getItem('lastLinepayOrderId') || ''

    if (!transactionId || !amount || !key) {
      error.value = '缺少必要交易資訊，無法確認付款。'
      loading.value = false
      return
    }

    // ----------------------------
    // 防止重複 confirm（避免 1172）
    // ----------------------------
    const flagKey = `linepayConfirmDone:${key}`
    if (localStorage.getItem(flagKey) === 'yes') {
      console.log('[LINEPAY] confirm 已執行過，略過')
      orderId.value = key
      loading.value = false
      return
    }

    // ----------------------------
    // 讀 pending order（cart.vue）
    // ----------------------------
    const pendingKey = `linepayPending:${key}`
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
      console.warn('parse pending order error:', err)
    }

    // ----------------------------
    // 呼叫 Cloud Run confirm
    // ----------------------------
    const res = await fetch(import.meta.env.VITE_LINEPAY_PROXY_BASE + '/linepay/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transactionId,
        amount,
        orderId: key,
        customer,
        items,
        subtotal,
        shipping
      })
    })

    const json = await res.json()
    console.log('LINE Pay confirm response:', json)

    // -----------------------------------------
    // ★ CloudRun 返回成功（result = success）
    // -----------------------------------------
    if (json.result === 'success') {
      orderId.value = key

      localStorage.setItem(flagKey, 'yes')
      localStorage.removeItem(pendingKey)
      localStorage.removeItem('lastLinepayOrderId')
    }
    // -----------------------------------------
    // ★ CloudRun 回傳: already_confirmed
    // -----------------------------------------
    else if (json.result === 'already_confirmed') {
      console.log('[LINEPAY] already confirmed, 前端直接當成功')
      orderId.value = key
      localStorage.setItem(flagKey, 'yes')
    } else {
      error.value = json.message || '付款確認失敗'
    }
  } catch (err) {
    console.error(err)
    error.value = '付款確認過程發生錯誤'
  } finally {
    loading.value = false
  }
})
</script>

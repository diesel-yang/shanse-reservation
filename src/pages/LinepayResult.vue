<template>
  <div class="p-6 max-w-md mx-auto text-center">
    <h1 class="text-2xl font-bold mb-4">LINE Pay 付款結果</h1>

    <div v-if="loading">處理中，請稍候…</div>

    <div v-else-if="error" class="text-red-600">
      {{ error }}
      <div class="mt-6">
        <RouterLink to="/retail">
          <button class="bg-black text-white px-4 py-2 rounded">
            返回零售商品
          </button>
        </RouterLink>
      </div>
    </div>

    <div v-else class="text-green-600">
      付款成功！<br />
      您的訂單編號：
      <div class="mt-2 mb-6 font-mono text-xl text-orange-600">
        {{ orderId }}
      </div>
      <RouterLink to="/retail">
        <button class="bg-black text-white px-4 py-2 rounded">
          返回零售商品
        </button>
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { gasGet } from '@/utils/gas'

const loading = ref(true)
const error = ref('')
const orderId = ref('')

onMounted(async () => {
  const route = useRoute()
  const transactionId = route.query.transactionId
  const amount = route.query.amount
  const order = route.query.orderId || ''

  // 這幾個是我們在 confirmUrl 裡塞進去的
  const customer = route.query.customer || ''
  const items = route.query.items || ''
  const subtotal = route.query.subtotal || ''
  const shipping = route.query.shipping || ''

  if (!transactionId || !amount) {
    error.value = '缺少必要參數（transactionId 或 amount）'
    loading.value = false
    return
  }

  try {
    const res = await gasGet({
      type: 'linepayConfirm',
      transactionId,
      amount,
      orderId: order,
      customer,
      items,
      subtotal,
      shipping
    })

    if (res?.result === 'success') {
      orderId.value = res.orderId
    } else {
      error.value = res?.message || '付款確認失敗'
    }
  } catch (err) {
    console.error(err)
    error.value = '伺服器錯誤，請稍後再試。'
  } finally {
    loading.value = false
  }
})
</script>
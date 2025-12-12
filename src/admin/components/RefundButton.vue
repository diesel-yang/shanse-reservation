<script setup>
import { ref } from 'vue'
import axios from 'axios'

const props = defineProps({
  orderId: String,
  transactionId: String,
  amount: Number
})

const emit = defineEmits(['done'])
const loading = ref(false)

async function doRefund() {
  if (!confirm(`確定要退款？（訂單 ${props.orderId}）`)) return
  loading.value = true

  try {
    const res = await axios.post(`${import.meta.env.VITE_LINEPAY_PROXY_BASE}/linepay/refund`, {
      orderId: props.orderId,
      transactionId: props.transactionId,
      refundAmount: props.amount
    })

    alert('退款成功')
    emit('done')
  } catch (err) {
    alert('退款失敗：' + (err?.response?.data?.message || err.message))
  }

  loading.value = false
}
</script>

<template>
  <button
    @click="doRefund"
    :disabled="loading"
    class="px-3 py-1 bg-red-600 text-white rounded disabled:opacity-50"
  >
    {{ loading ? '處理中...' : '退款' }}
  </button>
</template>

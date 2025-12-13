<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { linepayRefund } from '@/api/linepay'
import { useAdminAuth } from '@/admin/composables/useAdminAuth'

const props = defineProps({
  orderId: String,
  transactionId: String,
  amount: Number
})

const { idToken } = useAdminAuth()
const emit = defineEmits(['done'])
const loading = ref(false)

async function doRefund() {
  if (!confirm(`確定要退款？（訂單 ${props.orderId}）`)) return

  loading.value = true

  try {
    const res = await axios.post(
      `${import.meta.env.VITE_LINEPAY_PROXY_BASE}/linepay/refund`,
      {
        orderId: props.orderId,
        transactionId: props.transactionId,
        refundAmount: props.amount
      },
      {
        headers: {
          Authorization: `Bearer ${idToken.value}`
        }
      }
    )

    alert('退款成功')
    emit('done')
  } catch (err) {
    console.error(err)
    alert('退款失敗：' + (err?.response?.data?.message || 'unknown error'))
  }

  loading.value = false
}
</script>

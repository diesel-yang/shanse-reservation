<template>
  <div class="min-h-screen flex items-center justify-center bg-white p-6">
    <div class="w-full max-w-sm text-center">
      <!-- Loading -->
      <div v-if="state === 'loading'">
        <p class="text-sm text-gray-500">付款確認中，請稍候…</p>
      </div>

      <!-- Success -->
      <div v-else-if="state === 'success'">
        <div class="text-5xl mb-3">✅</div>
        <h1 class="text-lg font-bold mb-2">訂位完成</h1>

        <div class="bg-gray-50 rounded-xl p-4 text-sm space-y-1 mt-4">
          <div>日期：{{ summary.date }}</div>
          <div>時段：{{ summary.time }}</div>
          <div>人數：{{ summary.people }} 位</div>
          <div>訂金：{{ summary.deposit }} 元</div>
        </div>

        <a
          :href="`/api/booking/${summary.bookingId}/pdf`"
          class="inline-block mt-5 text-[#f36f21] font-medium"
        >
          下載訂位明細 PDF
        </a>
      </div>

      <!-- Fail -->
      <div v-else>
        <div class="text-5xl mb-3">❌</div>
        <h1 class="text-lg font-bold mb-2">付款未完成</h1>
        <p class="text-sm text-gray-500 mb-4">尚未扣款，請重新嘗試付款</p>

        <button class="w-full h-12 rounded-xl bg-[#06C755] text-white font-medium" @click="retry">
          重新使用 LINE Pay 付款
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { confirmPayment } from '@/api/payment'

const route = useRoute()
const router = useRouter()

const state = ref('loading')
const summary = ref({})

onMounted(async () => {
  try {
    const transactionId = route.query.transactionId
    const bookingId = route.query.bookingId

    if (!transactionId || !bookingId) {
      throw new Error('MISSING_PARAMS')
    }

    const res = await confirmPayment({
      bookingId,
      method: 'linepay',
      transactionId
    })

    summary.value = {
      bookingId,
      ...res.data
    }
    state.value = 'success'
  } catch (err) {
    console.error(err)
    state.value = 'fail'
  }
})

function retry() {
  router.replace('/booking/payment')
}
</script>

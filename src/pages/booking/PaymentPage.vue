<template>
  <div class="min-h-screen bg-white p-4 space-y-6">
    <h1 class="text-lg font-bold">預付訂金</h1>

    <div class="text-sm space-y-1">
      <div>日期：{{ draft.date }}</div>
      <div>時段：{{ draft.time }}</div>
      <div>人數：{{ draft.people }} 位</div>
      <div class="font-semibold">訂金：{{ draft.people * 315 }} 元</div>
    </div>

    <button class="w-full h-12 rounded-xl bg-[#06C755] text-white font-medium" @click="pay">
      使用 LINE Pay 付款
    </button>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { initiatePayment } from '@/api/payment'

const route = useRoute()
const draft = route.state?.draft

async function pay() {
  const res = await initiatePayment(draft)
  window.location.href = res.paymentUrl
}
</script>

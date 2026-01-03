<template>
  <section class="min-h-screen flex items-center justify-center px-4">
    <!-- Loading -->
    <div v-if="state === 'loading'" class="text-center">
      <div class="animate-spin w-10 h-10 border-4 border-gray-300 border-t-black rounded-full mx-auto mb-4"></div>
      <p class="text-gray-600">付款確認中，請稍候…</p>
    </div>

    <!-- Success -->
    <div
      v-else-if="state === 'success'"
      class="max-w-md w-full bg-white rounded-2xl shadow p-8 text-center"
    >
      <h1 class="text-2xl font-semibold text-green-600 mb-4">
        訂位已成立
      </h1>

      <p class="text-gray-700 mb-6">
        感謝您的訂位，期待您的蒞臨
      </p>

      <div class="text-left text-sm space-y-2 mb-6">
        <p>📅 日期：{{ booking.date }}</p>
        <p>⏰ 時段：{{ booking.time }}</p>
        <p>👤 訂位人：{{ booking.name }}</p>
        <p>👥 人數：{{ booking.people }} 位</p>
      </div>

      <router-link
        to="/"
        class="inline-block bg-black text-white px-6 py-3 rounded-lg"
      >
        返回首頁
      </router-link>
    </div>

    <!-- Fail -->
    <div
      v-else
      class="max-w-md w-full bg-white rounded-2xl shadow p-8 text-center"
    >
      <h1 class="text-2xl font-semibold text-red-600 mb-4">
        付款未完成
      </h1>

      <p class="text-gray-700 mb-6">
        訂位尚未成立，請重新嘗試付款
      </p>

      <router-link
        to="/booking"
        class="inline-block bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg"
      >
        返回訂位頁
      </router-link>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const state = ref('loading') // loading | success | fail
const booking = ref({})

onMounted(async () => {
  const transactionId = route.query.transactionId
  const bookingId = route.query.bookingId

  if (!transactionId || !bookingId) {
    state.value = 'fail'
    return
  }

  try {
    const res = await fetch('/api/payment/pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId,
        transactionId,
        method: 'linepay'
      })
    })

    const json = await res.json()

    if (json.result === 'success') {
      booking.value = json.data.booking
      state.value = 'success'
    } else {
      state.value = 'fail'
    }
  } catch (err) {
    state.value = 'fail'
  }
})
</script>

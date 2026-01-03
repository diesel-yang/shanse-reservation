<template>
  <section class="max-w-3xl mx-auto px-4 py-10">
    <h1 class="text-2xl font-semibold mb-6">訂位</h1>

    <!-- ================= 訂位表單 ================= -->
    <div class="bg-white rounded-2xl shadow p-6 space-y-4">
      <input
        v-model="form.date"
        type="date"
        class="input"
        placeholder="用餐日期"
      />

      <input
        v-model="form.time"
        type="time"
        class="input"
        placeholder="可訂位時段"
      />

      <input
        v-model="form.people"
        type="number"
        min="1"
        class="input"
        placeholder="人數"
      />

      <input
        v-model="form.name"
        class="input"
        placeholder="訂位人姓名"
      />

      <input
        v-model="form.phone"
        class="input"
        placeholder="手機號碼"
      />

      <input
        v-model="form.email"
        class="input"
        placeholder="Email（選填）"
      />

      <textarea
        v-model="form.note"
        rows="3"
        class="input"
        placeholder="備註"
      ></textarea>

      <button
        class="w-full bg-black text-white py-3 rounded-lg font-semibold"
        :disabled="loading"
        @click="submit"
      >
        {{ loading ? '處理中…' : '確認訂位並前往付款' }}
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { checkout } from '@/checkout'

/* ================= 狀態 ================= */

const loading = ref(false)

const form = ref({
  date: '',
  time: '',
  people: 2,
  name: '',
  phone: '',
  email: '',
  note: ''
})

/* ================= 動作 ================= */

async function submit() {
  if (loading.value) return
  loading.value = true

  try {
    /**
     * 1️⃣ 建立 booking（pending）
     */
    const res = await fetch('/api/booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: form.value.date,
        time: form.value.time,
        people: form.value.people,
        name: form.value.name,
        phone: form.value.phone,
        email: form.value.email,
        note: form.value.note
      })
    })

    const json = await res.json()

    if (json.result !== 'success') {
      throw new Error(json.message || '建立訂位失敗')
    }

    const bookingId = json.bookingId

    /**
     * 2️⃣ 統一 checkout（前端只做這一步）
     */
    await checkout({
      type: 'booking',
      bookingId
    })

    // ⚠️ checkout 會 redirect，不會跑到這行
  } catch (err) {
    alert(err.message || '訂位失敗，請稍後再試')
    loading.value = false
  }
}
</script>

<style scoped>
.input {
  @apply w-full rounded-lg border border-gray-300 px-3 py-3
         focus:outline-none focus:ring-2 focus:ring-black;
}
</style>

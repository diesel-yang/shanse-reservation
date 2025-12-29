<template>
  <!-- Hero -->
  <section class="relative h-[420px]">
    <img
      src="/hero.jpg"
      class="absolute inset-0 w-full h-full object-cover"
    />
    <div class="absolute inset-0 bg-black/40"></div>

    <!-- Search Card -->
    <div
      class="relative max-w-5xl mx-auto h-full flex items-end px-4 pb-10"
    >
      <div
        class="w-full bg-white rounded-2xl shadow-xl p-6 md:p-8"
      >
        <h1 class="text-2xl font-semibold mb-6">
          訂位查詢
        </h1>

        <div class="grid md:grid-cols-4 gap-4">
          <!-- 人數 -->
          <select v-model="form.people" class="select">
            <option disabled value="">人數</option>
            <option v-for="n in 8" :key="n" :value="n">
              {{ n }} 位
            </option>
          </select>

          <!-- 餐期 -->
          <select v-model="form.period" class="select">
            <option value="lunch">午餐</option>
            <option value="dinner">晚餐</option>
          </select>

          <!-- 日期 -->
          <input
            id="datePicker"
            class="select"
            placeholder="選擇日期"
            readonly
          />

          <button
            class="bg-black text-white rounded-lg py-3 font-medium"
            @click="searchSlots"
          >
            搜尋
          </button>
        </div>

        <!-- 時段 -->
        <div v-if="slots.length" class="mt-6">
          <p class="mb-2 text-sm text-gray-600">可訂位時段</p>
          <div class="flex flex-wrap gap-3">
            <button
              v-for="slot in slots"
              :key="slot"
              @click="form.time = slot"
              :class="[
                'px-4 py-2 rounded-full border',
                form.time === slot
                  ? 'bg-black text-white'
                  : 'hover:border-black'
              ]"
            >
              {{ slot }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Step 2 -->
  <section
    v-if="form.time"
    class="max-w-3xl mx-auto px-4 py-12"
  >
    <h2 class="text-xl font-semibold mb-6">
      確認訂位與填寫聯絡資訊
    </h2>

    <div class="bg-white rounded-2xl shadow p-6 space-y-5">
      <input
        v-model="form.name"
        placeholder="訂位人姓名"
        class="input"
      />

      <input
        v-model="form.phone"
        placeholder="手機號碼"
        class="input"
      />

      <input
        v-model="form.email"
        placeholder="Email（選填）"
        class="input"
      />

      <textarea
        v-model="form.note"
        rows="3"
        placeholder="其他備註（如過敏、慶生）"
        class="input"
      ></textarea>

      <button
        class="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-semibold"
        @click="submitReservation"
      >
        確認訂位
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import flatpickr from 'flatpickr'
import 'flatpickr/dist/flatpickr.min.css'

const form = ref({
  people: '',
  period: 'lunch',
  date: '',
  time: '',
  name: '',
  phone: '',
  email: '',
  note: ''
})

const slots = ref([])

function searchSlots() {
  // ⚠️ 之後可改成 API
  slots.value = ['11:30', '12:00', '13:15', '13:30']
}

function submitReservation() {
  alert(`訂位完成：${form.value.name}`)
}

onMounted(() => {
  flatpickr('#datePicker', {
    dateFormat: 'Y-m-d',
    minDate: 'today',
    onChange: (d, s) => (form.value.date = s)
  })
})
</script>

<style scoped>
.select {
  @apply w-full rounded-lg border border-gray-300 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-black;
}
.input {
  @apply w-full rounded-lg border border-gray-300 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500;
}
</style>

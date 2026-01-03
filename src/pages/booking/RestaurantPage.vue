<template>
  <div class="min-h-screen bg-[#f5f6fa]">
    <!-- Hero -->
    <div class="h-[180px] bg-[#f36f21] flex items-center justify-center">
      <img :src="logo" class="h-28 object-contain" />
    </div>

    <!-- Restaurant Info -->
    <div class="bg-white px-4 py-4">
      <h1 class="text-xl font-bold">山色 Shansè</h1>
      <p class="text-sm text-gray-500 mt-1">線上訂位</p>
    </div>

    <!-- Booking Form -->
    <div class="px-4 mt-4 space-y-4">
      <!-- 人數 -->
      <div class="bg-white rounded-xl p-4">
        <label class="text-sm font-medium">用餐人數</label>
        <select v-model.number="people" class="mt-2 w-full border rounded-lg h-11 px-3">
          <option v-for="n in 4" :key="n" :value="n">{{ n }} 位</option>
        </select>
      </div>

      <!-- 日期 -->
      <div class="bg-white rounded-xl p-4">
        <label class="text-sm font-medium">用餐日期</label>
        <input
          type="date"
          class="mt-2 w-full border rounded-lg h-11 px-3"
          v-model="date"
          :min="minDate"
          :max="maxDate"
          @change="loadSlots"
        />
      </div>

      <!-- 時段 -->
      <div class="bg-white rounded-xl p-4">
        <label class="text-sm font-medium">用餐時段</label>

        <div v-if="loading" class="text-sm text-gray-400 mt-3">查詢時段中…</div>

        <div v-else class="grid grid-cols-2 gap-3 mt-3">
          <button
            v-for="s in slots"
            :key="s.time"
            class="h-14 rounded-lg border text-sm text-left px-3"
            :disabled="!s.canBook"
            :class="slotClass(s)"
            @click="selectSlot(s)"
          >
            <div class="font-medium">{{ s.time }}</div>
            <div class="text-xs mt-1">
              <span v-if="s.available === 0" class="text-red-500"> 已額滿 </span>
              <span v-else> 剩餘 {{ s.available }} 位 </span>
            </div>
          </button>
        </div>
      </div>

      <!-- 餐廳資訊 -->
      <div class="bg-white rounded-xl p-4 text-sm text-gray-600 space-y-1">
        <div>📍 台中市南屯區干城街 107 號</div>
        <div>📞 Instagram 訊息</div>
        <div>🕒 11:30–15:30</div>
      </div>

      <!-- CTA -->
      <button
        class="w-full h-12 rounded-xl bg-[#f36f21] text-white disabled:opacity-40"
        :disabled="!canProceed"
        @click="proceed"
      >
        完成預訂
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import logo from '@/assets/shanse-logo-original.PNG?url'
import { fetchSlots } from '@/api/booking'

const people = ref(1)
const date = ref('')
const slots = ref([])
const selectedSlot = ref(null)
const loading = ref(false)

const today = new Date()
const minDate = today.toISOString().slice(0, 10)

const max = new Date()
max.setDate(today.getDate() + 30)
const maxDate = max.toISOString().slice(0, 10)

async function loadSlots() {
  if (!date.value) return
  loading.value = true
  selectedSlot.value = null

  try {
    const res = await fetchSlots({
      date: date.value,
      people: people.value
    })
    slots.value = res.slots
  } finally {
    loading.value = false
  }
}

function selectSlot(s) {
  if (!s.canBook) return
  selectedSlot.value = s
}

function slotClass(s) {
  if (!s.canBook) {
    return 'border-gray-200 text-gray-400 bg-gray-50'
  }
  if (selectedSlot.value?.time === s.time) {
    return 'bg-[#f36f21] text-white border-[#f36f21]'
  }
  return 'bg-white'
}

const canProceed = computed(() => !!(date.value && selectedSlot.value))

function proceed() {
  // 這裡只負責進入 ContactFormPage
  // booking create / payment 在下一頁
  console.log({
    date: date.value,
    time: selectedSlot.value.time,
    people: people.value
  })
}
</script>

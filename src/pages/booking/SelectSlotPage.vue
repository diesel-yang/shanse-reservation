<template>
  <div class="min-h-screen bg-white">
    <!-- Header -->
    <header class="px-4 py-3 border-b">
      <h1 class="text-lg font-semibold">選擇訂位時段</h1>
      <p class="text-sm text-gray-500 mt-1">請選擇用餐人數、日期與時段</p>
    </header>

    <!-- Content -->
    <div class="p-4 space-y-6">
      <!-- 人數 -->
      <section>
        <label class="block text-sm font-medium mb-2">用餐人數</label>
        <select v-model="people" class="w-full border rounded-lg px-3 py-2">
          <option v-for="n in 8" :key="n" :value="n">{{ n }} 位</option>
        </select>
        <p class="text-xs text-gray-500 mt-1">可接受 1–8 位訂位（含大人與小孩）</p>
      </section>

      <!-- 日期 -->
      <section>
        <label class="block text-sm font-medium mb-2">用餐日期</label>

        <!-- 月份標題 -->
        <div class="flex items-center justify-between mb-2">
          <button class="px-2 text-gray-500" @click="prevMonth">‹</button>
          <div class="font-semibold">{{ year }} 年 {{ month }} 月</div>
          <button class="px-2 text-gray-500" @click="nextMonth">›</button>
        </div>

        <!-- 日期格 -->
        <div class="grid grid-cols-7 gap-2 text-center text-sm">
          <div
            v-for="day in days"
            :key="day.date"
            class="py-2 rounded-lg border cursor-pointer"
            :class="{
              'bg-orange-500 text-white border-orange-500': day.date === selectedDate,
              'text-gray-400 cursor-not-allowed': !day.enabled
            }"
            @click="day.enabled && selectDate(day.date)"
          >
            {{ day.label }}
          </div>
        </div>
      </section>

      <!-- 時段 -->
      <section v-if="selectedDate">
        <label class="block text-sm font-medium mb-2">用餐時段</label>

        <div class="grid grid-cols-2 gap-3">
          <button
            v-for="slot in slots"
            :key="slot"
            class="py-3 rounded-lg border text-center"
            :class="{
              'bg-orange-500 text-white border-orange-500': slot === selectedSlot
            }"
            @click="selectSlot(slot)"
          >
            {{ slot }}
          </button>
        </div>
      </section>
    </div>

    <!-- Footer -->
    <footer class="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
      <button
        class="w-full py-3 rounded-lg text-white"
        :class="canContinue ? 'bg-orange-500' : 'bg-gray-300'"
        :disabled="!canContinue"
        @click="goNext"
      >
        下一步
      </button>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

/**
 * State
 */
const people = ref(2)
const selectedDate = ref(null)
const selectedSlot = ref(null)

/**
 * 月曆（簡化版）
 */
const today = new Date()
const year = ref(today.getFullYear())
const month = ref(today.getMonth() + 1)

const days = computed(() => {
  const total = 31
  return Array.from({ length: total }, (_, i) => {
    const d = i + 1
    return {
      date: `${year.value}-${String(month.value).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      label: d,
      enabled: true
    }
  })
})

function prevMonth() {
  if (month.value === 1) {
    month.value = 12
    year.value--
  } else {
    month.value--
  }
}

function nextMonth() {
  if (month.value === 12) {
    month.value = 1
    year.value++
  } else {
    month.value++
  }
}

/**
 * 時段（先用靜態）
 */
const slots = ['12:00', '12:30', '13:00', '13:30']

function selectDate(date) {
  selectedDate.value = date
  selectedSlot.value = null
}

function selectSlot(slot) {
  selectedSlot.value = slot
}

/**
 * 下一步
 */
const canContinue = computed(() => {
  return selectedDate.value && selectedSlot.value
})

function goNext() {
  if (!canContinue.value) return

  // 下一步先單純導頁，之後再接 store
  router.push('/booking/contact')
}
</script>

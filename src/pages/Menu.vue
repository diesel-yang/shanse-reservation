<template>
  <div class="max-w-5xl mx-auto px-4 py-8 text-gray-800">
    <!-- 標題 -->
    <div class="flex flex-col items-center mb-6">
      <img src="/hero-transparent.png" alt="山色主視覺" class="w-20 h-auto mb-2 object-contain" />
      <h1 class="text-3xl font-bold text-blue-900">預先點餐</h1>
    </div>

    <!-- ✅ 訂位資料區塊 -->
    <section class="bg-white rounded-lg shadow-md p-4 mb-6">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">訂位資訊</h2>
      <div class="grid gap-4 sm:grid-cols-2">
        <input v-model="form.name" type="text" placeholder="訂位人姓名" class="input" required />
        <input ref="dateInput" type="text" placeholder="用餐日期" class="input" required />

        <div class="flex flex-wrap gap-2 sm:col-span-2">
          <button
            v-for="slot in timeSlots"
            :key="slot"
            type="button"
            :class="[
              'px-3 py-2 rounded border transition',
              form.time === slot
                ? 'bg-orange-500 text-white border-orange-500'
                : 'bg-white text-gray-700 hover:bg-orange-100'
            ]"
            @click="form.time = slot">
            {{ slot }}
          </button>
        </div>

        <select v-model.number="form.people" class="input text-gray-500" required>
          <option disabled value="">選擇用餐人數</option>
          <option v-for="n in 8" :key="n" :value="n">{{ n }} 位</option>
        </select>
      </div>
    </section>
    <!-- ✅ 點餐模式切換區塊 -->
    <section class="bg-white rounded-lg shadow-md p-4 mb-6">
      <h2 class="text-xl font-semibold text-gray-800 mb-3">點餐模式</h2>
      <div class="flex flex-col sm:flex-row gap-4">
        <label class="flex items-center gap-2 cursor-pointer">
          <input type="radio" v-model="orderMode" value="group" class="accent-blue-500" />
          <span>共同點餐（由代表填寫）</span>
        </label>
        <label class="flex items-center gap-2 cursor-pointer">
          <input type="radio" v-model="orderMode" value="individual" class="accent-blue-500" />
          <span>個別點餐（每人填寫）</span>
        </label>
      </div>
    </section>

    <!-- ✅ 點餐卡片區塊 -->
    <section v-if="form.people > 0 && orders.length" class="space-y-6 mb-10">
      <template v-if="orderMode === 'group'">
        <OrderBlock
          v-for="(order, idx) in orders"
          :key="idx"
          :index="idx"
          v-model:order="orders[idx]" />
      </template>
      <template v-else>
        <OrderBlock :index="0" v-model:order="orders[0]" />
      </template>
    </section>
    <!-- ✅ 餐點摘要卡片 -->
    <section
      v-if="orders.length > 0 && orders.some((order) => order.main || order.drink || order.side)"
      class="grid gap-4 grid-cols-1 sm:grid-cols-2 mb-8">
      <div
        v-for="(order, i) in orders"
        :key="i"
        class="bg-white border border-gray-200 rounded-lg shadow p-4 space-y-2">
        <h3 class="font-semibold text-blue-800">第 {{ i + 1 }} 位</h3>
        <p>
          主餐：{{ getItemByCode('main', order.main, menu)?.name || '－' }}<br />
          飲品：{{ getItemByCode('drink', order.drink, menu)?.name || '－' }}<br />
          副餐：{{ getItemByCode('side', order.side, menu)?.name || '－' }}
        </p>
        <p v-if="order.addons?.length">
          加點：{{ order.addons.map((a) => getItemByCode('addon', a, menu)?.name).join('、') }}
        </p>
      </div>
    </section>

    <!-- ✅ 總金額 -->
    <p v-if="totalPrice" class="text-right font-bold text-gray-700 mb-6">
      總金額：{{ totalPrice }} 元（含 10% 服務費）
    </p>

    <!-- ✅ 提醒區 -->
    <div class="text-sm text-gray-600 mb-6">
      所有食材皆為自製，需耗費大量時間與人力，可能會有售完或臨時調整，敬請見諒。
    </div>

    <!-- ✅ 提交 -->
    <div class="text-center">
      <button
        type="button"
        :disabled="isSubmitting"
        @click="submitOrder"
        class="px-6 py-2 rounded bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 transition-all duration-300 ease-in-out animate">
        {{ isSubmitting ? '送出中...' : '送出訂單' }}
      </button>
      <p v-if="submitMessage" class="mt-2 text-green-600 text-sm animate-pulse">
        {{ submitMessage }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, inject } from 'vue'
import flatpickr from 'flatpickr'
import 'flatpickr/dist/flatpickr.min.css'
import FlatpickrLanguages from 'flatpickr/dist/l10n'
import { useRoute } from 'vue-router'
import OrderBlock from '@/components/OrderBlock.vue'
import { getItemByCode, calcTotal } from '@/utils/helpers'

const menu = inject('menu', { main: [], drink: [], side: [], addon: [] })
const holidays = inject('holidays', [])

const form = reactive({
  name: '',
  date: '',
  time: '',
  people: null,
  orders: []
})

const dateInput = ref(null)
const timeSlots = ['11:30–13:00', '12:20–13:50', '13:10–14:40', '14:00–15:30']
const orderMode = ref('group')
const route = useRoute()

onMounted(() => {
  if (route.query.mode === 'individual') orderMode.value = 'individual'
  initCalendar()
})

const initCalendar = () => {
  if (!dateInput.value) return

  flatpickr.localize({ ...FlatpickrLanguages['zh_tw'], firstDayOfWeek: 0 })
  flatpickr(dateInput.value, {
    dateFormat: 'Y-m-d',
    minDate: 'today',
    disable: [(d) => d.getDay() === 3 || d.getDay() === 4],
    onChange: ([date]) => {
      form.date = date?.toISOString().split('T')[0] || ''
    },
    onDayCreate(_, __, ___, dayElem) {
      const d = dayElem.dateObj
      const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      if (Array.isArray(holidays) && holidays.includes(ds)) {
        dayElem.classList.add('holiday-highlight')
      }
      if (d.getDay() === 3 || d.getDay() === 4) {
        dayElem.title = '店休'
      }
    }
  })
}

// ✅ 關鍵修正：初始化時 addons 一定是陣列
watch(
  () => form.people,
  (count) => {
    const n = Number(count)
    if (n > 0) {
      form.orders = Array.from({ length: n }, () => ({
        main: '',
        drink: '',
        side: '',
        addons: []
      }))
    } else {
      form.orders = []
    }
  }
)

const totalPrice = computed(() => calcTotal(form.orders, menu))
const isSubmitting = ref(false)
const submitMessage = ref('')

const submitOrder = async () => {
  if (!form.name || !form.date || !form.time || !form.people) return

  isSubmitting.value = true
  submitMessage.value = ''

  const payload = {
    ...form,
    orders: JSON.parse(JSON.stringify(form.orders))
  }

  try {
    const res = await fetch(
      'https://script.google.com/macros/s/AKfycbxsywNwio4gJU4acT7vHdRXnQxUdNVBBob8mFDsy_vkf2eKJEe6LRsQwZrVEHdmBmImow/exec',
      {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' }
      }
    )
    const result = await res.json()
    if (result.result === 'success') {
      submitMessage.value = '✅ 訂單已送出！'
      setTimeout(() => {
        submitMessage.value = ''
        form.name = ''
        form.date = ''
        form.time = ''
        form.people = null
        form.orders = []
        orderMode.value = 'group'
      }, 2000)
    } else {
      submitMessage.value = '❌ 訂單送出失敗'
    }
  } catch (err) {
    submitMessage.value = '❌ 發送失敗，請稍後再試'
    console.error(err)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style>
flatpickr-day.holiday-highlight {
  color: red !important;
  font-weight: bold !important;
}
.flatpickr-day.holiday-highlight.selected,
.flatpickr-day.holiday-highlight.selected:hover {
  background: #ffe5e5 !important;
  font-weight: bold !important;
}
</style>

<style scoped>
.input {
  @apply w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-400;
}

button:disabled {
  opacity: 0.5;
  pointer-events: none;
}

/* 卡片樣式的訂單摘要 */
.order-card {
  @apply p-4 bg-white rounded-lg shadow border border-gray-200;
}
.order-card h3 {
  @apply text-lg font-semibold text-gray-800 mb-2;
}
.order-card ul {
  @apply list-disc list-inside text-sm text-gray-700;
}
.order-card ul li span {
  @apply font-medium text-gray-900;
}

/* 送出動畫效果 */
button[type='button'].animate {
  @apply transition-all duration-300 ease-in-out transform hover:scale-105;
}
</style>

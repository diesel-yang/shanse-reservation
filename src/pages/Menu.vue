<template>
  <div class="max-w-5xl mx-auto px-4 py-8 text-gray-800">
    <div class="flex flex-col items-center mb-6">
      <h1 class="text-3xl font-bold text-blue-900">預先點餐</h1>
    </div>

    <!-- 訂位資料 -->
    <section class="bg-white rounded-lg shadow-md p-4 mb-6">
      <input v-model="form.name" type="text" placeholder="姓名" class="input" required />
      <input ref="dateInput" type="text" placeholder="用餐日期" class="input" required />
      <div class="flex flex-wrap gap-2 my-2">
        <button
          v-for="slot in timeSlots"
          :key="slot"
          type="button"
          :class="[
            'px-3 py-2 rounded border',
            form.time === slot ? 'bg-orange-500 text-white' : 'bg-white text-gray-800'
          ]"
          @click="form.time = slot"
        >
          {{ slot }}
        </button>
      </div>
      <select v-model.number="form.people" class="input" required>
        <option disabled value="">請選擇人數</option>
        <option v-for="n in 8" :key="n" :value="n">{{ n }} 位</option>
      </select>
    </section>

    <!-- 點餐模式 -->
    <section class="bg-white rounded-lg shadow-md p-4 mb-6">
      <label><input type="radio" v-model="orderMode" value="group" /> 共同點餐</label>
      <label><input type="radio" v-model="orderMode" value="individual" /> 個別點餐</label>
    </section>

    <!-- 每位顧客的點餐區塊 + 摘要 -->
    <section v-if="Array.isArray(form.orders) && form.orders.length > 0">
      <div
        v-for="(order, idx) in form.orders"
        :key="idx"
        class="mb-6 border border-gray-200 rounded-lg shadow bg-white p-4"
      >
        <OrderBlock :index="idx" v-model:order="form.orders[idx]" />

        <!-- 摘要區塊（顯示在每位顧客後） -->
        <div class="text-sm text-gray-800 mt-4">
          <h3 class="font-semibold text-blue-800 mb-1">第 {{ idx + 1 }} 位顧客</h3>
          <p>主餐：{{ getItemByCode('main', order.main, menu)?.name || '－' }}</p>
          <p>飲品：{{ getItemByCode('drink', order.drink, menu)?.name || '－' }}</p>
          <p>副餐：{{ getItemByCode('side', order.side, menu)?.name || '－' }}</p>
          <p v-if="Array.isArray(order.addons) && order.addons.length > 0">
            加點：{{
              order.addons.map(code => getItemByCode('addon', code, menu)?.name).join('、')
            }}
          </p>
          <div v-if="order" class="mt-2">
            <p>套餐：{{ calcPriceBreakdown(order, menu).base }} 元</p>
            <p>加點：{{ calcPriceBreakdown(order, menu).addon }} 元</p>
            <p>服務費（10%）：{{ calcPriceBreakdown(order, menu).service }} 元</p>
            <p class="font-semibold">總金額：{{ calcPriceBreakdown(order, menu).total }} 元</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 最下方總金額 -->
    <section v-if="totalPrice > 0" class="mt-6 text-right text-lg font-semibold text-gray-900">
      總消費金額：{{ totalPrice }} 元（含 10% 服務費）
    </section>

    <!-- 送出 -->
    <div class="text-center mt-6">
      <button
        type="button"
        :disabled="isSubmitting"
        @click="submitOrder"
        class="px-6 py-2 rounded bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50"
      >
        {{ isSubmitting ? '送出中...' : '送出訂單' }}
      </button>
      <p v-if="submitMessage" class="mt-2 text-green-600 text-sm animate-pulse">
        {{ submitMessage }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, inject, toRaw } from 'vue'
import flatpickr from 'flatpickr'
import 'flatpickr/dist/flatpickr.min.css'
import FlatpickrLanguages from 'flatpickr/dist/l10n'

import OrderBlock from '@/components/OrderBlock.vue'
import { getItemByCode, calcTotal, calcPriceBreakdown } from '@/utils/helpers'

const menu = inject('menu', { main: [], drink: [], side: [], addon: [] })
const holidays = inject('holidays', [])

const dateInput = ref(null)
const timeSlots = ['11:30–13:00', '12:20–13:50', '13:10–14:40', '14:00–15:30']
const orderMode = ref('group')

const form = reactive({
  name: '',
  date: '',
  time: '',
  people: '',
  orders: []
})

const isSubmitting = ref(false)
const submitMessage = ref('')

onMounted(() => {
  flatpickr.localize({ ...FlatpickrLanguages['zh_tw'], firstDayOfWeek: 0 })

  flatpickr(dateInput.value, {
    dateFormat: 'Y-m-d',
    minDate: 'today',
    disable: [d => d.getDay() === 3 || d.getDay() === 4], // 店休日（三四）
    onChange: ([date]) => {
      form.date = date?.toISOString().split('T')[0] || ''
    },
    onDayCreate(_, __, ___, dayElem) {
      const d = dayElem.dateObj
      const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

      const holidayList = toRaw(holidays)
      if (Array.isArray(holidayList) && holidayList.includes(ds)) {
        console.log('🎯 套用紅字日期:', ds)
        dayElem.classList.add('holiday-highlight')
      }
    }
  })
})
watch(
  () => form.people,
  n => {
    const count = Number(n)
    form.orders =
      count > 0
        ? Array.from({ length: count }, () => ({
            main: '',
            drink: '',
            side: '',
            addons: []
          }))
        : []
  }
)

const totalPrice = computed(() => {
  return Array.isArray(form.orders) && form.orders.length > 0 ? calcTotal(form.orders, menu) : 0
})

console.log('🧾 計算總金額:', form.orders, menu, calcTotal(form.orders, menu))

const submitOrder = async () => {
  if (!form.name || !form.date || !form.time || !form.people) return

  isSubmitting.value = true
  submitMessage.value = ''

  // 將資料組裝成 URLSearchParams
  const payload = new URLSearchParams()
  payload.append('name', form.name)
  payload.append('date', form.date)
  payload.append('time', form.time)
  payload.append('people', form.people)

  form.orders.forEach((order, i) => {
    payload.append(`main_${i}`, order.main || '')
    payload.append(`drink_${i}`, order.drink || '')
    payload.append(`side_${i}`, order.side || '')

    const addons = Array.isArray(order.addons) ? order.addons : []
    addons.forEach((addon, j) => {
      payload.append(`addon_${i}_${j}`, addon) // 每筆加點獨立欄位
    })
  })

  console.log('🔥 送出內容:', payload.toString())

  try {
    const res = await fetch(
      'https://script.google.com/macros/s/AKfycbxsywNwio4gJU4acT7vHdRXnQxUdNVBBob8mFDsy_vkf2eKJEe6LRsQwZrVEHdmBmImow/exec',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: payload
      }
    )

    const result = await res.text()
    submitMessage.value = result.includes('成功') ? '✅ 訂單已送出！' : '❌ 訂單送出失敗'
  } catch (err) {
    console.error('❌ 發送失敗:', err)
    submitMessage.value = '❌ 發送失敗，請稍後再試'
  } finally {
    isSubmitting.value = false
    setTimeout(() => (submitMessage.value = ''), 2000)
  }
}
</script>

<style>
.input {
  @apply w-full p-2 border border-gray-300 rounded mb-2;
}
.holiday-highlight {
  color: red !important;
  font-weight: bold !important;
}
.holiday-highlight.selected,
.holiday-highlight.selected:hover {
  background: #ffe5e5 !important;
  color: red !important;
  font-weight: bold !important;
}
</style>

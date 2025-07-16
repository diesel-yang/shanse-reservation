<script setup>
import { ref, reactive, computed, watch, onMounted, inject, toRaw } from 'vue'
import flatpickr from 'flatpickr'
import 'flatpickr/dist/flatpickr.min.css'

import FlatpickrLanguages from 'flatpickr/dist/l10n'

import OrderBlock from '@/components/OrderBlock.vue'
import { getItemByCode, calcTotal } from '@/utils/helpers'

// ✅ 注入 menu 與 holidays，並提供預設值避免 undefined
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
    disable: [d => d.getDay() === 3 || d.getDay() === 4],
    onChange: ([date]) => {
      form.date = date?.toISOString().split('T')[0] || ''
    },
    onDayCreate(_, __, ___, dayElem) {
      const d = dayElem.dateObj
      const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      if (Array.isArray(toRaw(holidays)) && toRaw(holidays).includes(ds)) {
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
const submitOrder = async () => {
  if (!form.name || !form.date || !form.time || !form.people) return

  isSubmitting.value = true
  submitMessage.value = ''

  const formData = new URLSearchParams()
  formData.append('訂位姓名', form.name)
  formData.append('用餐日期', form.date)
  formData.append('用餐時段', form.time)
  formData.append('人數', form.people)

  form.orders.forEach((order, idx) => {
    formData.append(`main_${idx}`, order.main || '')
    formData.append(`drink_${idx}`, order.drink || '')
    formData.append(`side_${idx}`, order.side || '')

    // 加點：展開至 addon_0、addon_1...，最多 4 個
    const addons = Array.isArray(order.addons) ? order.addons.slice(0, 4) : []
    addons.forEach((addon, i) => {
      formData.append(`addon_${idx}`, addon)
    })
  })

  try {
    const res = await fetch(
      'const submitOrder = async () => {
  if (!form.name || !form.date || !form.time || !form.people) return

  isSubmitting.value = true
  submitMessage.value = ''

  const formData = new URLSearchParams()
  formData.append('訂位姓名', form.name)
  formData.append('用餐日期', form.date)
  formData.append('用餐時段', form.time)
  formData.append('人數', form.people)

  form.orders.forEach((order, idx) => {
    formData.append(`main_${idx}`, order.main || '')
    formData.append(`drink_${idx}`, order.drink || '')
    formData.append(`side_${idx}`, order.side || '')

    // 加點：展開至 addon_0、addon_1...，最多 4 個
    const addons = Array.isArray(order.addons) ? order.addons.slice(0, 4) : []
    addons.forEach((addon, i) => {
      formData.append(`addon_${idx}`, addon)
    })
  })

  try {
    const res = await fetch(
      'https://script.google.com/macros/s/AKfycbxsywNwio4gJU4acT7vHdRXnQxUdNVBBob8mFDsy_vkf2eKJEe6LRsQwZrVEHdmBmImow/exec',
      {
        method: 'POST',
        body: formData // ✅ 使用 URLSearchParams，自動設定為 x-www-form-urlencoded
      }
    )

    const text = await res.text()
    submitMessage.value = text.includes('成功') ? '✅ 訂單已送出！' : '❌ 訂單送出失敗'
  } catch (err) {
    console.error('送出錯誤：', err)
    submitMessage.value = '❌ 發送失敗，請稍後再試'
  } finally {
    isSubmitting.value = false
    setTimeout(() => (submitMessage.value = ''), 2500)
  }
}',
      {
        method: 'POST',
        body: formData // ✅ 使用 URLSearchParams，自動設定為 x-www-form-urlencoded
      }
    )

    const text = await res.text()
    submitMessage.value = text.includes('成功') ? '✅ 訂單已送出！' : '❌ 訂單送出失敗'
  } catch (err) {
    console.error('送出錯誤：', err)
    submitMessage.value = '❌ 發送失敗，請稍後再試'
  } finally {
    isSubmitting.value = false
    setTimeout(() => (submitMessage.value = ''), 2500)
  }
}
</script>

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

    <!-- 每位顧客的點餐區塊 -->
    <section v-if="Array.isArray(form.orders) && form.orders.length > 0">
      <OrderBlock
        v-for="(order, idx) in form.orders"
        :key="idx"
        :index="idx"
        v-model:order="form.orders[idx]"
      />
    </section>

    <!-- 餐點摘要 -->
    <section
      v-if="Array.isArray(form.orders) && form.orders.some(o => o.main || o.drink || o.side)"
      class="mt-6 grid gap-4 grid-cols-1 sm:grid-cols-2"
    >
      <div
        v-for="(order, i) in form.orders"
        :key="i"
        class="p-4 bg-white border border-gray-300 rounded shadow"
      >
        <h3 class="font-semibold text-blue-800">第 {{ i + 1 }} 位</h3>
        <p>主餐：{{ getItemByCode('main', order.main, menu)?.name || '－' }}</p>
        <p>飲品：{{ getItemByCode('drink', order.drink, menu)?.name || '－' }}</p>
        <p>副餐：{{ getItemByCode('side', order.side, menu)?.name || '－' }}</p>
        <p v-if="Array.isArray(order.addons) && order.addons.length > 0">
          加點：{{ order.addons.map(code => getItemByCode('addon', code, menu)?.name).join('、') }}
        </p>
      </div>
    </section>

    <!-- 小計 -->
    <p v-if="totalPrice > 0" class="text-right text-lg font-semibold my-4">
      總金額：{{ totalPrice }} 元（含 10% 服務費）
    </p>

    <!-- 送出 -->
    <div class="text-center">
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

<style scoped>
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

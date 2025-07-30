<template>
  <div class="max-w-5xl mx-auto px-4 py-8 text-gray-800">
    <!-- 標題 -->
    <div class="flex flex-col items-center mb-6">
      <h1 class="text-3xl font-bold text-blue-900">預先點餐</h1>
    </div>

    <!-- 訂位資料 -->
    <section class="bg-white rounded-lg shadow-md p-4 mb-6">
      <input v-model="form.name" type="text" placeholder="訂位姓名" class="input" required />
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
        <option disabled value="">用餐人數</option>
        <option v-for="n in 8" :key="n" :value="n">{{ n }} 位</option>
      </select>
    </section>

    <!-- 點餐模式切換區塊 -->
    <section v-if="form.people > 1" class="bg-white rounded-lg shadow-md p-4 mb-6">
      <h2 class="text-center text-gray-800 text-base font-semibold mb-2">請選擇點餐方式</h2>
      <div class="flex justify-center gap-4 flex-wrap">
        <button
          type="button"
          class="w-40 px-4 py-3 rounded border font-semibold text-gray-700 text-center leading-snug transition"
          :class="[
            orderMode === 'group'
              ? 'bg-orange-500 text-white border-orange-500'
              : 'bg-white border-gray-300 hover:bg-orange-100'
          ]"
          @click="confirmSwitchMode('group')"
        >
          多人一起點<br class="sm:hidden" />
          <span class="text-sm font-normal">(幫全桌點餐)</span>
        </button>

        <button
          type="button"
          class="w-40 px-4 py-3 rounded border font-semibold text-gray-700 text-center leading-snug transition"
          :class="[
            orderMode === 'individual'
              ? 'bg-orange-500 text-white border-orange-500'
              : 'bg-white border-gray-300 hover:bg-orange-100'
          ]"
          @click="confirmSwitchMode('individual')"
        >
          自己點自己的<br class="sm:hidden" />
          <span class="text-sm font-normal">(每人各自選)</span>
        </button>
      </div>
    </section>

    <!-- 每位顧客點餐區塊 -->
    <section v-if="form.orders.length">
      <div
        v-for="(order, idx) in form.orders"
        :key="idx"
        class="mb-6 border border-gray-200 rounded-lg shadow bg-white p-4"
      >
        <OrderBlock
          :index="idx"
          v-model:order="form.orders[idx]"
          :hide-title="orderMode === 'individual' || form.people === 1"
        />

        <!-- 顧客明細摘要 -->
        <div class="text-sm text-gray-800 mt-4">
          <!-- ✅ 顧客 title -->
          <h3
            v-if="!(orderMode === 'individual' || form.people === 1)"
            class="font-semibold text-blue-800 mb-1"
          >
            第 {{ idx + 1 }} 位顧客
          </h3>

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

    <!-- 總金額 -->
    <section v-if="totalPrice > 0" class="mt-6 text-right text-lg font-semibold text-gray-900">
      總消費金額：{{ totalPrice }} 元（含 10% 服務費）
    </section>

    <!-- 送出按鈕 -->
    <div class="text-center mt-6">
      <button
        type="button"
        :disabled="isSubmitting || !orderMode"
        @click="submitOrder"
        class="px-6 py-2 rounded bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50"
      >
        {{ isSubmitting ? '送出中...' : '送出訂單' }}
      </button>
      <p v-if="submitMessage" class="mt-2 text-green-600 text-sm animate-pulse">
        {{ submitMessage }}
      </p>
    </div>

    <!-- ✅ 點餐模式切換確認彈窗 -->
    <div
      v-if="showConfirmModal"
      class="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center"
    >
      <div class="bg-white rounded-lg shadow-xl p-6 w-11/12 max-w-sm">
        <h2 class="text-lg font-semibold mb-4 text-gray-800">切換點餐模式</h2>
        <p class="text-gray-700 mb-6 text-sm">
          您將更換點餐模式，已點餐資料將清除，是否確定更改？
        </p>
        <div class="flex justify-end gap-3">
          <button
            class="px-4 py-2 bg-gray-200 rounded text-gray-700 hover:bg-gray-300"
            @click="cancelSwitch"
          >取消</button>
          <button
            class="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            @click="applySwitchMode"
          >確定</button>
        </div>
      </div>
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
import { resetForm } from '@/utils/resetForm'

const menu = inject('menu', {
  main: [],
  drink: [],
  side: [],
  addon: []
})
const holidays = inject('holidays', [])
const dateInput = ref(null)

const timeSlots = ['11:30–13:00', '12:30–13:50', '13:10–14:40', '14:00–15:30']
const isSubmitting = ref(false)
const submitMessage = ref('')
const orderMode = ref('') // group 或 individual

const form = reactive({
  name: '',
  date: '',
  time: '',
  people: '',
  orders: []
})

// ✅ 初始化日期選擇器
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
      const holidayList = toRaw(holidays)
      if (Array.isArray(holidayList) && holidayList.includes(ds)) {
        dayElem.classList.add('holiday-highlight')
      }
    }
  })
})

// ✅ 當人數變動時，自動初始化點餐資料
watch(() => form.people, (newVal) => {
  if (newVal === 1) {
    orderMode.value = 'individual'
    form.orders = [{ main: '', drink: '', side: '', addons: [] }]
  } else {
    orderMode.value = ''
    form.orders = []
  }
})

// ✅ 計算總金額
const totalPrice = computed(() => {
  const all = form.orders.map(order => calcPriceBreakdown(order, menu).total || 0)
  return all.reduce((a, b) => a + b, 0)
})

// ✅ 設定點餐模式並初始化 orders
function setOrderMode(mode) {
  orderMode.value = mode
  form.orders = []

  if (mode === 'group' && form.people) {
    for (let i = 0; i < form.people; i++) {
      form.orders.push({ main: '', drink: '', side: '', addons: [] })
    }
  } else if (mode === 'individual') {
    form.orders.push({ main: '', drink: '', side: '', addons: [] })
  }
}

// ✅ 自訂 modal 控制
const showConfirmModal = ref(false)
const pendingMode = ref('')

function confirmSwitchMode(mode) {
  if (orderMode.value && orderMode.value !== mode) {
    pendingMode.value = mode
    showConfirmModal.value = true
  } else {
    setOrderMode(mode)
  }
}

function applySwitchMode() {
  setOrderMode(pendingMode.value)
  showConfirmModal.value = false
}

function cancelSwitch() {
  showConfirmModal.value = false
}

// ✅ 送出訂單
async function submitOrder() {
  const isFormComplete =
    form.name &&
    form.date &&
    form.time &&
    form.people &&
    form.orders.length > 0 &&
    form.orders.every(o => o.main && o.drink && o.side)

  if (!isFormComplete) {
    submitMessage.value = '❌ 請填寫所有必填欄位'
    return
  }

  isSubmitting.value = true
  submitMessage.value = ''

  const payload = new URLSearchParams()
  payload.append('name', form.name)
  payload.append('date', form.date)
  payload.append('time', form.time)
  payload.append('people', form.people)
  payload.append('orders', JSON.stringify(form.orders))

  try {
    const res = await fetch(import.meta.env.VITE_GAS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: payload.toString()
    })

    const resultText = await res.text()
    let resultJson = {}

    try {
      resultJson = JSON.parse(resultText)
    } catch (e) {
      submitMessage.value = '❌ 後端回傳格式錯誤'
      return
    }

    if (resultJson.result === 'success') {
      submitMessage.value = '✅ 已成功送出訂單！'
      resetForm(form, orderMode, dateInput)
    } else {
      submitMessage.value = '❌ 訂單送出失敗：' + (resultJson.message || resultText)
    }
  } catch (err) {
    submitMessage.value = '❌ 發生錯誤：' + err.message
  } finally {
    isSubmitting.value = false
    setTimeout(() => (submitMessage.value = ''), 3000)
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
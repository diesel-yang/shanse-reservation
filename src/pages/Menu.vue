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
    dateFormat: 'm-d (D)', // 顯示格式為「月-日 星期」
    altInput: true,
    altFormat: 'm-d (D)',
    minDate: 'today',
    disable: [d => d.getDay() === 3 || d.getDay() === 4], // 週三週四店休
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
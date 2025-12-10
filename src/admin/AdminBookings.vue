<script setup>
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import { useAdminAuth } from '@/composables/useAdminAuth'

const {
  adminToken,
  ensureAdminLoggedIn
} = useAdminAuth()

// API base
const API_BASE = import.meta.env.VITE_CLOUD_RUN_ADMIN_BASE

// 今日日期
const currentDate = ref(dayjs().format('YYYY-MM-DD'))

// 訂位資料
const bookings = ref([])
const loading = ref(false)

// Modal 控制
const showModal = ref(false)
const<script setup>
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import { useAdminAuth } from '@/composables/useAdminAuth'

const { adminToken, ensureAdminLoggedIn } = useAdminAuth()

// Cloud Run Base URL（例如：https://linepay-proxy-xxxx.a.run.app）
const API_BASE = import.meta.env.VITE_CLOUD_RUN_ADMIN_BASE

const currentDate = ref(dayjs().format('YYYY-MM-DD'))
const bookings = ref([])
const loading = ref(false)

// Modal 控制
const showModal = ref(false)
const form = ref({
  name: '',
  phone: '',
  date: currentDate.value,
  time: '',
  people: 2,
  note: '',
  deposit: 0,
  payment_method: 'none'
})

/* ================================
 * API：讀取訂位
 * ================================ */
async function fetchBookings() {
  loading.value = true
  try {
    const url = `${API_BASE}/admin/booking/list?date=${currentDate.value}`
    const resp = await fetch(url, {
      headers: {
        Authorization: `Bearer ${adminToken.value}`
      }
    })
    const json = await resp.json()
    if (json.success) {
      bookings.value = json.data || []
    } else {
      console.error('booking list error', json)
    }
  } catch (err) {
    console.error('fetchBookings error', err)
  }
  loading.value = false
}

function prevDate() {
  currentDate.value = dayjs(currentDate.value)
    .subtract(1, 'day')
    .format('YYYY-MM-DD')
  fetchBookings()
}

function nextDate() {
  currentDate.value = dayjs(currentDate.value)
    .add(1, 'day')
    .format('YYYY-MM-DD')
  fetchBookings()
}

/* ================================
 * 新增訂位（Modal）
 * ================================ */
function openModal() {
  form.value = {
    name: '',
    phone: '',
    date: currentDate.value,
    time: '',
    people: 2,
    note: '',
    deposit: 0,
    payment_method: 'none'
  }
  showModal.value = true
}

async function createBooking() {
  try {
    const url = `${API_BASE}/admin/booking/create`
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken.value}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(form.value)
    })
    const json = await resp.json()

    if (json.result === 'success') {
      showModal.value = false
      await fetchBookings()
    } else {
      alert(json.message || '新增訂位失敗')
    }
  } catch (err) {
    console.error('createBooking error', err)
    alert('新增訂位失敗')
  }
}

/* ================================
 * 更新 / 刪除
 * ================================ */
async function updateBooking(b) {
  try {
    const url = `${API_BASE}/admin/booking/update`
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken.value}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        bookingId: b.bookingId,
        status: b.status,
        note: b.note,
        deposit: b.deposit,
        payment_method: b.payment_method
      })
    })
    await resp.json()
    await fetchBookings()
  } catch (err) {
    console.error('updateBooking error', err)
  }
}

async function deleteBooking(b) {
  if (!confirm(`確定要刪除訂位？ (${b.name} ${b.date} ${b.time})`)) return

  try {
    const url = `${API_BASE}/admin/booking/delete`
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken.value}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ bookingId: b.bookingId })
    })
    await resp.json()
    await fetchBookings()
  } catch (err) {
    console.error('deleteBooking error', err)
  }
}

/* ================================
 * V2：統計視圖
 * ================================ */
const stats = computed(() => {
  const list = bookings.value || []
  const totalBookings = list.length
  let totalPeople = 0
  let totalDeposit = 0
  let pending = 0
  let arrived = 0
  let cancelled = 0
  let refunded = 0

  for (const b of list) {
    totalPeople += Number(b.people || 0)
    totalDeposit += Number(b.deposit || 0)

    switch (b.status) {
      case 'pending':
        pending++
        break
      case 'arrived':
        arrived++
        break
      case 'cancelled':
        cancelled++
        break
      case 'refunded':
        refunded++
        break
    }
  }

  return {
    totalBookings,
    totalPeople,
    totalDeposit,
    pending,
    arrived,
    cancelled,
    refunded
  }
})

/** 時段彙總：以 time 為 key，統計人數與訂金 **/
const timeslotSummary = computed(() => {
  const map = new Map()

  for (const b of bookings.value || []) {
    const key = b.time || ''
    if (!key) continue

    if (!map.has(key)) {
      map.set(key, {
        time: key,
        count: 0,
        people: 0,
        deposit: 0
      })
    }
    const slot = map.get(key)
    slot.count += 1
    slot.people += Number(b.people || 0)
    slot.deposit += Number(b.deposit || 0)
  }

  // 依時間排序
  return Array.from(map.values()).sort((a, b) => {
    if (a.time < b.time) return -1
    if (a.time > b.time) return 1
    return 0
  })
})

onMounted(async () => {
  await ensureAdminLoggedIn()
  await fetchBookings()
})
</script>

<template>
  <div class="p-4 space-y-4">

    <!-- 日期切換 -->
    <div class="flex justify-between items-center">
      <button @click="prevDate" class="px-3 py-1 bg-gray-200 rounded">
        ←
      </button>

      <div class="font-bold text-lg text-center">
        {{ currentDate }}
      </div>

      <button @click="nextDate" class="px-3 py-1 bg-gray-200 rounded">
        →
      </button>
    </div>

    <!-- 統計區：數字總覽 -->
    <div class="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
      <div class="bg-white rounded shadow p-3">
        <div class="text-gray-500">當日訂位數</div>
        <div class="text-xl font-bold">{{ stats.totalBookings }}</div>
      </div>
      <div class="bg-white rounded shadow p-3">
        <div class="text-gray-500">總人數</div>
        <div class="text-xl font-bold">{{ stats.totalPeople }}</div>
      </div>
      <div class="bg-white rounded shadow p-3">
        <div class="text-gray-500">總訂金</div>
        <div class="text-xl font
 form = ref({
  name: '',
  phone: '',
  date: currentDate.value,
  time: '',
  people: 2,
  note: '',
  deposit: 0,
  payment_method: 'none'
})

// 取得訂位列表
async function fetchBookings() {
  loading.value = true
  try {
    const url = `${API_BASE}/admin/booking/list?date=${currentDate.value}`
    const resp = await fetch(url, {
      headers: {
        Authorization: `Bearer ${adminToken.value}`
      }
    })
    const json = await resp.json()
    if (json.success) {
      bookings.value = json.data
    }
  } catch (err) {
    console.error('fetch error', err)
  }
  loading.value = false
}

// 切換日期
function prevDate() {
  currentDate.value = dayjs(currentDate.value).subtract(1, 'day').format('YYYY-MM-DD')
  fetchBookings()
}

function nextDate() {
  currentDate.value = dayjs(currentDate.value).add(1, 'day').format('YYYY-MM-DD')
  fetchBookings()
}

// 開啟新增訂位
function openModal() {
  form.value = {
    name: '',
    phone: '',
    date: currentDate.value,
    time: '',
    people: 2,
    note: '',
    deposit: 0,
    payment_method: 'none'
  }
  showModal.value = true
}

// 新增訂位
async function createBooking() {
  try {
    const url = `${API_BASE}/admin/booking/create`
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken.value}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(form.value)
    })
    const json = await resp.json()

    if (json.result === 'success') {
      showModal.value = false
      fetchBookings()
    } else {
      alert(json.message || '新增訂位失敗')
    }
  } catch (err) {
    console.error(err)
  }
}

// 更新訂位（狀態或備註）
async function updateBooking(b) {
  try {
    const url = `${API_BASE}/admin/booking/update`
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken.value}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        bookingId: b.bookingId,
        status: b.status,
        note: b.note,
        deposit: b.deposit,
        payment_method: b.payment_method
      })
    })
    await resp.json()
    fetchBookings()
  } catch (err) {
    console.error(err)
  }
}

// 刪除訂位
async function deleteBooking(b) {
  if (!confirm(`確定要刪除訂位？ (${b.name} ${b.date} ${b.time})`)) return

  const url = `${API_BASE}/admin/booking/delete`

  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken.value}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ bookingId: b.bookingId })
    })

    await resp.json()
    fetchBookings()
  } catch (err) {
    console.error(err)
  }
}

onMounted(async () => {
  await ensureAdminLoggedIn()
  fetchBookings()
})
</script>

<template>
  <div class="p-4">

    <!-- 日期切換 -->
    <div class="flex justify-between items-center mb-4">
      <button @click="prevDate" class="px-3 py-1 bg-gray-200 rounded">←</button>

      <div class="font-bold text-lg text-center">
        {{ currentDate }}
      </div>

      <button @click="nextDate" class="px-3 py-1 bg-gray-200 rounded">→</button>
    </div>

    <!-- 新增訂位按鈕 -->
    <div class="text-right mb-3">
      <button @click="openModal" class="px-4 py-2 bg-green-600 text-white rounded">
        ＋ 新增訂位
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center text-gray-500 py-6">
      載入中...
    </div>

    <!-- 訂位列表 -->
    <div v-for="b in bookings" :key="b.bookingId"
      class="border rounded-lg p-4 mb-3 bg-white shadow-sm">

      <div class="flex justify-between items-center">
        <div class="text-lg font-semibold">
          {{ b.time }}（{{ b.people }} 位）
        </div>
        <span
          class="text-sm px-2 py-1 rounded"
          :class="{
            'bg-gray-300': b.status === 'pending',
            'bg-green-300': b.status === 'arrived',
            'bg-red-300': b.status === 'cancelled',
            'bg-blue-300': b.status === 'refunded'
          }"
        >
          {{ b.status }}
        </span>
      </div>

      <div class="mt-1 text-gray-700">
        {{ b.name }}　{{ b.phone }}
      </div>

      <div class="text-sm text-gray-500 mt-1">
        訂金：{{ b.deposit }} / {{ b.payment_method }}
      </div>

      <div class="mt-2">
        備註：
        <textarea v-model="b.note"
          @change="updateBooking(b)"
          rows="2"
          class="w-full border rounded p-1 text-sm">
        </textarea>
      </div>

      <div class="flex gap-2 mt-3">
        <button
          @click="b.status = 'pending'; updateBooking(b)"
          class="px-3 py-1 bg-gray-300 rounded text-sm">
          未到
        </button>

        <button
          @click="b.status = 'arrived'; updateBooking(b)"
          class="px-3 py-1 bg-green-400 rounded text-sm">
          已到
        </button>

        <button
          @click="b.status = 'cancelled'; updateBooking(b)"
          class="px-3 py-1 bg-red-300 rounded text-sm">
          取消
        </button>

        <button
          v-if="b.deposit > 0"
          @click="b.status = 'refunded'; updateBooking(b)"
          class="px-3 py-1 bg-blue-300 rounded text-sm">
          已退款
        </button>

        <button
          @click="deleteBooking(b)"
          class="ml-auto px-3 py-1 bg-gray-700 text-white rounded text-sm">
          刪除
        </button>
      </div>
    </div>

    <!-- 新增訂位 Modal -->
    <div v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center p-4">
      <div class="bg-white rounded-lg w-full max-w-md p-6 shadow-lg">

        <h2 class="text-lg font-bold mb-4">新增訂位</h2>

        <div class="space-y-3">

          <input v-model="form.name" type="text" placeholder="姓名"
            class="w-full border rounded p-2">

          <input v-model="form.phone" type="text" placeholder="電話"
            class="w-full border rounded p-2">

          <input v-model="form.date" type="date"
            class="w-full border rounded p-2">

          <input v-model="form.time" type="time"
            class="w-full border rounded p-2">

          <input v-model.number="form.people" type="number" min="1"
            placeholder="人數"
            class="w-full border rounded p-2">

          <textarea v-model="form.note" placeholder="備註"
            class="w-full border rounded p-2"></textarea>

          <!-- 訂金 -->
          <div>
            <label class="block mb-1">訂金</label>
            <input v-model.number="form.deposit" type="number" min="0"
              class="w-full border rounded p-2">
          </div>

          <!-- 付款方式 -->
          <div>
            <label class="block mb-1">付款方式</label>
            <select v-model="form.payment_method" class="w-full border rounded p-2">
              <option value="none">無</option>
              <option value="cash">現金</option>
              <option value="transfer">轉帳</option>
              <option value="linepay">LINE Pay</option>
            </select>
          </div>

        </div>

        <!-- Modal 按鈕 -->
        <div class="flex justify-end gap-3 mt-6">
          <button @click="showModal = false"
            class="px-4 py-2 bg-gray-300 rounded">
            取消
          </button>
          <button @click="createBooking"
            class="px-4 py-2 bg-green-600 text-white rounded">
            建立
          </button>
        </div>

      </div>
    </div>

  </div>
</template>

<style scoped>
/* 讓 Modal 動畫更柔和，可選 */
</style>

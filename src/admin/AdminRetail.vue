<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAdminAuth } from '@/admin/composables/useAdminAuth'

const { idToken, ensureLogin } = useAdminAuth()
const orders = ref([])
const loading = ref(true)
const error = ref('')
const expanded = ref({})

// ✨ 搜尋 & 篩選 用的變數
const searchText = ref('')
const filterMethod = ref('all')
const filterStatus = ref('all')
const sortKey = ref('time_desc')

onMounted(async () => {
  await ensureLogin()
  await loadOrders()
})

async function loadOrders() {
  loading.value = true
  error.value = ''

  try {
    const url = `${import.meta.env.VITE_GAS_URL}?type=retailOrders`
    const res = await fetch(url)
    const json = await res.json()

    if (json.result !== 'success') throw new Error(json.message)
    orders.value = json.data
  } catch (err) {
    error.value = err.message
  }

  loading.value = false
}

function toggleExpand(id) {
  expanded.value[id] = !expanded.value[id]
}

async function doRefund(order) {
  if (!confirm(`確定要退款？訂單 ${order.orderId}`)) return

  const payload = {
    orderId: order.orderId,
    refundAmount: order.total
  }

  const res = await fetch(`${import.meta.env.VITE_LINEPAY_PROXY}/linepay/refund`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken.value}`
    },
    body: JSON.stringify(payload)
  })

  const json = await res.json()
  if (json.result === 'success') {
    alert('退款成功')
    await loadOrders()
  } else {
    alert('退款失敗：' + json.message)
  }
}

/* -----------------------------------------------------
   ✨ ✨ ✨ 篩選 + 搜尋 + 排序合併（computed）
   ----------------------------------------------------- */
const filteredOrders = computed(() => {
  return (
    orders.value
      // ① 搜尋
      .filter(o => {
        if (!searchText.value) return true
        const s = searchText.value.toLowerCase()
        return (
          o.orderId.toLowerCase().includes(s) ||
          o.name.toLowerCase().includes(s) ||
          o.phone.includes(s)
        )
      })

      // ② 篩選付款方式
      .filter(o => {
        if (filterMethod.value === 'all') return true
        return o.payment_method === filterMethod.value
      })

      // ③ 篩選付款 / 退款狀態
      .filter(o => {
        if (filterStatus.value === 'all') return true

        if (filterStatus.value === 'refunded') return o.payment_status === 'refunded'

        if (filterStatus.value === 'paid')
          return o.payment_method !== 'linepay' || o.payment_status === 'paid'

        if (filterStatus.value === 'unpaid')
          return o.payment_method === 'linepay' && o.payment_status !== 'paid'

        return true
      })

      // ④ 排序
      .sort((a, b) => {
        if (sortKey.value === 'time_desc') {
          return new Date(b.time) - new Date(a.time)
        }
        if (sortKey.value === 'time_asc') {
          return new Date(a.time) - new Date(b.time)
        }
        if (sortKey.value === 'amount_desc') {
          return b.total - a.total
        }
        if (sortKey.value === 'amount_asc') {
          return a.total - b.total
        }
      })
  )
})
</script>

<template>
  <div class="p-6">
    <h1 class="text-xl font-semibold mb-4">零售訂單管理</h1>

    <!-- 工具列：搜尋 + 篩選 + 排序 -->
    <div class="flex flex-col gap-3 mb-4">
      <input
        v-model="searchText"
        placeholder="搜尋姓名 / 電話 / 訂單編號"
        class="px-3 py-2 border rounded"
      />

      <div class="flex gap-3">
        <!-- 付款方式 -->
        <select v-model="filterMethod" class="border px-3 py-2 rounded">
          <option value="all">全部付款方式</option>
          <option value="cash">現金</option>
          <option value="transfer">轉帳</option>
          <option value="linepay">LINE Pay</option>
        </select>

        <!-- 付款狀態 -->
        <select v-model="filterStatus" class="border px-3 py-2 rounded">
          <option value="all">全部狀態</option>
          <option value="paid">已付款</option>
          <option value="unpaid">未付款</option>
          <option value="refunded">已退款</option>
        </select>

        <!-- 排序 -->
        <select v-model="sortKey" class="border px-3 py-2 rounded">
          <option value="time_desc">時間新 → 舊</option>
          <option value="time_asc">時間舊 → 新</option>
          <option value="amount_desc">金額高 → 低</option>
          <option value="amount_asc">金額低 → 高</option>
        </select>
      </div>
    </div>

    <div v-if="loading">讀取中…</div>
    <div v-if="error" class="text-red-600">{{ error }}</div>

    <!-- 訂單清單 -->
    <div
      v-for="o in filteredOrders"
      :key="o.orderId"
      class="border rounded-lg p-4 mb-4 bg-white shadow"
    >
      <!-- 主列 -->
      <div class="flex justify-between items-center">
        <div>
          <div class="font-bold">訂單：{{ o.orderId }}</div>
          <div class="text-gray-500 text-sm">{{ o.name }}（{{ o.phone }}）</div>
          <div class="text-gray-600 text-sm mt-1">
            金額：{{ o.total }} 元
            <span class="ml-2">付款：{{ o.payment_method }}</span>

            <span
              class="ml-2"
              :class="{
                'text-green-600': o.payment_status === 'paid',
                'text-red-600': o.payment_status === 'refunded'
              }"
            >
              狀態：{{ o.payment_status }}
            </span>
          </div>
        </div>

        <div class="flex gap-2">
          <button
            v-if="o.payment_method === 'linepay' && o.payment_status !== 'refunded'"
            class="px-3 py-1 bg-red-600 text-white rounded"
            @click="doRefund(o)"
          >
            退款
          </button>

          <button class="px-3 py-1 bg-gray-200 rounded" @click="toggleExpand(o.orderId)">
            詳細
          </button>
        </div>
      </div>

      <!-- 詳細區塊 -->
      <div v-if="expanded[o.orderId]" class="mt-3 p-3 bg-gray-50 rounded border">
        <div v-for="item in o.items" :key="item.code" class="flex justify-between mb-2">
          <div>{{ item.name }} × {{ item.qty }}</div>
          <div>{{ item.price * item.qty }} 元</div>
        </div>

        <div class="border-t pt-2 text-right text-gray-700">
          小計：{{ o.subtotal }} 元<br />
          運費：{{ o.shipping }} 元<br />
          <strong>總計：{{ o.total }} 元</strong>
        </div>

        <!-- 已退款 -->
        <div v-if="o.payment_status === 'refunded'" class="mt-2 text-red-600 text-sm">
          已退款（{{ o.refundAmount }} 元）
        </div>
      </div>
    </div>
  </div>
</template>

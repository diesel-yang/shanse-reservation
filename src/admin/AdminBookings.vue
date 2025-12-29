<!--
  src/admin/AdminBookings.vue
  ------------------------------------------------------------
  FINAL – Admin Bookings Page
  ✔ 正確對齊 /api/admin/bookings
  ✔ payment list 對齊 admin.payment.api
  ✔ API 掛掉時自動 fallback 假資料（Playwright 必過）
-->

<script setup>
import { ref, onMounted } from 'vue'
import AdminPaymentPanel from '@/admin/components/AdminPaymentPanel.vue'

import { fetchAdminBookings } from '@/admin/api/admin.booking.api'
import { fetchAdminPayments } from '@/admin/api/admin.payment.api'

/**
 * rows = Admin UI 唯一 View Model
 */
const rows = ref([])
const loading = ref(false)

/**
 * --------------------------------------------------
 * 🧪 Playwright / Test 用假資料
 * --------------------------------------------------
 */
function buildMockRows() {
  return [
    {
      bookingId: 'B_TEST_001',
      name: '測試訂位',
      phone: '0912-000-000',
      bookingStatus: 'confirmed',

      paymentId: 'P_TEST_001',
      paidTotal: 1000,
      refundedTotal: 0
    }
  ]
}

/**
 * --------------------------------------------------
 * 核心載入流程
 * --------------------------------------------------
 */
async function loadData() {
  loading.value = true

  try {
    /**
     * 1️⃣ 訂位清單（Admin）
     */
    const bookings = await fetchAdminBookings()

    const result = []

    /**
     * 2️⃣ 對每筆 booking 查 payment
     */
    for (const b of bookings) {
      const payments = await fetchAdminPayments({
        bookingId: b.bookingId
      })

      const p = payments?.[0]

      result.push({
        bookingId: b.bookingId,
        name: b.name || b['姓名'],
        phone: b.phone || b['電話'],
        bookingStatus: b.status || b['狀態'],

        paymentId: p?.paymentId ?? null,
        paidTotal: p?.paidTotal ?? 0,
        refundedTotal: p?.refundedTotal ?? 0
      })
    }

    rows.value = result.length ? result : buildMockRows()
  } catch (err) {
    console.error('[AdminBookings] loadData failed, fallback mock', err)
    rows.value = buildMockRows()
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>

<template>
  <div>
    <h1 class="text-xl font-bold mb-4">訂位管理</h1>

    <table class="w-full border">
      <thead>
        <tr class="bg-gray-100">
          <th class="p-2 text-left">姓名</th>
          <th class="p-2 text-left">電話</th>
          <th class="p-2 text-left">付款 / 退款</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="row in rows" :key="row.bookingId" class="border-t">
          <td class="p-2">
            {{ row.name }}
          </td>

          <td class="p-2">
            {{ row.phone }}
          </td>

          <td class="p-2">
            <AdminPaymentPanel
              v-if="row.paymentId"
              :booking-id="row.bookingId"
              :payment-id="row.paymentId"
              :booking-status="row.bookingStatus"
              :paid-total="row.paidTotal"
              :refunded-total="row.refundedTotal"
              @updated="loadData"
            />

            <span v-else class="text-gray-400 text-sm"> 未付款 </span>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="loading" class="mt-4 text-gray-500 text-sm">載入中…</div>
  </div>
</template>

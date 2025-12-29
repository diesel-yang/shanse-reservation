<script setup>
/**
 * AdminPaymentPanel.vue
 * -------------------------------------------------------------
 * 後台共用付款 / 退款面板
 *
 * 功能：
 * - 顯示付款 / 退款狀態（Badge）
 * - hover 展開 / click 固定
 * - 支援多次、部分退款
 *
 * 設計原則：
 * - 不直接計算業務邏輯
 * - 所有狀態來自 refund-state（Read Model）
 * - API 僅透過 admin.payment.api
 */

import { ref, computed } from 'vue'

/**
 * 退款狀態計算（純函式）
 * 來自 domain，不碰 API、不碰 UI
 */
import {
  computeRefundState,
  refundStateLabel,
  refundStateColor
} from '@/domain/payment/refund-state'

/**
 * Admin 專用 Payment API
 */
import { adminRefund } from '@/admin/api/admin.payment.api'

/**
 * -------------------------------------------------------------
 * Props
 * 由父層（AdminRetail / AdminBookings）傳入
 * -------------------------------------------------------------
 */
const props = defineProps({
  /** 訂單 ID */
  bookingId: { type: String, required: true },

  /** 付款 ID（Payment Ledger Key） */
  paymentId: { type: String, required: true },

  /** 訂單狀態（僅背景資訊） */
  bookingStatus: { type: String, required: true },

  /** 累計已付款金額 */
  paidTotal: { type: Number, required: true },

  /** 累計已退款金額 */
  refundedTotal: { type: Number, required: true }
})

/**
 * -------------------------------------------------------------
 * UI 狀態
 * -------------------------------------------------------------
 */
const hover = ref(false)          // 滑鼠移入
const expanded = ref(false)       // click 固定展開
const refundAmount = ref('')      // 輸入的退款金額
const loading = ref(false)
const error = ref(null)

/**
 * -------------------------------------------------------------
 * 計算退款狀態（來自 domain）
 * -------------------------------------------------------------
 */
const refundState = computed(() =>
  computeRefundState({
    bookingStatus: props.bookingStatus,
    paidTotal: props.paidTotal,
    refundedTotal: props.refundedTotal
  })
)

/**
 * Panel 顯示規則：
 * - hover 或 click 任一成立就顯示
 */
const showPanel = computed(() => hover.value || expanded.value)

/**
 * -------------------------------------------------------------
 * Emit
 * -------------------------------------------------------------
 * updated：
 * - 退款成功後通知父層重新載入資料
 */
const emit = defineEmits(['updated'])

/**
 * -------------------------------------------------------------
 * 執行退款
 * -------------------------------------------------------------
 */
async function submitRefund() {
  error.value = null

  const amount = Number(refundAmount.value)
  const refundable = props.paidTotal - props.refundedTotal

  // 基本防線（UI 層）
  if (!amount || amount <= 0 || amount > refundable) {
    error.value = '退款金額不正確'
    return
  }

  loading.value = true

  try {
    await adminRefund({
      bookingId: props.bookingId,
      paymentId: props.paymentId,
      amount,
      method: 'cash',        // 後台人工退款
      operator: 'admin-ui'
    })

    refundAmount.value = ''
    expanded.value = false

    // 通知父層刷新資料
    emit('updated')
  } catch (e) {
    error.value = e.message || '退款失敗'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div
    class="relative inline-block"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
  >
    <!-- -------------------------------------------------------
         Refund State Badge
         ------------------------------------------------------- -->
    <span
      class="px-2 py-1 rounded text-xs font-bold cursor-pointer select-none"
      :class="refundStateColor(refundState)"
      @click="expanded = !expanded"
      data-testid="refund-badge"
    >
      {{ refundStateLabel(refundState) }}
    </span>

    <!-- -------------------------------------------------------
         Payment Panel
         ------------------------------------------------------- -->
    <div
      v-if="showPanel"
      class="absolute right-0 z-20 mt-2 w-64 p-4 bg-white border rounded shadow-xl"
      data-testid="payment-panel"
    >
      <!-- 金額資訊 -->
      <div class="text-sm space-y-1">
        <div>已付：{{ paidTotal }}</div>
        <div>已退：{{ refundedTotal }}</div>
        <div class="font-semibold">
          可退：{{ paidTotal - refundedTotal }}
        </div>
      </div>

      <!-- 退款輸入 -->
      <div class="mt-3">
        <input
          v-model="refundAmount"
          type="number"
          :min="1"
          :max="paidTotal - refundedTotal"
          class="w-full border rounded px-2 py-1 text-sm"
          placeholder="退款金額"
          data-testid="refund-input"
        />
      </div>

      <!-- 退款按鈕 -->
      <button
        class="mt-2 w-full bg-red-500 text-white py-1 rounded disabled:opacity-50"
        :disabled="loading"
        @click="submitRefund"
        data-testid="refund-submit"
      >
        退款
      </button>

      <!-- 錯誤訊息 -->
      <div v-if="error" class="mt-1 text-xs text-red-500">
        {{ error }}
      </div>
    </div>
  </div>
</template>

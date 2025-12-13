/**
 * 全系統共用 enum
 * ⚠️ 僅放「已存在於 GAS / DB 的實際值」
 * ⚠️ 不做推測、不超前設計
 */

/* -----------------------------
 * 付款方式（RETAIL_ORDER.付款方式）
 * ----------------------------- */
export const PaymentMethod = Object.freeze({
  CASH: 'cash',
  LINEPAY: 'linepay'
})

/* -----------------------------
 * 訂單付款狀態（RETAIL_ORDER.付款狀態）
 * ----------------------------- */
export const OrderPaymentStatus = Object.freeze({
  UNPAID: 'unpaid',
  PAID: 'paid',
  REFUNDED: 'refunded'
})

/* -----------------------------
 * 訂單來源（語意 enum，非 DB 欄位）
 * 用於前端 / domain 判斷
 * ----------------------------- */
export const RetailOrderSource = Object.freeze({
  OFFLINE: 'offline', // 現金 / 轉帳
  LINEPAY: 'linepay'
})

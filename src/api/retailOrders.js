// src/api/retailOrders.js
//API 層：新增 src/api/retailOrders.js（包住 linepayRequest / retailOrder / 之後的 linepayConfirm）
import { gasPost, gasGet } from '@/utils/gas'

/**
 * 建立零售訂單（現金 / 轉帳）
 * payload 內容會被展開進 GAS body：
 * {
 *   name, phone, method, pickup_date, address,
 *   payment_method, bank_ref, note,
 *   items (JSON string), subtotal, shipping, total
 * }
 */
export function createRetailOrder(payload) {
  return gasPost({
    type: 'retailOrder',
    ...payload
  })
}

/**
 * 建立 LINE Pay 付款請求
 * 由後端產生 orderId / paymentUrl
 */
export function createLinepayRequest(payload) {
  return gasPost({
    type: 'linepayRequest',
    ...payload // 一般會包含 { amount, name, imageUrl }
  })
}

/**
 * 確認 LINE Pay 付款（前端用或之後要用）
 * params 通常會有 { transactionId, orderId }
 */
export function confirmLinepay(params) {
  return gasGet({
    type: 'linepayConfirm',
    ...params
  })
}

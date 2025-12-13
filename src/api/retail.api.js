// src/api/retail.api.js

import { gasGet, gasPost } from '@/utils/gas'
import { linepayRequest } from '@/utils/linepay'

/**
 * === Retail Domain API ===
 * 這一層只做「零售語意」
 * 不處理 adapter、不碰 UI
 * 使用 utils/linepay.js負責 「零售 domain」的流程 API
 */

/**
 * 取得後台零售訂單列表（Admin）
 */
export async function fetchRetailOrders() {
  const res = await gasGet({ type: 'retailOrders' })
  return res?.data || []
}

/**
 * 建立現金 / 轉帳零售訂單
 */
export function createRetailOrder(payload) {
  return gasPost({
    type: 'retailOrder',
    ...payload
  })
}

/**
 * 建立 LINE Pay 付款請求
 */
export function createLinepayPayment(payload) {
  return linepayRequest(payload)
}

/**
 * LINE Pay 確認（Cloud Run → GAS）
 */
export function confirmLinepayPayment(payload) {
  return fetch(`${import.meta.env.VITE_LINEPAY_PROXY_BASE}/linepay/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).then(r => r.json())
}

/**
 * LINE Pay 退款（Admin）
 */
export function refundLinepay(payload, adminToken) {
  return fetch(`${import.meta.env.VITE_LINEPAY_PROXY_BASE}/linepay/refund`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`
    },
    body: JSON.stringify(payload)
  }).then(r => r.json())
}

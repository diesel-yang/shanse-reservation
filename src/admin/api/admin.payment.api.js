/**
 * Admin Payment API
 * 僅供後台使用，對齊後端 /api/admin/payment/*
 */

async function request(url, options = {}) {
  const res = await fetch(url, {
    credentials: 'include',
    ...options
  })

  const json = await res.json()

  if (!res.ok) {
    throw new Error(json.message || 'ADMIN_PAYMENT_API_ERROR')
  }

  return json
}

/**
 * 查詢付款紀錄
 * bookingId / paymentId 二選一
 */
export async function fetchAdminPayments(params) {
  const qs = new URLSearchParams(params).toString()
  return request(`/api/admin/payment/list?${qs}`)
}

/**
 * 查詢可退款金額
 */
export async function fetchRefundable(paymentId) {
  return request(`/api/admin/payment/refundable?paymentId=${paymentId}`)
}

/**
 * 執行退款（支援多次、部分）
 */
export async function adminRefund(payload) {
  return request('/api/admin/payment/refund', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
}

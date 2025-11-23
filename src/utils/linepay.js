// src/utils/linepay.js
const BASE = import.meta.env.VITE_LINEPAY_PROXY_BASE

if (!BASE) {
  console.warn('[LINEPAY] VITE_LINEPAY_PROXY_BASE not set in .env')
}

/**
 * 建立 LINE Pay 付款請求（呼叫 Cloud Run Proxy）
 * payload 結構：
 * {
 *   amount,
 *   productName,
 *   imageUrl,
 *   customer: {...},
 *   items: [...],
 *   subtotal,
 *   shipping
 * }
 */
export async function linepayRequest(payload) {
  if (!BASE) {
    throw new Error('LINE Pay Proxy base URL not configured')
  }

  const res = await fetch(`${BASE}/linepay/request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  if (!res.ok) {
    throw new Error(`LINE Pay proxy HTTP error: ${res.status}`)
  }

  const json = await res.json()
  return json
}
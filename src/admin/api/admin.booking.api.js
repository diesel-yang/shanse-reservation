/**
 * Admin Booking API
 * -------------------------------------------------------------
 * 只負責「資料存取」
 * ❌ 絕對不能出現 <template> / HTML / Vue component
 */

async function request(url) {
  const res = await fetch(url, { credentials: 'include' })
  const text = await res.text()

  // 🔴 不是 JSON 就直接丟明確錯誤
  if (text.trim().startsWith('<')) {
    throw new Error(`API 回傳 HTML，請確認 endpoint：${url}`)
  }

  const json = JSON.parse(text)

  if (!res.ok) {
    throw new Error(json.message || 'ADMIN_BOOKING_API_ERROR')
  }

  return json
}


/**
 * 後台訂位清單
 * GET /api/admin/bookings
 */
export async function fetchAdminBookings() {
  const res = await request('/api/admin/bookings')
  return res.data || []
}

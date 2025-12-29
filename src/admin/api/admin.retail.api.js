// src/admin/api/admin.retail.api.js
/**
 * Admin Retail API
 * -------------------------------------------------------------
 * 用途：
 * - 後台查詢零售訂單
 * - 僅讀取（不做退款）
 * - 對齊 admin.http.js 風格
 */

async function request(url) {
  const res = await fetch(url, {
    credentials: 'include'
  })

  const text = await res.text()

  // ❌ 防止拿到 HTML（你之前遇到的錯）
  if (text.startsWith('<')) {
    throw new Error('API 回傳 HTML，請確認 endpoint / proxy')
  }

  const json = JSON.parse(text)

  if (!res.ok || json.result !== 'success') {
    throw new Error(json.message || 'ADMIN_RETAIL_API_ERROR')
  }

  return json
}

/**
 * 取得零售訂單清單
 * GET /api/admin/retail
 */
export async function fetchAdminRetail() {
  const res = await request('/api/admin/retail')
  return res.data || []
}

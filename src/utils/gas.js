// src/utils/gas.js

// 🔹 從環境變數取出 GAS URL
//   在 .env 中設定： VITE_GAS_URL=https://script.google.com/macros/s/xxxx/exec
const GAS_BASE = import.meta.env.VITE_GAS_URL

/**
 * GET 請求
 * @param {Object} params - 查詢參數 { key: value }
 * @param {Object} options - 可選設定，如 { signal }
 */
export async function gasGet(params = {}, options = {}) {
  const url = new URL(GAS_BASE)
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) {
      url.searchParams.append(k, v)
    }
  })

  const res = await fetch(url.toString(), {
    method: 'GET',
    signal: options.signal || undefined // ✅ 支援 AbortController
  })

  if (!res.ok) throw new Error(`GAS GET error: ${res.status}`)
  return res.json()
}

/**
 * POST 請求
 * @param {URLSearchParams|FormData|Object} payload - 傳送資料
 * @param {Object} options - 可選設定，如 { signal }
 */
export async function gasPost(payload, options = {}) {
  let body
  if (payload instanceof URLSearchParams || payload instanceof FormData) {
    body = payload
  } else if (typeof payload === 'object') {
    body = new URLSearchParams(payload)
  } else {
    throw new Error('gasPost payload 必須是 URLSearchParams/FormData/Object')
  }

  const res = await fetch(GAS_BASE, {
    method: 'POST',
    body,
    signal: options.signal || undefined // ✅ 支援 AbortController
  })

  if (!res.ok) throw new Error(`GAS POST error: ${res.status}`)
  return res.json()
}

// src/utils/linepay.js

const BASE_URL = import.meta.env.VITE_LINEPAY_PROXY_BASE_URL

if (!BASE_URL) {
  console.warn('[LINEPAY] VITE_LINEPAY_PROXY_BASE_URL 尚未設定，LINE Pay 會無法使用')
}

/** 建立 LINE Pay 請求（前往付款頁） */
export async function linepayRequest(payload) {
  if (!BASE_URL) {
    throw new Error('LINE Pay proxy URL 未設定')
  }

  const res = await fetch(`${BASE_URL}/linepay/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  const text = await res.text()
  let json
  try {
    json = JSON.parse(text)
  } catch {
    console.error('LINE Pay proxy 回傳不是 JSON:', text)
    throw new Error('LINE Pay proxy 回傳格式錯誤')
  }

  if (!res.ok) {
    console.error('LINE Pay proxy HTTP error:', res.status, json)
    throw new Error(json.message || `LINE Pay proxy HTTP ${res.status}`)
  }

  return json
}

/** LINE Pay 付款完成後，呼叫 proxy 做 confirm */
export async function linepayConfirm(payload) {
  if (!BASE_URL) {
    throw new Error('LINE Pay proxy URL 未設定')
  }

  const res = await fetch(`${BASE_URL}/linepay/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  const text = await res.text()
  let json
  try {
    json = JSON.parse(text)
  } catch {
    console.error('LINE Pay confirm proxy 回傳不是 JSON:', text)
    throw new Error('LINE Pay confirm proxy 回傳格式錯誤')
  }

  if (!res.ok) {
    console.error('LINE Pay confirm HTTP error:', res.status, json)
    throw new Error(json.message || `LINE Pay confirm HTTP ${res.status}`)
  }

  return json
}
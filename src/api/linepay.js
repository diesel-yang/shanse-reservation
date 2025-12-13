// src/api/linepay.js
// 👉 所有 LINE Pay 都走 Cloud Run

import axios from 'axios'

const BASE = import.meta.env.VITE_LINEPAY_PROXY_BASE

/**
 * 建立 LINE Pay 付款請求
 */
export function linepayRequest(payload) {
  return axios.post(`${BASE}/linepay/request`, payload)
}

/**
 * LINE Pay 付款確認
 * Cloud Run 會：
 * 1. 呼叫 LINE Pay confirm
 * 2. 成功後回寫 GAS（retailOrderLinepay）
 */
export function linepayConfirm(payload) {
  return axios.post(`${BASE}/linepay/confirm`, payload)
}

/**
 * LINE Pay 退款（Admin Only）
 */
export function linepayRefund(payload, idToken) {
  return axios.post(`${BASE}/linepay/refund`, payload, {
    headers: {
      Authorization: `Bearer ${idToken}`
    }
  })
}

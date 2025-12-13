// src/api/retailOrders.js
// 👉 只處理 GAS（帳務 / 試算表）

import { gasPost, gasGet } from '@/utils/gas'

/**
 * 建立零售訂單（現金 / 轉帳）
 * 寫入 GAS 試算表
 */
export function createRetailOrder(payload) {
  return gasPost({
    type: 'retailOrder',
    ...payload
  })
}

/**
 * Admin 讀取零售訂單列表
 */
export function fetchRetailOrders() {
  return gasGet({
    type: 'retailOrders'
  })
}

// src/utils/gas.js

/**
 * Google Apps Script 呼叫工具
 *
 * Env 支援兩種寫法：
 *   VITE_GAS_URL  = https://script.google.com/macros/s/xxxx/exec
 *   VITE_GAS_BASE = https://script.google.com/macros/s/xxxx/exec
 */

// 先把原始 env 字串抓出來（可能為 undefined）
const RAW_GAS_BASE = (import.meta.env.VITE_GAS_URL || import.meta.env.VITE_GAS_BASE || '').trim()

// 內部快取（避免每次 new URL）
let _resolvedGasBase = null

/**
 * 取得 GAS Base URL（含格式驗證）
 */
function getGasBase() {
  if (_resolvedGasBase) return _resolvedGasBase

  if (!RAW_GAS_BASE) {
    console.error('[GAS] 找不到環境變數 VITE_GAS_URL / VITE_GAS_BASE')
    throw new Error('系統設定錯誤：尚未設定後端連線網址')
  }

  try {
    const url = new URL(RAW_GAS_BASE)
    _resolvedGasBase = url.toString()
    return _resolvedGasBase
  } catch (err) {
    console.error('[GAS] GAS URL 格式錯誤：', RAW_GAS_BASE, err)
    throw new Error('系統設定錯誤：GAS URL 格式無效')
  }
}

/**
 * 統一處理 fetch 結果
 */
async function handleResponse(res) {
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    console.error('[GAS] HTTP 錯誤：', res.status, text)
    throw new Error(`GAS 呼叫失敗（${res.status}）`)
  }

  try {
    return await res.json()
  } catch (err) {
    console.error('[GAS] 回傳非 JSON：', err)
    throw new Error('GAS 回傳格式錯誤')
  }
}

/**
 * GET 請求
 */
export async function gasGet(params = {}, options = {}) {
  const base = getGasBase()
  const url = new URL(base)

  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) {
      url.searchParams.append(k, String(v))
    }
  })

  const res = await fetch(url.toString(), {
    method: 'GET',
    signal: options.signal
  })

  return handleResponse(res)
}

/**
 * POST 請求
 */
export async function gasPost(payload, options = {}) {
  const base = getGasBase()
  let body

  if (payload instanceof URLSearchParams || payload instanceof FormData) {
    body = payload
  } else if (typeof payload === 'object' && payload !== null) {
    const params = new URLSearchParams()
    Object.entries(payload).forEach(([k, v]) => {
      if (v !== undefined && v !== null) params.append(k, String(v))
    })
    body = params
  } else {
    console.error('[GAS] payload 類型錯誤：', payload)
    throw new Error('payload 必須是 Object / URLSearchParams / FormData')
  }
  /**
   * 意思是：把資料 POST 到 Google Apps Script，等它回應
   */
  const res = await fetch(base, {
    method: 'POST',
    body,
    signal: options.signal
  })

  return handleResponse(res)
}

/* ------------------------------------------------------------- */
/*  提供前端使用的 GAS API（乾淨版本）                            */
/* ------------------------------------------------------------- */

export const gasApi = {
  /** 取得菜單 */
  getMenu(options) {
    return gasGet({ type: 'menu' }, options)
  },

  /** 取得訂位/須知 */
  getNotice(options) {
    return gasGet({ type: 'notice' }, options)
  },

  /** 取得零售商品 */
  getRetail(options) {
    return gasGet({ type: 'retail' }, options)
  },

  /** 零售訂單（現金 / 轉帳） */
  saveRetailOrder(order, options) {
    return gasPost({ type: 'retailOrder', ...order }, options)
  },

  /** 用餐預先點餐 */
  saveDineOrder(order, options) {
    return gasPost({ type: 'dine', ...order }, options)
  }
}

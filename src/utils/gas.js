// src/utils/gas.js

/**
 * Google Apps Script 呼叫工具
 *
 * Env 支援兩種寫法，擇一即可：
 *   VITE_GAS_URL  = https://script.google.com/macros/s/xxxx/exec
 *   VITE_GAS_BASE = https://script.google.com/macros/s/xxxx/exec
 */

// 先把原始 env 字串抓出來（可能為 undefined）
const RAW_GAS_BASE =
  (import.meta.env.VITE_GAS_URL || import.meta.env.VITE_GAS_BASE || '').trim()

// 內部快取，避免每次 new URL
let _resolvedGasBase = null

/**
 * 取得 GAS Base URL，並做基本驗證
 * - 若未設定或格式錯誤，會在 console 顯示詳細錯誤，再丟出例外
 */
function getGasBase() {
  if (_resolvedGasBase) return _resolvedGasBase

  if (!RAW_GAS_BASE) {
    console.error(
      '[GAS] 找不到環境變數：請在 .env / Vercel 設定 VITE_GAS_URL 或 VITE_GAS_BASE'
    )
    throw new Error('系統設定錯誤：尚未設定後端連線網址，請稍後再試或通知店家')
  }

  try {
    // new URL 會檢查基本格式（必須是 http/https 完整網址）
    const url = new URL(RAW_GAS_BASE)
    _resolvedGasBase = url.toString()
    return _resolvedGasBase
  } catch (err) {
    console.error('[GAS] 環境變數 GAS URL 格式錯誤：', RAW_GAS_BASE, err)
    throw new Error('系統設定錯誤：GAS URL 格式無效，請通知店家處理')
  }
}

/**
 * 統一處理 fetch 結果
 */
async function handleResponse(res) {
  if (!res.ok) {
    // 這裡保留原本 status 方便除錯
    const text = await res.text().catch(() => '')
    console.error('[GAS] HTTP 錯誤：', res.status, text)
    throw new Error(`GAS 呼叫失敗（${res.status}）`)
  }

  // 預期都是 JSON
  try {
    return await res.json()
  } catch (err) {
    console.error('[GAS] 回傳內容非 JSON：', err)
    throw new Error('GAS 回傳格式錯誤，請稍後再試')
  }
}

/**
 * GET 請求
 * @param {Object} params - 查詢參數 { key: value }
 * @param {Object} options - 例如 { signal }
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
    signal: options.signal || undefined,
  })

  return handleResponse(res)
}

/**
 * POST 請求
 * @param {URLSearchParams|FormData|Object} payload
 * @param {Object} options - 例如 { signal }
 */
export async function gasPost(payload, options = {}) {
  const base = getGasBase()
  let body

  if (payload instanceof URLSearchParams || payload instanceof FormData) {
    body = payload
  } else if (payload && typeof payload === 'object') {
    const params = new URLSearchParams()
    Object.entries(payload).forEach(([k, v]) => {
      if (v === undefined || v === null) return
      // 統一轉成字串，Date / number / boolean 都沒問題
      params.append(k, String(v))
    })
    body = params
  } else {
    console.error('[GAS] gasPost payload 類型錯誤：', payload)
    throw new Error('gasPost payload 必須是 URLSearchParams / FormData / Object')
  }

  const res = await fetch(base, {
    method: 'POST',
    body,
    signal: options.signal || undefined,
  })

  return handleResponse(res)
}

/* ------------------------------------------------------------------ */
/*  方便你之後維護的小 helper（保留原本寫法也會動）                       */
/* ------------------------------------------------------------------ */

export const gasApi = {
  /** 取得菜單 */
  getMenu(options) {
    return gasGet({ type: 'menu' }, options)
  },

  /** 取得訂位 / 用餐須知 */
  getNotice(options) {
    return gasGet({ type: 'notice' }, options)
  },

  /** 取得零售商品 */
  getRetail(options) {
    return gasGet({ type: 'retail' }, options)
  },

  /**
   * 寫入零售訂單（現金 / 轉帳等）
   * 你也可以沿用原本在 Cart.vue 的寫法：gasPost({ type:'retailOrder', ... })
   */
  saveRetailOrder(order, options) {
    return gasPost(
      {
        type: 'retailOrder',
        ...order,
      },
      options
    )
  },
}

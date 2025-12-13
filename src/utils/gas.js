/**
 * Google Apps Script 呼叫工具
 *
 * 角色：Transport / Gateway Adapter
 * 唯一責任：讓前端「安全地」與 GAS 溝通
 *
 * ⚠️ 原則：
 * - 不理解 domain
 * - 不驗證資料 schema
 * - 不 throw 破壞 UI
 *
 * Env 支援：
 *   VITE_GAS_URL
 *   VITE_GAS_BASE
 */

// --------------------------------------------------
// 0) Resolve GAS Base URL
// --------------------------------------------------
const RAW_GAS_BASE = (import.meta.env.VITE_GAS_URL || import.meta.env.VITE_GAS_BASE || '').trim()

let _resolvedGasBase = null

function getGasBase() {
  if (_resolvedGasBase) return _resolvedGasBase

  if (!RAW_GAS_BASE) {
    console.error('[GAS] Missing env: VITE_GAS_URL / VITE_GAS_BASE')
    // ⚠️ 不 throw，回傳空字串讓 fetch 失敗後走安全 fallback
    _resolvedGasBase = ''
    return _resolvedGasBase
  }

  try {
    const url = new URL(RAW_GAS_BASE)
    _resolvedGasBase = url.toString()
    return _resolvedGasBase
  } catch (err) {
    console.error('[GAS] Invalid GAS URL:', RAW_GAS_BASE, err)
    _resolvedGasBase = ''
    return _resolvedGasBase
  }
}

// --------------------------------------------------
// 1) Unified Response Handler（重點修正）
// --------------------------------------------------
async function handleResponse(res) {
  // HTTP 層錯誤 → 回傳標準錯誤物件
  if (!res || !res.ok) {
    let text = ''
    try {
      text = await res.text()
    } catch (_) {}

    console.error('[GAS] HTTP error', res?.status, text)

    return {
      result: 'error',
      message: 'HTTP_ERROR',
      status: res?.status || 0,
      data: null
    }
  }

  // 嘗試 parse JSON
  try {
    const json = await res.json()
    // ⚠️ 即使 GAS 回奇怪格式，也包一層保證結構
    if (typeof json !== 'object' || json === null) {
      return {
        result: 'error',
        message: 'INVALID_JSON',
        data: null
      }
    }
    return json
  } catch (err) {
    console.error('[GAS] Invalid JSON response', err)
    return {
      result: 'error',
      message: 'INVALID_JSON',
      data: null
    }
  }
}

// --------------------------------------------------
// 2) GET
// --------------------------------------------------
export async function gasGet(params = {}, options = {}) {
  const base = getGasBase()
  if (!base) {
    return { result: 'error', message: 'NO_GAS_BASE', data: null }
  }

  const url = new URL(base)

  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) {
      url.searchParams.append(k, String(v))
    }
  })

  try {
    const res = await fetch(url.toString(), {
      method: 'GET',
      signal: options.signal
    })

    return await handleResponse(res)
  } catch (err) {
    if (err?.name !== 'AbortError') {
      console.error('[GAS] GET fetch failed', err)
    }
    return {
      result: 'error',
      message: 'FETCH_FAILED',
      data: null
    }
  }
}

// --------------------------------------------------
// 3) POST
// --------------------------------------------------
export async function gasPost(payload, options = {}) {
  const base = getGasBase()
  if (!base) {
    return { result: 'error', message: 'NO_GAS_BASE', data: null }
  }

  let body

  if (payload instanceof URLSearchParams || payload instanceof FormData) {
    body = payload
  } else if (typeof payload === 'object' && payload !== null) {
    const params = new URLSearchParams()
    Object.entries(payload).forEach(([k, v]) => {
      if (v !== undefined && v !== null) {
        params.append(k, String(v))
      }
    })
    body = params
  } else {
    console.error('[GAS] Invalid payload type', payload)
    return {
      result: 'error',
      message: 'INVALID_PAYLOAD',
      data: null
    }
  }

  try {
    const res = await fetch(base, {
      method: 'POST',
      body,
      signal: options.signal
    })

    return await handleResponse(res)
  } catch (err) {
    if (err?.name !== 'AbortError') {
      console.error('[GAS] POST fetch failed', err)
    }
    return {
      result: 'error',
      message: 'FETCH_FAILED',
      data: null
    }
  }
}

// --------------------------------------------------
// 4) gasApi（系統用，不建議 UI 直接使用）
// --------------------------------------------------
export const gasApi = {
  getMenu(options) {
    return gasGet({ type: 'menu' }, options)
  },

  getNotice(options) {
    return gasGet({ type: 'notice' }, options)
  },

  getRetail(options) {
    return gasGet({ type: 'retail' }, options)
  },

  saveRetailOrder(order, options) {
    return gasPost({ type: 'retailOrder', ...order }, options)
  },

  saveDineOrder(order, options) {
    return gasPost({ type: 'dine', ...order }, options)
  }
}

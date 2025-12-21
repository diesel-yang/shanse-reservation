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
 * Env（強制分流）：
 *   VITE_GAS_READ_URL   → Read API（menu / retail / notice）
 *   VITE_GAS_WRITE_URL  → Write API（dine / retailOrder / booking）
 */

// --------------------------------------------------
// 0) Resolve GAS Base URL（Read / Write 分離）
// --------------------------------------------------
const RAW_GAS_READ_BASE = (import.meta.env.VITE_GAS_READ_URL || '').trim()
const RAW_GAS_WRITE_BASE = (import.meta.env.VITE_GAS_WRITE_URL || '').trim()

console.log('[ENV]', {
  READ: import.meta.env.VITE_GAS_READ_URL,
  WRITE: import.meta.env.VITE_GAS_WRITE_URL
})

let _resolvedReadBase = null
let _resolvedWriteBase = null

function resolveBase(raw, cacheRef, label) {
  if (cacheRef.value) return cacheRef.value

  if (!raw) {
    console.error(`[GAS] Missing env: ${label}`)
    cacheRef.value = ''
    return ''
  }

  try {
    const url = new URL(raw)
    cacheRef.value = url.toString()
    return cacheRef.value
  } catch (err) {
    console.error(`[GAS] Invalid GAS URL (${label}):`, raw, err)
    cacheRef.value = ''
    return ''
  }
}

function getGasReadBase() {
  return resolveBase(
    RAW_GAS_READ_BASE,
    {
      get value() {
        return _resolvedReadBase
      },
      set value(v) {
        _resolvedReadBase = v
      }
    },
    'VITE_GAS_READ_URL'
  )
}

function getGasWriteBase() {
  return resolveBase(
    RAW_GAS_WRITE_BASE,
    {
      get value() {
        return _resolvedWriteBase
      },
      set value(v) {
        _resolvedWriteBase = v
      }
    },
    'VITE_GAS_WRITE_URL'
  )
}

// --------------------------------------------------
// 1) Unified Response Handler（保持你原本的防禦）
// --------------------------------------------------
async function handleResponse(res) {
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

  try {
    const json = await res.json()
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
// 2) GET → Read API ONLY
// --------------------------------------------------
export async function gasGet(params = {}, options = {}) {
  const base = getGasReadBase()
  if (!base) {
    return { result: 'error', message: 'NO_GAS_READ_BASE', data: null }
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
      console.error('[GAS][GET] fetch failed', err)
    }
    return {
      result: 'error',
      message: 'FETCH_FAILED',
      data: null
    }
  }
}

// --------------------------------------------------
// 3) POST → Write API ONLY
// --------------------------------------------------
export async function gasPost(payload, options = {}) {
  const base = getGasWriteBase()
  if (!base) {
    return { result: 'error', message: 'NO_GAS_WRITE_BASE', data: null }
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
      console.error('[GAS][POST] fetch failed', err)
    }
    return {
      result: 'error',
      message: 'FETCH_FAILED',
      data: null
    }
  }
}

// --------------------------------------------------
// 4) gasApi（保持原本 API 形狀，UI 不用改）
// --------------------------------------------------
export const gasApi = {
  // ---------- READ ----------
  getMenu(options) {
    return gasGet({ type: 'menu' }, options)
  },

  getNotice(options) {
    return gasGet({ type: 'notice' }, options)
  },

  getRetail(options) {
    return gasGet({ type: 'retail' }, options)
  },

  // ---------- WRITE ----------
  saveRetailOrder(order, options) {
    return gasPost({ type: 'retailOrder', ...order }, options)
  },

  saveDineOrder(order, options) {
    return gasPost({ type: 'dine', ...order }, options)
  }
}

// src/utils/gas.js
export const GAS_BASE = (import.meta.env.VITE_GAS_URL || '').trim()

if (!GAS_BASE) {
  console.error('❌ VITE_GAS_URL 未設定，請到 .env / Vercel 設定並重新部署')
}
if (!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/.test(GAS_BASE)) {
  console.warn('⚠️ VITE_GAS_URL 看起來不像 Apps Script 的 exec URL：', GAS_BASE)
}

export function buildGasUrl(params = {}) {
  // 剃掉 .env 內不小心殘留的 ?type
  const base = GAS_BASE.replace(/[?&]\s*type=?.*$/i, '')
  const qs = new URLSearchParams(params)
  return `${base}${base.includes('?') ? '&' : '?'}${qs.toString()}`
}

export async function gasGet(params = {}) {
  const url = buildGasUrl(params)
  console.log('🔎 GAS GET:', url)
  const r = await fetch(url, { cache: 'no-store' })
  return r.json() // 預期 {result:'success', data:...}
}

export async function gasPost(body = {}) {
  const payload = body instanceof URLSearchParams ? body : new URLSearchParams(body)
  console.log('🔎 GAS POST:', GAS_BASE)
  const r = await fetch(GAS_BASE, { method: 'POST', body: payload })
  return r.json() // 預期 {result:'success', ...}
}

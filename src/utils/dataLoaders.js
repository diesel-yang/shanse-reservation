// src/utils/dataLoaders.js

import { gasGet } from '@/utils/gas'

/** =========================
 *  菜單（GAS: ?type=menu）
 *  Application Data Loader / Anti-corruption Layer
 *  保證回傳 UI 可用的固定結構
 *  角色：Application Data Loader資料轉譯層 / 責任是「把後端回傳的資料，轉成『前端 UI 保證能用的格式』」
 * ========================= */
export const fetchMenu = async signal => {
  const EMPTY_MENU = { main: [], drink: [], side: [], addon: [] }

  try {
    const json = await gasGet({ type: 'menu' }, { signal })

    // 1️⃣ 基本防禦
    if (!json || json.result !== 'success' || typeof json.data !== 'object') {
      console.warn('[menu] 非預期回傳，fallback 空菜單', json)
      return EMPTY_MENU
    }

    const data = json.data || {}

    // 2️⃣ schema guard
    const safeArray = v => (Array.isArray(v) ? v : [])

    const convert = arr =>
      safeArray(arr).map(r => ({
        code: r?.code || r?.name || '',
        name: r?.name || '',
        price: Number(r?.price) || 0,
        note: r?.note || '',
        description: r?.description || '',
        image: r?.image || '',
        disabled: r?.stop === true
      }))

    return {
      main: convert(data.main),
      drink: convert(data.drink),
      side: convert(data.side),
      addon: convert(data.addon)
    }
  } catch (err) {
    if (err?.name !== 'AbortError') {
      console.error('❌ fetchMenu 失敗，使用空菜單', err)
    }
    return EMPTY_MENU
  }
}

/** =========================
 *  假日（Google Calendar API）
 *  支援 AbortController.signal
 * ========================= */
export const fetchHolidays = async signal => {
  try {
    const year = new Date().getFullYear()
    const apiKey = (import.meta.env.VITE_GOOGLE_API_KEY || '').trim()
    if (!apiKey) {
      console.warn('⚠️ VITE_GOOGLE_API_KEY 未設定，假日功能停用')
      return []
    }

    const calendarId = 'zh.taiwan%23holiday@group.v.calendar.google.com'
    const timeMin = `${year}-01-01T00:00:00Z`
    const timeMax = `${year}-12-31T23:59:59Z`
    const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?key=${apiKey}&timeMin=${timeMin}&timeMax=${timeMax}`

    const res = await fetch(url, { cache: 'no-store', signal })
    const data = await res.json()
    return Array.isArray(data.items)
      ? data.items.filter(e => e?.start?.date).map(e => e.start.date)
      : []
  } catch (err) {
    if (err?.name !== 'AbortError') console.error('❌ 假日載入失敗', err)
    return []
  }
}

/** =========================
 *  零售清單（GAS: ?type=retail）
 *  支援 AbortController.signal
 * ========================= */
export const fetchRetail = async signal => {
  try {
    const json = await gasGet({ type: 'retail' }, { signal })
    return {
      frozen: Array.isArray(json?.data?.frozen) ? json.data.frozen : [],
      dessert: Array.isArray(json?.data?.dessert) ? json.data.dessert : []
    }
  } catch (err) {
    if (err?.name !== 'AbortError') console.error('❌ 載入零售資料失敗', err)
    return { frozen: [], dessert: [] }
  }
}

/** （可選）訂位/用餐須知（GAS: ?type=notice） */
export const fetchNotice = async signal => {
  try {
    const json = await gasGet({ type: 'notice' }, { signal })
    return Array.isArray(json?.data) ? json.data : []
  } catch (err) {
    if (err?.name !== 'AbortError') console.error('❌ 取得 notice 失敗', err)
    return []
  }
}

/** ============================================================
 *  一鍵預載：App 啟動時一次抓齊資料
 *  @param {Object} options
 *  @param {AbortSignal} [options.signal] - 傳遞給子請求
 * ============================================================ */
export const preloadAll = async (options = {}) => {
  const signal = options.signal

  const [menu, holidays, retail, notice] = await Promise.all([
    fetchMenu(signal),
    fetchHolidays(signal),
    fetchRetail(signal),
    fetchNotice(signal) // 若目前未用到，可移除
  ])

  return { menu, holidays, retail, notice }
}

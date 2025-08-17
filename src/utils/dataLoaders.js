// src/utils/dataLoaders.js
import { gasGet } from '@/utils/gas'

// 取得菜單（從 GAS: ?type=menu）
export const fetchMenu = async () => {
  try {
    const json = await gasGet({ type: 'menu' }) // ← 統一走 gasGet
    if (json.result !== 'success' || !json.data) throw new Error('資料格式錯誤')

    const convert = (arr = []) =>
      arr.map(r => ({
        code: r.code || r.name || '',
        name: r.name || '',
        price: Number(r.price) || 0,
        note: r.note || '',
        description: r.description || '',
        image: r.image || '',
        disabled: r.stop === true
      }))

    return {
      main: convert(json.data.main),
      drink: convert(json.data.drink),
      side: convert(json.data.side),
      addon: convert(json.data.addon)
    }
  } catch (err) {
    console.error('❌ 載入菜單失敗', err)
    return { main: [], drink: [], side: [], addon: [] }
  }
}

// 取得台灣當年度國定假日（Google Calendar API）
export const fetchHolidays = async () => {
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

    const res = await fetch(url, { cache: 'no-store' })
    const data = await res.json()

    if (!Array.isArray(data.items)) {
      console.warn('⚠️ Google 回傳資料沒有 items:', data)
      return []
    }

    return data.items.filter(e => e?.start?.date).map(e => e.start.date)
  } catch (err) {
    console.error('❌ 假日載入失敗', err)
    return []
  }
}

// 取得零售商品（給 Retail.vue 用；也可直接在頁面裡呼叫 gasGet({type:'retail'})）
export const fetchRetail = async () => {
  try {
    const json = await gasGet({ type: 'retail' })
    return json?.data || { frozen: [], dessert: [] }
  } catch (e) {
    console.error('❌ 載入零售資料失敗', e)
    return { frozen: [], dessert: [] }
  }
}

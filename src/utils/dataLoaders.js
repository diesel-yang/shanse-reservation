// src/utils/dataLoaders.js

export const fetchMenu = async () => {
  try {
    const res = await fetch(
      'https://script.google.com/macros/s/AKfycbyL5huyc0KwHc4JOYSC6kgi_b2dMblpCtg0vSbnpwKbYIMukuHDF53JmTlY7rlHIOTdqg/exec'
    )
    const json = await res.json()
    console.log('🚀 後端回傳資料：', json)

    if (json.result !== 'success' || !json.data) throw new Error('資料格式錯誤')

    const convert = arr => {
      return arr.map(r => {
        const result = {
          code: r.code || r.name || '',
          name: r.name || '',
          price: Number(r.price) || 0,
          note: r.note || '',
          description: r.description || '', // ← 關鍵欄位
          image: r.image || '',
          disabled: r.stop === true
        }
        console.log('🍍 轉換後：', result) // ← 新增這行
        return result
      })
    }

    return {
      main: convert(json.data.main || []),
      drink: convert(json.data.drink || []),
      side: convert(json.data.side || []),
      addon: convert(json.data.addon || [])
    }
  } catch (err) {
    console.error('❌ 載入菜單失敗', err)
    return { main: [], drink: [], side: [], addon: [] }
  }
}

export const fetchHolidays = async () => {
  try {
    const year = new Date().getFullYear()
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY
    if (!apiKey) throw new Error('❌ 未提供 Google API 金鑰')

    console.log('🧪 API KEY 現在是：', import.meta.env.VITE_GOOGLE_API_KEY)

    const calendarId = 'zh.taiwan%23holiday@group.v.calendar.google.com'
    const timeMin = `${year}-01-01T00:00:00Z`
    const timeMax = `${year}-12-31T23:59:59Z`
    const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?key=${apiKey}&timeMin=${timeMin}&timeMax=${timeMax}`

    // ✅ 加入這兩行 debug log（放在 try 裡）
    console.log('📦 fetch URL:', url)
    console.log('🧪 API Key (masked):', apiKey?.slice(0, 5) + '...')

    const res = await fetch(url)
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

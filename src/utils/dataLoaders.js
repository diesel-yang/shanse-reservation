// src/utils/dataLoaders.js
export const fetchMenu = async () => {
  try {
    const res = await fetch(
      'https://script.google.com/macros/s/AKfycbxsywNwio4gJU4acT7vHdRXnQxUdNVBBob8mFDsy_vkf2eKJEe6LRsQwZrVEHdmBmImow/exec'
    )
    const json = await res.json()
    console.log('🚀 後端回傳資料：', json)

    if (json.result !== 'success' || !json.data) throw new Error('資料格式錯誤')

    const convert = (arr) =>
      arr.map((r) => ({
        code: r.code || r.name || '',
        name: r.name || '',
        price: Number(r.price) || 0,
        description: r.description || '',
        image: r.image || '',
        disabled: r.stop === true
      }))

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
    const apiKey = 'AIzaSyBXYYhx67JpH8eR-eiDIGKMS11iTQE1sIw'
    const calendarId = 'zh.taiwan%23holiday@group.v.calendar.google.com'
    const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?key=${apiKey}&timeMin=${year}-01-01T00:00:00Z&timeMax=${year}-12-31T23:59:59Z`

    const res = await fetch(url)
    const data = await res.json()
    // ✅ 回傳假日陣列
    const holidayDates = data.items.map((e) => e.start.date)
    return holidayDates
  } catch (err) {
    console.error('假日載入失敗', err)
    return [] // ✅ 必須保底 return 空陣列，避免 undefined
  }
}

// src/utils/dataLoaders.js
const GAS_BASE = import.meta.env.VITE_GAS_URL // e.g. https://script.google.com/macros/s/AK.../exec
if (!GAS_BASE) console.warn('⚠️ VITE_GAS_URL 未設定，請於環境變數填入 GAS Web App URL')

const _mem = new Map() // 記憶體快取：key -> {data, ts}
const TTL_MS = 6 * 60 * 60 * 1000 // 6 小時，可依需求調整

const LS_KEYS = {
  notice: 'cache:notice:v1',
  retail: 'cache:retail:v1',
  menu: 'cache:menu:v1'
}

function url(params) {
  return `${GAS_BASE}?${new URLSearchParams(params)}`
}

async function fetchJSON(u) {
  const res = await fetch(u, { method: 'GET', cache: 'no-store' }) // 不加 headers，避免 CORS 預檢
  const text = await res.text()
  let json
  try {
    json = JSON.parse(text)
  } catch {
    throw new Error('GAS 回傳非 JSON：' + text.slice(0, 200))
  }
  // 有些回傳可能直接是陣列；新格式是 {result,data}
  if (Array.isArray(json)) return json
  if (json.result && json.result !== 'success') throw new Error('GAS 回傳錯誤')
  return json.data ?? []
}

function fromLS(key) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const obj = JSON.parse(raw)
    if (!obj || typeof obj.ts !== 'number') return null
    return obj
  } catch {
    return null
  }
}
function toLS(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }))
  } catch {}
}
function fresh(ts) {
  return Date.now() - ts < TTL_MS
}

async function swrLoad({ memKey, lsKey, build, normalize = x => x }) {
  // 1) 先回記憶體快取（若存在）
  const mem = _mem.get(memKey)
  if (mem) {
    // 背景更新
    build()
      .then(d => {
        const n = normalize(d)
        _mem.set(memKey, { data: n, ts: Date.now() })
        if (lsKey) toLS(lsKey, n)
      })
      .catch(() => {})
    return mem.data
  }

  // 2) 再回 localStorage（若存在）
  const ls = lsKey ? fromLS(lsKey) : null
  if (ls) {
    // 如果過期了也先回舊資料，同步背景更新
    build()
      .then(d => {
        const n = normalize(d)
        _mem.set(memKey, { data: n, ts: Date.now() })
        if (lsKey) toLS(lsKey, n)
      })
      .catch(() => {})
    return ls.data
  }

  // 3) 都沒有 → 正式抓
  const freshData = await build()
  const n = normalize(freshData)
  _mem.set(memKey, { data: n, ts: Date.now() })
  if (lsKey) toLS(lsKey, n)
  return n
}

/* ------------------ 菜單 ------------------ */
export const fetchMenu = async () => {
  return swrLoad({
    memKey: 'menu',
    lsKey: LS_KEYS.menu,
    build: () =>
      fetchJSON(url({ type: 'menu' })).then(d => {
        // 後端回的是物件 { main:[], drink:[], side:[], addon:[] }
        return d
      }),
    normalize: data => {
      const convert = arr =>
        (arr || []).map(r => ({
          code: r.code || r.name || '',
          name: r.name || '',
          price: Number(r.price) || 0,
          note: r.note || '',
          description: r.description || '',
          image: r.image || '',
          disabled: r.stop === true
        }))
      return {
        main: convert(data.main || []),
        drink: convert(data.drink || []),
        side: convert(data.side || []),
        addon: convert(data.addon || [])
      }
    }
  })
}

/* ------------------ 假日（維持你原本寫法） ------------------ */
export const fetchHolidays = async () => {
  try {
    const year = new Date().getFullYear()
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY
    if (!apiKey) throw new Error('❌ 未提供 Google API 金鑰')

    const calendarId = 'zh.taiwan%23holiday@group.v.calendar.google.com'
    const timeMin = `${year}-01-01T00:00:00Z`
    const timeMax = `${year}-12-31T23:59:59Z`
    const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?key=${apiKey}&timeMin=${timeMin}&timeMax=${timeMax}`

    const res = await fetch(url)
    const data = await res.json()
    if (!Array.isArray(data.items)) return []
    return data.items.filter(e => e?.start?.date).map(e => e.start.date)
  } catch (err) {
    console.error('❌ 假日載入失敗', err)
    return []
  }
}

/* ------------------ 須知 Notice ------------------ */
export const fetchNotice = async () => {
  return swrLoad({
    memKey: 'notice',
    lsKey: LS_KEYS.notice,
    build: () => fetchJSON(url({ type: 'notice' })),
    normalize: list => {
      // 後端已排序；保留原樣
      return Array.isArray(list) ? list : []
    }
  })
}

/* ------------------ 零售 Retail ------------------ */
export const fetchRetail = async () => {
  return swrLoad({
    memKey: 'retail',
    lsKey: LS_KEYS.retail,
    build: () => fetchJSON(url({ type: 'retail' })).then(d => d), // 後端回 {frozen:[], dessert:[]}
    normalize: data => {
      const normList = arr =>
        (arr || []).map(i => ({
          code: i.code || '',
          name: i.name || '',
          price: Number(i.price) || 0,
          note: i.note || '',
          image: i.image || '',
          description: i.description || '',
          storage: i.storage || '',
          unit: i.unit || '份',
          stock: Number(i.stock || 0),
          lead_days: Number(i.lead_days || 0),
          stop: !!i.stop
        }))
      return {
        frozen: normList(data.frozen),
        dessert: normList(data.dessert)
      }
    }
  })
}

/* ------------------ 啟動預抓（可選） ------------------ */
export async function preloadAll() {
  await Promise.allSettled([
    fetchMenu(),
    fetchNotice(),
    fetchRetail()
    // holidays 通常不需要每次預抓；看你需求
  ])
}

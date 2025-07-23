// src/utils/helpers.js

/**
 * 將輸入安全轉為數字，如果轉換失敗則回傳預設值 fallback（預設為 0）
 * @param {any} val - 輸入值
 * @param {number} fallback - 預設回傳數字
 * @returns {number}
 */
export function toNumber(val, fallback = 0) {
  const num = Number(val)
  return isNaN(num) ? fallback : num
}
/**
 * 根據 code 取得 menu 中對應分類的品項資訊（用於顯示名稱）
 * @param {string} category - 'main' | 'drink' | 'side' | 'addon'
 * @param {string} code - 品項代碼
 * @param {object} menu - 菜單資料（包含各分類陣列）
 * @returns {object|null} - 對應的品項物件或 null
 */
export function getItemByCode(category, code, menu) {
  if (!category || !code || !menu?.[category]) return null
  return menu[category].find(item => item.code === code) || null
}

/**
 * 計算每位顧客的套餐金額與加點金額
 */
export function calcPriceBreakdown(order, menu) {
  const basePrice = 700
  const getPrice = (type, code) => menu[type]?.find(item => item.code === code)?.price || 0

  const mainAdd = getPrice('main', order.main)
  const drinkAdd = getPrice('drink', order.drink)
  const sideAdd = getPrice('side', order.side)
  const addons = (order.addons || []).map(code => getPrice('addon', code))
  const addonTotal = addons.reduce((a, b) => a + b, 0)

  const setTotal = basePrice + mainAdd + drinkAdd + sideAdd
  const subtotal = setTotal + addonTotal
  const serviceFee = Math.round(subtotal * 0.1)
  const total = subtotal + serviceFee

  return {
    setTotal,
    addonTotal,
    serviceFee,
    total
  }
}

/**
 * 計算全部訂單的總金額（含服務費）
 */
export function calcTotal(orders, menu) {
  return orders.reduce((sum, order) => {
    const { total } = calcPriceBreakdown(order, menu)
    return sum + total
  }, 0)
}

/**
 * 將 YYYY-MM-DD 格式轉為「7月2日（二）」樣式
 */
export function formatDate(isoDateStr) {
  const date = new Date(isoDateStr)
  const weekdayMap = ['日', '一', '二', '三', '四', '五', '六']
  return `${date.getMonth() + 1}月${date.getDate()}日（${weekdayMap[date.getDay()]}）`
}

/**
 * 將數字轉為貨幣格式（千分位）
 * @param {number} num
 * @returns {string}
 */
export function formatCurrency(num) {
  return toNumber(num).toLocaleString('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0
  })
}

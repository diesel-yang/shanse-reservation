// src/composables/useOrder.js
import { gasPost } from '@/utils/gas'

/** 日期工具：轉 YYYY-MM-DD */
function toYMDLocal(dateLike) {
  let d
  if (!dateLike) d = new Date()
  else if (dateLike instanceof Date) d = new Date(dateLike.getTime())
  else d = new Date(dateLike)
  if (isNaN(d)) d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * 🟧 共用的送單函式
 * @param {Object} options
 * @param {Array} options.cart - 購物車內容
 * @param {Number} options.subtotal - 小計金額
 * @param {Date} options.earliestPickupDate - 最早取貨日
 * @param {Object} options.customer - 使用者表單
 * @returns {Promise<{ orderId: string } | null>}
 */
export async function submitOrderCommon({ cart, subtotal, earliestPickupDate, customer }) {
  const items = cart.map(i => ({
    code: i.code,
    name: i.name,
    price: Number(i.price || 0),
    qty: Number(i.qty || 1),
    unit: i.unit || '份'
  }))

  const subtotalNum = Number(subtotal || 0)
  const shippingNum = customer?.method === '宅配' ? 160 : 0
  const totalNum = subtotalNum + shippingNum
  const pickupYmd = toYMDLocal(customer?.pickup_date || earliestPickupDate)

  const out = await gasPost({
    type: 'retailOrder',
    name: customer?.name || '',
    phone: customer?.phone || '',
    method: customer?.method || '自取',
    pickup_date: pickupYmd,
    address: customer?.address || '',
    payment_method: customer?.payment_method || 'cash',
    bank_ref: customer?.bank_ref || '',
    note: customer?.note || '',
    items: JSON.stringify(items),
    subtotal: String(subtotalNum),
    shipping: String(shippingNum),
    total: String(totalNum)
  })

  if (out?.result === 'pending' && out?.paymentUrl) {
    window.location.href = out.paymentUrl
    return null
  }

  if (out?.result === 'success') {
    return { orderId: out.orderId }
  } else {
    return null
  }
}

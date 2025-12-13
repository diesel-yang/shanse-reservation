// src/domain/retail/retail.adapter.js

/**
 * 將 GAS 回傳的「零售訂單 raw row」
 * 轉成前端統一使用的 retailOrder domain model
 */
export function adaptRetailOrder(raw) {
  const paymentStatus = raw['付款狀態'] || ''
  const transactionId = raw['交易ID'] || ''
  const refundAmount = Number(raw['退款金額'] || 0)
  const refundTxId = raw['退款交易ID'] || ''
  const refundTime = raw['退款時間'] || ''

  const paid = paymentStatus === 'paid'
  const refunded = paymentStatus === 'refunded'

  return {
    // 基本識別
    orderId: raw['訂單編號'],
    createdAt: raw['送出時間'],

    // 客戶
    customer: {
      name: raw['姓名'],
      phone: raw['電話']
    },

    // 金額
    amount: Number(raw['合計'] || 0),
    subtotal: Number(raw['小計'] || 0),
    shipping: Number(raw['運費'] || 0),

    // 付款
    paymentMethod: raw['付款方式'],
    paid,
    paymentStatus,

    // LINE Pay
    transactionId: transactionId || null,

    // 退款
    refund: refunded
      ? {
          amount: refundAmount,
          transactionId: refundTxId,
          time: refundTime
        }
      : null,

    // 原始資料（debug / fallback 用）
    _raw: raw
  }
}

/**
 * 批次轉譯（Admin list 用）
 */
export function adaptRetailOrders(rawList = []) {
  return rawList.map(adaptRetailOrder)
}

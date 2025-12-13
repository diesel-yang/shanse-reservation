// src/domain/_core/enums.js
// ⚠️ 此檔案的值 = GAS / 試算表的實際值
// ⚠️ 不允許出現「前端幻想狀態」

export const PayMethod = Object.freeze({
  LINEPAY: 'linepay',
  CASH: 'cash'
})

export const PayStatus = Object.freeze({
  PAID: 'paid',
  UNPAID: 'unpaid',
  REFUNDED: 'refunded'
})

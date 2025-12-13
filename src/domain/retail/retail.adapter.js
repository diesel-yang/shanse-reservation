// src/domain/retail/retail.adapter.js

/**
 * 將 GAS 回傳的「零售訂單 raw row」
 * 轉成前端統一使用的 retailOrder domain model
 */
export function adaptRetailOrderFromGas(row) {
  return {
    id: row['訂單編號'],
    payMethod: row['付款方式'],
    payStatus: row['付款狀態'],
    transactionId: row['交易ID'],
    refundAmount: row['退款金額'],
    refundAt: row['退款時間'],
    raw: row // 保留原始資料
  }
}

/**
 * 批次轉譯（Admin list 用）
 */
export function adaptRetailOrders(rawList = []) {
  return rawList.map(adaptRetailOrder)
}

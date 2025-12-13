// src/domain/_core/abilities.js
import { PayMethod, PayStatus } from './enums'

export function canRefund(order) {
  if (!order) return false

  return (
    order.付款方式 === PayMethod.LINEPAY &&
    order.付款狀態 === PayStatus.PAID &&
    Boolean(order.交易ID)
  )
}

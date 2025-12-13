import { PayMethod, PayStatus } from './enums'

export function canRefund(order) {
  if (order.payMethod !== PayMethod.LINEPAY) return false
  if (order.payStatus !== PayStatus.PAID) return false
  if (!order.transactionId) return false
  return true
}

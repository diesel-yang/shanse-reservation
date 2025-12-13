import { PayMethod, PayStatus } from '../_core/enums'

export interface RetailOrder {
  id: string
  name: string
  total: number
  payMethod: PayMethod
  payStatus: PayStatus
  transactionId?: string
  refundAmount?: number
  refundTime?: string
  _raw: Record<string, any>
}

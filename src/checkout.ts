/**
 * checkout.ts
 * ---------------------------------------------------------
 * Frontend unified checkout entry
 *
 * - booking / retail 共用
 * - 前端唯一結帳入口
 * - 不暴露 LINE Pay 細節
 * - 型別只用來保護 context
 */

/* ================= Types ================= */

export type BookingCheckoutContext = {
  type: 'booking'
  bookingId: string
}

export type RetailCheckoutContext = {
  type: 'retail'
  orderDraft: {
    customer: {
      name: string
      phone: string
      address?: string
      note?: string
    }
    items: Array<{
      id: string
      name: string
      price: number
      quantity: number
      image?: string
    }>
  }
}

export type CheckoutContext =
  | BookingCheckoutContext
  | RetailCheckoutContext

type CheckoutResponse = {
  result: 'success'
  data: {
    paymentUrl: string
  }
}

/* ================= Public API ================= */

/**
 * 前端唯一結帳入口
 *
 * usage:
 *   await checkout({ type: 'booking', bookingId })
 *   await checkout({ type: 'retail', orderDraft })
 */
export async function checkout(context: CheckoutContext): Promise<void> {
  const res = await fetch('/api/checkout/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(context)
  })

  const json: CheckoutResponse | { result: 'error'; message?: string } =
    await res.json()

  if (json.result !== 'success') {
    throw new Error(json.message || 'CHECKOUT_FAILED')
  }

  // 前端唯一責任：導向付款頁
  window.location.href = json.data.paymentUrl
}

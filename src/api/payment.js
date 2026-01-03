import axios from './axios'

/**
 * 建立 LINE Pay 付款（取得跳轉網址）
 * @param {{
 *   people: number,
 *   date: string,
 *   time: string,
 *   method: 'linepay'
 * }}
 */
export async function initiatePayment(payload) {
  const { data } = await axios.post('/api/payment/initiate', payload)

  if (data.result !== 'success') {
    throw new Error(data.message || 'PAYMENT_INITIATE_FAILED')
  }

  return data.data
}

/**
 * LINE Pay confirm 後呼叫
 * （ResultPage 用）
 */
export async function confirmPayment(payload) {
  const { data } = await axios.post('/api/payment/pay', payload)

  if (data.result !== 'success') {
    throw new Error(data.message || 'PAYMENT_CONFIRM_FAILED')
  }

  return data.data
}

/**
 * src/api/booking.js
 * -------------------------------------------------------------
 * 前端唯一 booking API
 */

import axios from './axios'

/** 查詢 slots */
export async function fetchSlots({ date, people }) {
  const res = await axios.get('/api/booking/slots', {
    params: { date, people }
  })

  if (res.data?.result !== 'success') {
    throw new Error(res.data?.message || 'FETCH_SLOTS_FAILED')
  }

  return res.data.data
}

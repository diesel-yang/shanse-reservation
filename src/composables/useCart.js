// src/composables/useCart.js
import { reactive, computed, provide, inject, watch } from 'vue'

// 全域符號
const CartSymbol = Symbol('Cart')
const STORAGE_KEY = 'shanse-cart-v1'

export function createCartStore() {
  // 先從 localStorage 撈
  let saved = []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const arr = JSON.parse(raw)
      if (Array.isArray(arr)) saved = arr
    }
  } catch (err) {
    console.warn('⚠️ 讀取購物車失敗，改用空陣列', err)
  }

  // 反應式狀態
  const state = reactive({
    // 結構：{ code, name, price, qty, unit?, lead_days? }
    items: saved,
    coupon: null,
    note: ''
  })

  // 給 template 用的乾淨 computed（重要！）
  const items = computed(() => state.items)

  // 計算欄位
  const count = computed(() =>
    state.items.reduce((sum, item) => {
      if (!item) return sum
      const q = Number(item.qty || 0)
      return sum + (isNaN(q) ? 0 : q)
    }, 0)
  )

  const subtotal = computed(() =>
    state.items.reduce((sum, item) => {
      if (!item) return sum
      const price = Number(item.price || 0)
      const q = Number(item.qty || 0)
      return sum + (isNaN(price) || isNaN(q) ? 0 : price * q)
    }, 0)
  )

  // 你之前的運費規則
  const shipping = computed(() => {
    if (subtotal.value === 0) return 0
    return subtotal.value >= 1200 ? 0 : 100
  })

  const discount = computed(() => (state.coupon?.code === 'WELCOME100' ? 100 : 0))

  const total = computed(() =>
    Math.max(0, subtotal.value + shipping.value - discount.value)
  )

  // 操作方法
  function add(item, qty = 1) {
    if (!item) return
    const n = Math.max(1, Number(qty || 1))

    // 一定要有 code，沒有就生一個
    const code = item.code || `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const idx = state.items.findIndex(x => x && x.code === code)

    if (idx > -1) {
      const current = Number(state.items[idx].qty || 0)
      state.items[idx].qty = current + n
    } else {
      state.items.push({
        ...item,
        code,
        qty: n
      })
    }
  }

  function inc(idx) {
    if (idx < 0 || idx >= state.items.length) return
    const cur = Number(state.items[idx].qty || 0)
    state.items[idx].qty = (isNaN(cur) ? 0 : cur) + 1
  }

  function dec(idx) {
    if (idx < 0 || idx >= state.items.length) return
    const cur = Number(state.items[idx].qty || 0)
    const next = (isNaN(cur) ? 1 : cur) - 1
    state.items[idx].qty = Math.max(1, next)
  }

  function remove(idx) {
    if (idx < 0 || idx >= state.items.length) return
    state.items.splice(idx, 1)
  }

  function clear() {
    // 用 splice 保留同一個陣列參考
    state.items.splice(0, state.items.length)
    state.coupon = null
    state.note = ''
    localStorage.removeItem(STORAGE_KEY)
  }

  function applyCoupon(code) {
    state.coupon = code ? { code: code.trim().toUpperCase() } : null
  }

  // 永續化（陣列有變就存）
  watch(
    () => state.items,
    (val) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
      } catch (err) {
        console.warn('⚠️ 寫入購物車失敗', err)
      }
    },
    { deep: true }
  )

  return {
    state,
    items,     // 👈 給 template 用的
    count,
    subtotal,
    shipping,
    discount,
    total,
    add,
    inc,
    dec,
    remove,
    clear,
    applyCoupon
  }
}

// 在 App.vue 裡呼叫一次
export function provideCart() {
  const store = createCartStore()
  provide(CartSymbol, store)
  return store
}

// 在各頁面 / 元件拿來用
export function useCart() {
  const store = inject(CartSymbol)
  if (!store) {
    throw new Error('useCart() called before provideCart()')
  }
  return store
}

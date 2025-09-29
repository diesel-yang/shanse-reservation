// 🟧 新增：購物車全域 store（跨頁共享 + localStorage 永續化）
import { reactive, computed, provide, inject, watch } from 'vue'

const CartSymbol = Symbol('Cart')
const STORAGE_KEY = 'shanse-cart-v1'

export function createCartStore() {
  const saved = localStorage.getItem(STORAGE_KEY)
  const state = reactive({
    // 結構：{ code, name, price, qty, unit?, lead_days? }
    items: saved ? JSON.parse(saved) : [],
    coupon: null,
    note: ''
  })

  // 計算屬性
  const count = computed(() => state.items.reduce((s, i) => s + i.qty, 0))
  const subtotal = computed(() => state.items.reduce((s, i) => s + i.qty * Number(i.price || 0), 0))
  const shipping = computed(() => (subtotal.value >= 1200 || subtotal.value === 0 ? 0 : 100))
  const discount = computed(() => (state.coupon?.code === 'WELCOME100' ? 100 : 0))
  const total = computed(() => Math.max(0, subtotal.value + shipping.value - discount.value))

  // 操作方法
  function add(item, qty = 1) {
    if (!item) return
    const n = Math.max(1, Number(qty || 1))
    const code = item.code || `tmp-${Date.now()}-${Math.random()}`
    const idx = state.items.findIndex(x => x.code === code)
    if (idx > -1) {
      state.items[idx].qty += n
    } else {
      state.items.push({ ...item, code, qty: n })
    }
  }
  function inc(idx) { state.items[idx].qty++ }
  function dec(idx) { state.items[idx].qty = Math.max(1, state.items[idx].qty - 1) }
  function remove(idx) { state.items.splice(idx, 1) }
  function clear() {
    state.items.splice(0, state.items.length) // 🟧 保留 reactivity
    state.coupon = null
    state.note = ''
    localStorage.removeItem(STORAGE_KEY)
  }
  function applyCoupon(code) {
    state.coupon = code ? { code: code.trim().toUpperCase() } : null
  }

  // 永續化
  watch(
    () => state.items,
    (val) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
    },
    { deep: true }
  )

  return { state, count, subtotal, shipping, discount, total, add, inc, dec, remove, clear, applyCoupon }
}

export function provideCart() {
  const store = createCartStore()
  provide(CartSymbol, store)
  return store
}

export function useCart() {
  const store = inject(CartSymbol)
  if (!store) throw new Error('Cart not provided')
  return store
}

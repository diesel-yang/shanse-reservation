<!-- src/components/ModalCheckout.vue -->
<template>
  <div class="fixed inset-0 z-[100]">
    <!-- 遮罩 -->
    <div class="absolute inset-0 bg-black/50" @click.self="$emit('close')"></div>

    <!-- 視窗 -->
    <div
      class="absolute left-1/2 top-6 -translate-x-1/2 w-[95%] max-w-3xl pointer-events-auto"
      role="dialog"
      aria-modal="true"
    >
      <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
        <!-- 標題列 -->
        <div class="px-5 py-4 border-b flex items-center justify-between">
          <h2 class="text-lg font-semibold">結帳</h2>
          <button class="text-gray-500 hover:text-black" @click="$emit('close')" aria-label="關閉">
            ✕
          </button>
        </div>

        <!-- 內容：獨立可捲動 -->
        <div class="px-5 py-4 grid md:grid-cols-2 gap-6 modal-scroll">
          <!-- 左：表單 -->
          <form class="space-y-4" @submit.prevent="onSubmit">
            <div>
              <label class="block text-sm mb-1">訂購人姓名</label>
              <input
                v-model.trim="form.name"
                type="text"
                class="w-full input"
                placeholder="王小明"
              />
              <p v-if="errors.name" class="text-xs text-red-500 mt-1">{{ errors.name }}</p>
            </div>

            <div>
              <label class="block text-sm mb-1">聯絡電話</label>
              <input
                v-model.trim="form.phone"
                type="tel"
                class="w-full input"
                placeholder="09xx-xxx-xxx"
              />
              <p v-if="errors.phone" class="text-xs text-red-500 mt-1">{{ errors.phone }}</p>
            </div>

            <!-- 取貨方式 -->
            <div>
              <label class="block text-sm mb-2">取貨方式</label>
              <div class="flex items-center gap-4">
                <label class="flex items-center gap-2">
                  <input type="radio" value="pickup" v-model="form.method" />
                  <span>到店自取</span>
                </label>
                <label class="flex items-center gap-2">
                  <input type="radio" value="宅配" v-model="form.method" />
                  <span>宅配</span>
                </label>
              </div>
            </div>

            <div v-if="form.method === 'pickup' || form.method === '到店自取'">
              <label class="block text-sm mb-1">取貨日期</label>
              <input
                v-model="form.pickup_date"
                :min="minDateStr"
                type="date"
                class="w-full input"
              />
              <p class="text-xs text-gray-500 mt-1">最早可取：{{ displayMinDate }}</p>
              <p v-if="errors.pickup_date" class="text-xs text-red-500 mt-1">
                {{ errors.pickup_date }}
              </p>
            </div>

            <div v-else>
              <label class="block text-sm mb-1">收件地址（宅配）</label>
              <textarea
                v-model.trim="form.address"
                rows="3"
                class="w-full input"
                placeholder="郵遞區號、縣市區路、門牌與樓層"
              ></textarea>
              <p v-if="errors.address" class="text-xs text-red-500 mt-1">{{ errors.address }}</p>
            </div>
            <!-- 付款方式 -->
            <div>
              <label class="block text-sm mb-2">付款方式</label>
              <div class="flex items-center gap-4">
                <label class="flex items-center gap-2">
                  <input type="radio" value="cash" v-model="form.payment_method" />
                  <span>現金 / 到店付款</span>
                </label>
                <label class="flex items-center gap-2">
                  <input type="radio" value="transfer" v-model="form.payment_method" />
                  <span>銀行轉帳</span>
                </label>
                <label class="flex items-center gap-2">
                  <input type="radio" value="linepay" v-model="form.payment_method" />
                  <span>LINE Pay</span>
                </label>
              </div>
            </div>

            <!-- 若為轉帳匯款，顯示銀行資料 + 後五碼 -->
            <div v-if="form.payment_method === 'transfer'" class="mt-3 space-y-2">
              <div class="rounded-lg bg-gray-50 border p-3 text-sm">
                <div>轉帳銀行：玉山銀行（代碼 808）</div>
                <div>帳號：1234-567-890123</div>
              </div>
              <div>
                <label class="block text-sm mb-1">帳號後五碼</label>
                <input
                  v-model.trim="form.bank_ref"
                  type="text"
                  maxlength="5"
                  inputmode="numeric"
                  class="w-full input"
                  placeholder="請填入 5 碼（利於對帳）"
                />
                <p v-if="errors.bank_ref" class="text-xs text-red-500 mt-1">
                  {{ errors.bank_ref }}
                </p>
              </div>
            </div>
            <div>
              <label class="block text-sm mb-1">訂單備註</label>
              <textarea
                v-model.trim="form.note"
                rows="2"
                class="w-full input"
                placeholder="配送時的特別註記 / 開立公司抬頭…（選填）"
              ></textarea>
            </div>
          </form>

          <!-- 右：清單摘要 -->
          <aside class="space-y-4">
            <div class="border rounded-xl overflow-hidden">
              <div class="px-4 py-3 bg-gray-50 border-b font-medium">訂單明細</div>
              <div class="p-4 max-h-80 overflow-auto divide-y">
                <div v-for="c in cart" :key="c.code" class="py-3 flex items-center justify-between">
                  <div class="min-w-0">
                    <div class="font-medium truncate">{{ c.name }}</div>
                    <div class="text-xs text-gray-500">
                      {{ currency(c.price) }} / {{ c.unit || '份' }} × {{ c.qty }}
                    </div>
                  </div>
                  <div class="font-semibold">{{ currency(c.price * c.qty) }}</div>
                </div>
              </div>
              <div class="px-4 py-3 bg-gray-50 flex items-center justify-between">
                <div class="text-sm text-gray-600">小計</div>
                <div class="text-lg font-semibold">{{ currency(subtotal) }}</div>
              </div>
            </div>

            <p class="text-xs text-gray-500">
              • 商品保存方式請依標示冷凍/冷藏。<br />
              • 宅配以低溫/冷凍配送計價。<br />
              • 冷藏及冷凍商品，分溫層包裝出貨，請分開下單。<br />
              • 若售完或缺貨，我們會與您聯繫協調。
            </p>
          </aside>
        </div>

        <!-- Sticky Footer（永遠在底部） -->
        <div class="px-5 pb-4 pt-3 sticky bottom-0 bg-white border-t">
          <button
            class="w-full rounded-full py-3 font-semibold transition"
            :class="
              submitting
                ? 'bg-gray-400 text-white cursor-not-allowed pointer-events-none'
                : 'bg-black text-white hover:bg-gray-900'
            "
            :disabled="submitting"
            @click="onSubmit"
          >
            {{ submitting ? '送出中…' : '送出訂單' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch, onMounted } from 'vue'

/* Props / Emits */
const props = defineProps({
  cart: { type: Array, default: () => [] }, // [{code,name,price,qty,unit,lead_days}]
  subtotal: { type: Number, default: 0 },
  earliestPickupDate: { type: Date, required: true }
})
const emit = defineEmits(['close', 'submit'])

/* 工具 */
const currency = n => `NT$ ${Number(n || 0).toLocaleString()}`
const toDateStr = d => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/* 保障 earliestPickupDate 合法 */
const baseDate = computed(() => {
  const d = props.earliestPickupDate
  return d instanceof Date && !isNaN(d) ? d : new Date()
})
const minDateStr = computed(() => toDateStr(baseDate.value))
const displayMinDate = computed(
  () =>
    `${baseDate.value.getFullYear()}年${baseDate.value.getMonth() + 1}月${baseDate.value.getDate()}日`
)

/* 表單 */
const form = reactive({
  name: '',
  phone: '',
  method: 'pickup', // 'pickup' | '宅配'
  pickup_date: '', // YYYY-MM-DD
  address: '',
  payment_method: 'cash', // 'cash' | 'transfer'
  bank_ref: '', // 帳號後五碼（transfer 時啟用）
  note: ''
})

/* 初始：預設取貨日為最早日期，避免 Invalid time value */
onMounted(() => {
  form.pickup_date = minDateStr.value
})

watch(
  () => form.method,
  v => {
    if (v === 'pickup' || v === '到店自取') {
      form.address = ''
      if (!form.pickup_date) form.pickup_date = minDateStr.value
    } else {
      form.pickup_date = ''
    }
  }
)

/* 驗證 */
const errors = reactive({ name: '', phone: '', pickup_date: '', address: '', bank_ref: '' })
const validate = () => {
  errors.name = form.name ? '' : '請輸入姓名'
  errors.phone = /^0\d{1,2}-?\d{6,8}$|^09\d{2}-?\d{3}-?\d{3}$/.test(form.phone)
    ? ''
    : '請輸入有效電話'
  if (form.method === 'pickup' || form.method === '到店自取') {
    errors.pickup_date = form.pickup_date ? '' : '請選擇取貨日期'
    errors.address = ''
  } else {
    errors.address = form.address ? '' : '請輸入收件地址'
    errors.pickup_date = ''
  }
  // 付款為匯款時，要求五碼（純數字、長度 5）
  if (form.payment_method === 'transfer') {
    errors.bank_ref = /^\d{5}$/.test(form.bank_ref) ? '' : '請填入 5 碼數字'
  } else {
    errors.bank_ref = ''
  }
  return !errors.name && !errors.phone && !errors.pickup_date && !errors.address && !errors.bank_ref
}

/* 送出（把資料交給父層，實際打 GAS 在 Retail.vue） */
const submitting = ref(false)
const onSubmit = async () => {
  if (submitting.value) return // ⬅️ 防連點保險
  if (!props.cart?.length) return alert('購物車是空的')
  if (!validate()) return

  try {
    submitting.value = true
    const customer = {
      name: form.name,
      phone: form.phone,
      method: form.method === 'pickup' ? '自取' : '宅配',
      pickup_date: form.pickup_date,
      address: form.address,
      note: form.note,
      payment_method: form.payment_method || '', // 如果你有加付款方式欄位
      bank_ref: form.bank_ref || ''
    }
    await Promise.resolve(emit('submit', { customer }))
  } finally {
    submitting.value = false // ⬅️ 成功/失敗都恢復
  }
}
</script>

<style scoped>
.input {
  @apply rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/20;
}
/* 讓中間內容能捲動（含 iOS） */
.modal-scroll {
  max-height: 70vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
@media (min-width: 768px) {
  .modal-scroll {
    max-height: 80vh;
  }
}
</style>

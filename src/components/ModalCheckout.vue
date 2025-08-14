<template>
  <div class="fixed inset-0 z-50">
    <!-- 遮罩 -->
    <div class="absolute inset-0 bg-black/50" @click="$emit('close')"></div>

    <!-- 內容 -->
    <div class="absolute left-1/2 top-8 -translate-x-1/2 w-[95%] max-w-3xl">
      <div class="bg-white rounded-2xl overflow-hidden shadow-xl">
        <!-- 標題列 -->
        <div class="px-5 py-4 border-b flex items-center justify-between">
          <h2 class="text-lg font-semibold">結帳</h2>
          <button class="text-gray-500 hover:text-black" @click="$emit('close')">✕</button>
        </div>

        <div class="grid md:grid-cols-2 gap-6 p-5">
          <!-- 左：表單 -->
          <form class="space-y-4" @submit.prevent="handleSubmit">
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

            <div>
              <label class="block text-sm mb-2">取貨方式</label>
              <div class="flex items-center gap-4">
                <label class="flex items-center gap-2">
                  <input type="radio" value="pickup" v-model="form.ship" />
                  <span>到店自取</span>
                </label>
                <label class="flex items-center gap-2">
                  <input type="radio" value="delivery" v-model="form.ship" />
                  <span>宅配</span>
                </label>
              </div>
            </div>

            <div v-if="form.ship === 'pickup'">
              <label class="block text-sm mb-1">取貨日期</label>
              <input v-model="form.pickupDate" :min="minDateStr" type="date" class="w-full input" />
              <p class="text-xs text-gray-500 mt-1">
                最早可取：{{ formatDate(earliestPickupDate) }}
              </p>
              <p v-if="errors.pickupDate" class="text-xs text-red-500 mt-1">
                {{ errors.pickupDate }}
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

            <div>
              <label class="block text-sm mb-1">備註</label>
              <textarea
                v-model.trim="form.note"
                rows="2"
                class="w-full input"
                placeholder="過敏 / 開立公司抬頭…（選填）"
              ></textarea>
            </div>

            <div class="pt-2">
              <button
                type="submit"
                class="w-full bg-black text-white rounded-full py-3 font-semibold"
                :disabled="submitting"
              >
                {{ submitting ? '送出中…' : '送出訂單' }}
              </button>
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
                    <div class="text-xs text-gray-500">{{ currency(c.price) }} × {{ c.qty }}</div>
                  </div>
                  <div class="font-semibold">{{ currency(c.price * c.qty) }}</div>
                </div>
              </div>
              <div class="px-4 py-3 bg-gray-50 flex items-center justify-between">
                <div class="text-sm text-gray-600">小計</div>
                <div class="text-lg font-semibold">{{ currency(subtotal) }}</div>
              </div>
            </div>

            <div class="text-xs text-gray-500">
              • 商品保存方式請依標示冷凍/冷藏。<br />
              • 宅配將以低溫配送計價（貨到付款或到店付款皆可）。<br />
              • 若有售完或缺貨情況，我們會主動聯繫協調。
            </div>
          </aside>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'

/** Props */
const props = defineProps({
  cart: { type: Array, default: () => [] }, // [{code,name,price,qty,unit,lead_days}]
  subtotal: { type: Number, default: 0 },
  earliestPickupDate: { type: Date, required: true }
})
const emit = defineEmits(['close', 'submit'])

/** 表單資料 */
const form = reactive({
  name: '',
  phone: '',
  ship: 'pickup', // 'pickup' | 'delivery'
  pickupDate: '',
  address: '',
  note: ''
})

/** 驗證狀態 */
const errors = reactive({ name: '', phone: '', pickupDate: '', address: '' })
const submitting = ref(false)

/** 取貨最早日期字串（date input min） */
const minDateStr = computed(() => toDateInput(props.earliestPickupDate))

/** 工具 */
const currency = n => `NT$ ${Number(n || 0).toLocaleString()}`
const toDateInput = d => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
const formatDate = d => `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`

/** 當切換為宅配時，清空取貨日期；切回自取時清空地址 */
watch(
  () => form.ship,
  v => {
    if (v === 'pickup') form.address = ''
    else form.pickupDate = ''
  }
)

/** 驗證 */
const validate = () => {
  errors.name = form.name ? '' : '請輸入姓名'
  errors.phone = /^0\d{1,2}-?\d{6,8}$|^09\d{2}-?\d{3}-?\d{3}$/.test(form.phone)
    ? ''
    : '請輸入有效電話'
  if (form.ship === 'pickup') {
    errors.pickupDate = form.pickupDate ? '' : '請選擇取貨日期'
    errors.address = ''
  } else {
    errors.address = form.address ? '' : '請輸入收件地址'
    errors.pickupDate = ''
  }
  return !errors.name && !errors.phone && !errors.pickupDate && !errors.address
}

/** 送出 */
const handleSubmit = async () => {
  if (!props.cart?.length) return alert('購物車是空的')
  if (!validate()) return

  try {
    submitting.value = true
    const body = new URLSearchParams({
      kind: 'retail',
      name: form.name,
      contact: form.phone,
      ship: form.ship, // pickup | delivery
      pickup_date: form.pickupDate || '',
      address: form.address || '',
      note: form.note || '',
      items: JSON.stringify(props.cart),
      subtotal: String(props.subtotal)
    })
    const res = await fetch(import.meta.env.VITE_GAS_URL, { method: 'POST', body })
    const json = await res.json()
    if (json?.result === 'success') {
      alert('訂單已送出，感謝您！')
      emit('submit', { ...form })
      emit('close')
    } else {
      alert('送單失敗，請稍後再試')
    }
  } catch (e) {
    console.error(e)
    alert('送單發生錯誤，請稍後再試')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.input {
  @apply rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/20;
}
</style>

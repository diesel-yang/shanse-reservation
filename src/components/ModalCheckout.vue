<!-- src/components/ModalCheckout.vue -->
<template>
  <!-- Overlay -->
  <div class="fixed inset-0 z-[70]">
    <div class="absolute inset-0 bg-black/40" @click="$emit('close')" />

    <!-- Modal -->
    <div class="relative mx-auto my-4 w-[92%] max-w-md max-h-[92vh]">
      <div class="bg-white rounded-2xl shadow-xl flex flex-col h-full overflow-hidden">
        <!-- Header (sticky) -->
        <header class="px-5 py-4 border-b sticky top-0 bg-white z-10">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">結帳</h3>
            <button
              class="w-8 h-8 grid place-items-center rounded-full hover:bg-gray-100"
              aria-label="關閉"
              @click="$emit('close')"
            >
              ✕
            </button>
          </div>
        </header>

        <!-- Body (scrollable) -->
        <main class="flex-1 overflow-y-auto ios-scroll px-5 py-4 space-y-4">
          <!-- 訂購人 -->
          <div>
            <label class="block text-sm text-gray-600 mb-1">訂購人姓名</label>
            <input
              v-model.trim="local.name"
              type="text"
              class="w-full border rounded px-3 py-2"
              placeholder="姓名"
            />
          </div>

          <div>
            <label class="block text-sm text-gray-600 mb-1">聯絡電話</label>
            <input
              v-model.trim="local.phone"
              inputmode="tel"
              class="w-full border rounded px-3 py-2"
              placeholder="09xxxxxxxx"
            />
          </div>

          <!-- 取貨方式 -->
          <div>
            <label class="block text-sm text-gray-600 mb-1">取貨方式</label>
            <div class="flex items-center gap-6">
              <label class="inline-flex items-center gap-2">
                <input type="radio" value="到店自取" v-model="local.method" />
                <span>到店自取</span>
              </label>
              <label class="inline-flex items-center gap-2">
                <input type="radio" value="宅配" v-model="local.method" />
                <span>宅配</span>
              </label>
            </div>
          </div>

          <!-- 取貨日期 -->
          <div>
            <label class="block text-sm text-gray-600 mb-1">取貨日期</label>
            <input
              v-model="local.pickup_date"
              :min="minDateStr"
              type="date"
              class="w-full border rounded px-3 py-2"
            />
            <p class="text-xs text-gray-500 mt-1">最早可取：{{ minDateStrZh }}</p>
          </div>

          <!-- 備註 -->
          <div>
            <label class="block text-sm text-gray-600 mb-1">備註</label>
            <textarea
              v-model.trim="local.note"
              rows="3"
              class="w-full border rounded px-3 py-2"
              placeholder="過敏 / 抬頭 / 發票備註…（選填）"
            />
          </div>

          <!-- 訂單明細（可自行調整樣式） -->
          <section class="border rounded-lg">
            <div class="px-4 py-3 border-b font-medium">訂單明細</div>
            <div class="max-h-48 overflow-y-auto ios-scroll divide-y">
              <div
                v-for="(i, idx) in cart"
                :key="i.code + '-' + idx"
                class="px-4 py-3 flex items-center justify-between"
              >
                <div class="min-w-0">
                  <div class="font-medium truncate">{{ i.name }}</div>
                  <div class="text-xs text-gray-500">
                    {{ currency(i.price) }} / {{ i.unit || '份' }} × {{ i.qty }}
                  </div>
                </div>
                <div class="font-medium">{{ currency(i.price * i.qty) }}</div>
              </div>
            </div>
          </section>
        </main>

        <!-- Footer (sticky & safe-area) -->
        <footer
          class="sticky bottom-0 bg-white z-10 border-t px-5 pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+12px)]"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm text-gray-600">小計</span>
            <span class="text-lg font-semibold">{{ currency(subtotal) }}</span>
          </div>
          <button
            class="w-full rounded-full bg-black text-white py-3 text-center disabled:opacity-50"
            :disabled="submitting || !canSubmit"
            @click="onSubmit"
          >
            {{ submitting ? '送出中…' : '送出訂單' }}
          </button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  cart: { type: Array, default: () => [] },
  subtotal: { type: Number, default: 0 },
  earliestPickupDate: { type: [Date, String], default: null }
})
const emit = defineEmits(['close', 'submit'])

/* 本地表單狀態 */
const local = reactive({
  name: '',
  phone: '',
  method: '到店自取',
  pickup_date: '',
  note: ''
})
const submitting = reactive({ v: false })

/* 取貨最早日：字串 YYYY-MM-DD（避免 RangeError: Invalid time value） */
const minDate = computed(() => {
  const d =
    props.earliestPickupDate instanceof Date && !isNaN(props.earliestPickupDate)
      ? props.earliestPickupDate
      : new Date()
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
})
const minDateStr = computed(() => {
  const d = minDate.value
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
})
const minDateStrZh = computed(() => {
  const d = minDate.value
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
})

/* 預設填入最早日期 */
onMounted(() => {
  if (!local.pickup_date) local.pickup_date = minDateStr.value
  // 鎖背景頁捲動
  const prev = document.documentElement.style.overflow
  document.documentElement.style.overflow = 'hidden'
  // 還原
  onBeforeUnmount(() => {
    document.documentElement.style.overflow = prev
  })
})

/* 送單資格 */
const canSubmit = computed(() => {
  return local.name.trim() && local.phone.trim() && local.pickup_date && props.cart.length > 0
})

/* 幣別格式 */
const currency = n => `NT$ ${Number(n || 0).toLocaleString()}`

/* 送出 */
async function onSubmit() {
  if (!canSubmit.value || submitting.v) return
  submitting.v = true
  try {
    emit('submit', {
      customer: {
        name: local.name,
        phone: local.phone,
        method: local.method,
        pickup_date: local.pickup_date,
        note: local.note
      }
    })
  } finally {
    submitting.v = false
  }
}
</script>

<style scoped>
.ios-scroll {
  -webkit-overflow-scrolling: touch;
}
</style>

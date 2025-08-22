<template>
  <div class="fixed inset-0 z-50">
    <!-- 背景 -->
    <div class="absolute inset-0 bg-black/50" @click="$emit('close')"></div>

    <!-- 內容：手機滿版底部彈出、桌機置中卡片 -->
    <div
      class="absolute left-1/2 -translate-x-1/2 w-[96%] max-w-md md:max-w-xl bottom-2 md:top-8 md:bottom-auto"
    >
      <div class="bg-white rounded-2xl overflow-hidden shadow-xl">
        <!-- 標題列 -->
        <div class="px-4 py-3 border-b flex items-center justify-between">
          <h2 class="text-lg font-semibold">{{ item?.name || '商品' }}</h2>
          <button class="text-2xl leading-none -m-1 px-2" @click="$emit('close')">×</button>
        </div>

        <!-- 圖片（可選） -->
        <img
          v-if="item?.image"
          :src="item.image"
          :alt="item.name"
          class="w-full h-48 object-cover md:h-56"
        />

        <!-- 選項 + 備註 -->
        <div class="p-4 space-y-5 max-h-[56vh] overflow-auto md:max-h-[60vh]">
          <div v-if="opts.length">
            <label class="block text-sm font-medium mb-2">選項*</label>
            <div class="space-y-2">
              <label
                v-for="o in opts"
                :key="o.value"
                class="flex items-center gap-3 border rounded-xl px-3 py-2"
                :class="picked === o.value ? 'border-orange-500 ring-1 ring-orange-500/40' : ''"
              >
                <input type="radio" class="accent-orange-500" :value="o.value" v-model="picked" />
                <span class="text-sm">{{ o.label }}</span>
              </label>
            </div>
            <p v-if="err" class="text-xs text-red-500 mt-1">{{ err }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">備註</label>
            <textarea
              v-model.trim="note"
              rows="2"
              class="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/10"
              placeholder="少冰 / 去蔥…（選填）"
            />
          </div>
        </div>

        <!-- 底部操作列 -->
        <div class="p-4 border-t">
          <div class="flex items-center gap-3 mb-3">
            <button class="px-3 py-2 border rounded" @click="dec" :disabled="qty <= 1">－</button>
            <span class="w-8 text-center">{{ qty }}</span>
            <button class="px-3 py-2 border rounded" @click="qty++">＋</button>
            <div class="ml-auto text-sm text-gray-500">
              小計 <span class="font-semibold">NT$ {{ qty * price }}</span>
            </div>
          </div>

          <button
            class="w-full rounded-full py-3 font-semibold text-white bg-orange-500 disabled:opacity-50"
            @click="add"
            :disabled="submitting"
          >
            {{ submitting ? '加入中…' : `加入 NT$${qty * price}` }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  item: { type: Object, default: () => null } // {code,name,price,image, options?}
})
const emit = defineEmits(['close', 'confirm'])

const qty = ref(1)
const note = ref('')
const picked = ref('')
const submitting = ref(false)
const err = ref('')

const price = computed(() => Number(props.item?.price || 0))

// 把你的選項格式攤平為 [{label,value}]
const opts = computed(() => {
  // 假設商品可選「冰塊」：item.options = [{label:'要冰塊', value:'ice_yes'}, {label:'不要冰塊', value:'ice_no'}]
  return Array.isArray(props.item?.options) ? props.item.options : []
})

watch(
  () => props.item,
  it => {
    qty.value = 1
    note.value = ''
    picked.value = ''
    err.value = ''
  }
)

function dec() {
  if (qty.value > 1) qty.value--
}

async function add() {
  if (opts.value.length && !picked.value) {
    err.value = '請先選擇必填選項'
    return
  }
  err.value = ''
  try {
    submitting.value = true
    emit('confirm', {
      code: props.item.code,
      name: props.item.name,
      price: price.value,
      qty: qty.value,
      unit: props.item.unit || '份',
      note: note.value,
      option: picked.value || '' // 帶回所選選項
    })
    emit('close')
  } finally {
    submitting.value = false
  }
}
</script>

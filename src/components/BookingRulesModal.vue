<template>
  <div v-if="visible" class="fixed inset-0 z-50 bg-black/40 flex items-end justify-center">
    <div class="bg-white w-full max-h-[90vh] rounded-t-2xl p-4 overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-lg font-semibold">規則與注意事項</h2>
        <button @click="close" class="text-gray-400 text-xl">×</button>
      </div>

      <!-- Content -->
      <div class="text-sm text-gray-700 space-y-3 leading-relaxed">
        <p class="font-medium">【訂位須知】</p>

        <p>
          本餐廳接受 60 天內訂位。<br />
          線上訂位系統一組電話號碼僅能一日訂位，<br />
          若有多日訂位需求，歡迎來電訂位。
        </p>

        <p class="font-medium">一、餐廳資訊</p>
        <p>
          週一至週五 12:00–15:00 / 18:00–22:00<br />
          週六與週日 11:30–14:30 / 17:30–21:30<br />
          （最後點餐時間：13:30 / 20:30）<br />
          地址：台北市大安區建國南路一段 65 巷 7 號<br />
          訂位專線：02-8772-3355
        </p>

        <p class="font-medium">二、包廂預約</p>
        <p>包廂僅接受電話預約，恕不接受 Email / Facebook / Instagram 訂席。</p>

        <p>
          • 訂席保留 10 分鐘，逾時視同取消。<br />
          • 若有飲食禁忌請提前告知。<br />
          • 酒水服務費依店內規定另計。
        </p>

        <p class="text-red-500 text-xs">* 請詳細閱讀規則與注意事項後繼續</p>
      </div>

      <!-- Action -->
      <button
        class="w-full mt-4 h-12 rounded-xl bg-[#f36f21] text-white text-base font-medium"
        @click="agree"
      >
        我已閱讀並同意規則與注意事項
      </button>

      <div class="mt-2 text-center text-xs text-gray-400">inline.app</div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue', 'agreed'])

const visible = ref(props.modelValue)

watch(
  () => props.modelValue,
  v => (visible.value = v)
)

function close() {
  emit('update:modelValue', false)
}

function agree() {
  localStorage.setItem('bookingRulesAgreed', '1')
  emit('agreed')
  emit('update:modelValue', false)
}
</script>

<template>
  <div class="p-4 space-y-4 bg-white min-h-screen">
    <h1 class="text-lg font-bold">確認訂位與聯絡資訊</h1>

    <div class="text-sm">
      <div>日期：{{ draft.date }}</div>
      <div>時段：{{ draft.time }}</div>
      <div>人數：{{ draft.people }} 位</div>
      <div>訂金：{{ draft.people * 315 }} 元</div>
    </div>

    <input v-model="form.name" placeholder="訂位人姓名" class="border p-2 w-full" />
    <input v-model="form.phone" placeholder="手機號碼" class="border p-2 w-full" />
    <input v-model="form.email" placeholder="訂位人Email" class="border p-2 w-full" />
    <textarea v-model="form.note" placeholder="其他備註" class="border p-2 w-full"></textarea>

    <button class="bg-[#f36f21] text-white w-full py-3" @click="goPay">前往 LINE Pay 付款</button>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const draft = route.state?.draft || {}
const form = { name: '', phone: '', email: '', note: '' }

function goPay() {
  router.push({ path: '/booking/payment', state: { draft, form } })
}
</script>

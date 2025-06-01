<template>
  <div class="max-w-2xl mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6 text-orange-600">餐桌予約</h1>
    <form @submit.prevent="submitReservation" class="space-y-4">
      <div>
        <label class="block font-medium">訂位人姓名：</label>
        <input v-model="form.name" type="text" required class="w-full border p-2 rounded" />
      </div>
      <div>
        <label class="block font-medium">用餐日期：</label>
        <input id="datePicker" v-model="form.date" type="text" required class="w-full border p-2 rounded" />
      </div>
      <div>
        <label class="block font-medium">用餐時段：</label>
        <select v-model="form.time" required class="w-full border p-2 rounded">
          <option disabled value="">請選擇</option>
          <option>11:30–13:00</option>
          <option>12:20–13:50</option>
          <option>13:10–14:40</option>
          <option>14:00–15:30</option>
        </select>
      </div>
      <div>
        <label class="block font-medium">用餐人數：</label>
        <select v-model="form.people" required class="w-full border p-2 rounded">
          <option disabled value="">請選擇</option>
          <option v-for="n in 8" :key="n" :value="n">{{ n }} 位</option>
        </select>
      </div>
      <button type="submit" class="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700">
        確認訂位
      </button>
    </form>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import flatpickr from 'flatpickr'
import 'flatpickr/dist/flatpickr.min.css'

const form = ref({
  name: '',
  date: '',
  time: '',
  people: '',
})

const submitReservation = () => {
  alert(`✅ 感謝 ${form.value.name} 訂位！\n\n時間：${form.value.date} ${form.value.time}\n人數：${form.value.people} 位`)
  // 你可以在此加入 Google Sheets 寫入邏輯
}

onMounted(() => {
  flatpickr('#datePicker', {
    dateFormat: 'Y-m-d',
    minDate: 'today',
    disable: [
      function(date) {
        // 禁用每週三、四
        return date.getDay() === 3 || date.getDay() === 4
      },
    ],
  })
})
</script>
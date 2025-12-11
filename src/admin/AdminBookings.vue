<!-- src/admin/AdminBookings.vue -->
<script setup>
import { ref, onMounted } from 'vue'
import { gasGet } from '@/utils/gas'

const bookings = ref([])

onMounted(async () => {
  const res = await gasGet({ type: 'bookingList' })
  bookings.value = res.data || []
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">訂位管理</h1>

    <table class="table-auto w-full bg-white shadow rounded-xl">
      <thead>
        <tr class="bg-gray-100 text-left">
          <th class="p-3">編號</th>
          <th class="p-3">姓名</th>
          <th class="p-3">電話</th>
          <th class="p-3">日期</th>
          <th class="p-3">時段</th>
          <th class="p-3">人數</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="b in bookings" :key="b['訂位編號']">
          <td class="p-3">{{ b['訂位編號'] }}</td>
          <td class="p-3">{{ b['姓名'] }}</td>
          <td class="p-3">{{ b['電話'] }}</td>
          <td class="p-3">{{ b['日期'] }}</td>
          <td class="p-3">{{ b['時段'] }}</td>
          <td class="p-3">{{ b['人數'] }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

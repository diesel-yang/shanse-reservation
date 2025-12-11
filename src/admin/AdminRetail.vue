<!-- src/admin/AdminRetail.vue -->
<script setup>
import { ref, onMounted } from 'vue'
import { gasGet } from '@/utils/gas'

const orders = ref([])

onMounted(async () => {
  const res = await gasGet({ type: 'retailOrders' })
  orders.value = res.data || []
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">零售訂單管理</h1>

    <table class="table-auto w-full bg-white shadow rounded-xl">
      <thead>
        <tr class="bg-gray-100 text-left">
          <th class="p-3">訂單編號</th>
          <th class="p-3">姓名</th>
          <th class="p-3">電話</th>
          <th class="p-3">總金額</th>
          <th class="p-3">付款狀態</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="o in orders" :key="o['訂單編號']">
          <td class="p-3">{{ o['訂單編號'] }}</td>
          <td class="p-3">{{ o['姓名'] }}</td>
          <td class="p-3">{{ o['電話'] }}</td>
          <td class="p-3">{{ o['合計'] }}</td>
          <td class="p-3">{{ o['付款狀態'] }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

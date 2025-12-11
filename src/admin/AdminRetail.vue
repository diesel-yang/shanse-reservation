<!-- src/admin/AdminRetail.vue -->
<script setup>
import { ref, onMounted } from 'vue'
import RefundButton from './components/RefundButton.vue'
import axios from 'axios'

const orders = ref([])
const loading = ref(true)

async function loadOrders() {
  loading.value = true
  const res = await axios.get(`${import.meta.env.VITE_GAS_URL}?type=retailOrders`)
  orders.value = res.data
  loading.value = false
}

onMounted(loadOrders)
</script>

<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">零售訂單管理</h1>

    <table class="w-full border-collapse">
      <thead>
        <tr class="bg-gray-100">
          <th class="p-2">訂單編號</th>
          <th class="p-2">姓名</th>
          <th class="p-2">金額</th>
          <th class="p-2">付款狀態</th>
          <th class="p-2">退款</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="o in orders" :key="o.id" class="border-b">
          <td class="p-2">{{ o.id }}</td>
          <td class="p-2">{{ o.name }}</td>
          <td class="p-2">{{ o.amount }}</td>

          <td class="p-2">
            <span v-if="o.paid" class="text-green-600">已付款</span>
            <span v-else class="text-red-600">未付款</span>
          </td>

          <td class="p-2">
            <span v-if="o.refundStatus === 'refunded'" class="text-red-600">
              已退款（{{ o.refundAt }}）
            </span>

            <RefundButton
              v-else-if="o.paid"
              :orderId="o.id"
              :transactionId="o.transactionId"
              :amount="o.amount"
              @done="loadOrders"
            />

            <span v-else class="text-gray-400">無資料</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

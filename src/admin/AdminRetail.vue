<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { fetchRetailOrders, refundLinepay } from '@/api/retail.api'
import { adaptRetailOrders } from '@/domain/retail/retail.adapter'
import { canRefund } from '@/domain/_core/abilities'
import RefundButton from './components/RefundButton.vue'

const orders = ref([])
const loading = ref(false)
let timer = null

async function loadOrders() {
  loading.value = true
  orders.value = await fetchRetailOrders()
  loading.value = false
}

onMounted(() => {
  loadOrders()
  timer = setInterval(loadOrders, 30000) // 30 秒 auto-refresh
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div>
    <h1 class="text-xl font-bold mb-4">零售訂單</h1>

    <table class="w-full">
      <thead>
        <tr>
          <th>訂單</th>
          <th>姓名</th>
          <th>金額</th>
          <th>狀態</th>
          <th>退款</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="o in orders" :key="o.id">
          <td>{{ o.id }}</td>
          <td>{{ o.name }}</td>
          <td>{{ o.total }}</td>

          <td>
            <span v-if="o.payStatus === 'paid'">已付款</span>
            <span v-else-if="o.payStatus === 'refunded'">已退款</span>
            <span v-else>未付款</span>
          </td>

          <td>
            <RefundButton v-if="canRefund(o)" :order="o" @done="loadOrders" />
            <span v-else class="text-gray-400">—</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

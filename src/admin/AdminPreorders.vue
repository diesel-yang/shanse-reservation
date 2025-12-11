<!-- src/admin/AdminPreorders.vue -->
<script setup>
import { ref, onMounted } from 'vue'
import { gasGet } from '@/utils/gas'

const preorders = ref([])

onMounted(async () => {
  const res = await gasGet({ type: 'preorders' })
  preorders.value = res.data || []
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">預先點餐管理</h1>

    <table class="table-auto w-full bg-white shadow rounded-xl">
      <thead>
        <tr class="bg-gray-100 text-left">
          <th class="p-3">訂單 ID</th>
          <th class="p-3">姓名</th>
          <th class="p-3">日期</th>
          <th class="p-3">時間</th>
          <th class="p-3">金額</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="o in preorders" :key="o['訂單ID']">
          <td class="p-3">{{ o['訂單ID'] }}</td>
          <td class="p-3">{{ o['姓名'] }}</td>
          <td class="p-3">{{ o['用餐日期'] }}</td>
          <td class="p-3">{{ o['用餐時間區段'] }}</td>
          <td class="p-3">{{ o['總金額'] }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

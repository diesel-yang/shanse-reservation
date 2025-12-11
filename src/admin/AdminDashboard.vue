<!-- src/admin/AdminDashboard.vue -->
<script setup>
import { ref, onMounted } from 'vue'
import { gasApi } from '@/utils/gas'

const retailCount = ref(0)
const bookingCount = ref(0)
const preorderCount = ref(0)

onMounted(async () => {
  const retail = await gasApi.getRetail()
  retailCount.value = retail?.data?.frozen?.length + retail?.data?.dessert?.length || 0

  const notice = await gasApi.getNotice()
  bookingCount.value = notice?.data?.length || 0

  // 假設預先點餐 API → 後端還沒完成
  preorderCount.value = 0
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Dashboard</h1>

    <div class="grid grid-cols-3 gap-6">
      <div class="box">
        <h3>零售商品數量</h3>
        <p class="value">{{ retailCount }}</p>
      </div>

      <div class="box">
        <h3>訂位規則</h3>
        <p class="value">{{ bookingCount }}</p>
      </div>

      <div class="box">
        <h3>預先點餐（開發中）</h3>
        <p class="value">{{ preorderCount }}</p>
      </div>
    </div>
  </div>
</template>

<style>
.box {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}
.value {
  font-size: 36px;
  font-weight: 700;
  margin-top: 10px;
}
</style>

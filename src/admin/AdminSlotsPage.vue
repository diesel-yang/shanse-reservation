<!-- src/admin/AdminSlotsPage.vue -->
<!-- 管理某一天各時段的『可訂位人數（capacity）』-->
<template>
  <section class="max-w-4xl mx-auto px-6 py-8">
    <h1 class="text-2xl font-semibold mb-6">訂位時段庫存管理（Admin）</h1>

    <!-- 日期選擇 -->
    <div class="mb-6">
      <label class="block text-sm font-medium mb-2"> 選擇日期 </label>
      <input type="date" v-model="date" class="border px-3 py-2 rounded" @change="loadSlots" />
    </div>

    <!-- Slot 表格 -->
    <table v-if="slots.length" class="w-full border-collapse text-sm">
      <thead>
        <tr class="bg-gray-100">
          <th class="border px-3 py-2">時段</th>
          <th class="border px-3 py-2">庫存上限</th>
          <th class="border px-3 py-2">已承諾</th>
          <th class="border px-3 py-2">剩餘</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="slot in slots" :key="slot.time">
          <td class="border px-3 py-2 text-center">
            {{ slot.time }}
          </td>

          <td class="border px-3 py-2 text-center">
            <input
              type="number"
              min="0"
              class="w-20 border px-2 py-1 rounded text-center"
              v-model.number="slot.capacity"
            />
          </td>

          <td class="border px-3 py-2 text-center">
            {{ slot.committed }}
          </td>

          <td
            class="border px-3 py-2 text-center font-semibold"
            :class="slot.available === 0 ? 'text-red-600' : ''"
          >
            {{ slot.available }}
          </td>
        </tr>
      </tbody>
    </table>

    <!-- 儲存 -->
    <div v-if="slots.length" class="mt-6">
      <button class="bg-black text-white px-6 py-3 rounded" @click="save">儲存設定</button>
    </div>
  </section>
  <ㄏ/template>

  <script setup>
    /**
     * AdminSlotPage.vue
     * -------------------------------------------------
     * 功能：
     * - 管理單日各時段的「可訂位人數（capacity）」
     *
     * 對齊後端：
     * - GET  /api/admin/slots?date=YYYY-MM-DD
     * - POST /api/admin/slots
     *
     * 注意：
     * - 不修改 booking
     * - 不碰 payment
     * - 只改 BookingSlots sheet
     */

    import { ref } from 'vue'
    import axios from '@/api/axios'

    const date = ref('')
    const slots = ref([])

    /**
     * 載入某一天的 slot 狀態
     */
    async function loadSlots() {
      if (!date.value) return

      const res = await axios.get('/api/admin/slots', {
        params: { date: date.value }
      })

      if (res.data.result !== 'success') {
        alert(res.data.message || '載入失敗')
        return
      }

      /**
       * 回傳格式（來自 Domain API）：
       * [
       *   { time, capacity, committed, available }
       * ]
       */
      slots.value = res.data.data
    }

    /**
     * 儲存 slot capacity 設定
     */
    async function save() {
      // 防呆：庫存不可小於已承諾
      for (const s of slots.value) {
        if (s.capacity < s.committed) {
          alert(`${s.time} 的庫存不能小於已承諾數量`)
          return
        }
      }

      const res = await axios.post('/api/admin/slots', {
        date: date.value,
        slots: slots.value.map(s => ({
          time: s.time,
          capacity: s.capacity
        }))
      })

      if (res.data.result !== 'success') {
        alert(res.data.message || '儲存失敗')
        return
      }

      alert('已儲存')
      loadSlots()
    }
  </script>
</template>

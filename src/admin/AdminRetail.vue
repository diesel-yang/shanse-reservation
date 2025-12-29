<!--
  src/admin/AdminRetail.vue
  ------------------------------------------------------------
  用途：
  - 後台零售訂單管理
  - 顯示訂單清單（不含退款操作）
-->

<script setup>
import { ref, onMounted } from 'vue'
import { fetchAdminRetail } from '@/admin/api/admin.retail.api'

const rows = ref([])
const loading = ref(false)
const error = ref(null)

async function loadData() {
  loading.value = true
  error.value = null

  try {
    rows.value = await fetchAdminRetail()
  } catch (err) {
    console.error('[AdminRetail] loadData failed', err)
    error.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>

<template>
  <div>
    <h1 class="text-xl font-bold mb-4">零售訂單管理</h1>

    <div v-if="error" class="text-red-600 text-sm mb-4">
      {{ error }}
    </div>

    <table class="w-full border">
      <thead>
        <tr class="bg-gray-100">
          <th class="p-2 text-left">姓名</th>
          <th class="p-2 text-left">電話</th>
          <th class="p-2 text-right">金額</th>
          <th class="p-2 text-left">狀態</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="row in rows"
          :key="row.retailId"
          class="border-t"
          data-testid="retail-row"
        >
          <td class="p-2">
            {{ row.name }}
          </td>

          <td class="p-2">
            {{ row.phone }}
          </td>

          <td class="p-2 text-right">
            {{ row.totalAmount }}
          </td>

          <td class="p-2">
            {{ row.status }}
          </td>
        </tr>

        <tr v-if="!loading && rows.length === 0">
          <td
            colspan="4"
            class="p-4 text-center text-gray-400"
          >
            尚無零售訂單
          </td>
        </tr>
      </tbody>
    </table>

    <div
      v-if="loading"
      class="mt-4 text-gray-500 text-sm"
    >
      載入中…
    </div>
  </div>
</template>

<template>
  <div class="max-w-4xl mx-auto px-4 py-6">
    <!-- 訂位基本資料 -->
    <div class="grid gap-4 mb-6">
      <input v-model="name" type="text" placeholder="訂位姓名" class="input" />
      <input v-model="date" type="date" class="input" />
      <div class="grid grid-cols-2 gap-2">
        <button
          v-for="slot in timeSlots"
          :key="slot"
          @click="time = slot"
          :class="[
            'py-2 px-3 rounded border text-sm',
            time === slot ? 'bg-orange-500 text-white' : 'bg-white border-gray-300 text-gray-800'
          ]"
        >
          {{ slot }}
        </button>
      </div>
      <select v-model="peopleCount" class="input">
        <option disabled value="">人數</option>
        <option v-for="n in 8" :key="n" :value="n">{{ n }} 位</option>
      </select>
    </div>

    <!-- 點餐模式選擇（人數 > 1 才顯示） -->
    <div v-if="peopleCount > 1" class="text-center mb-6">
      <p class="mb-2 text-sm text-gray-600">請選擇點餐方式</p>
      <div class="flex justify-center gap-4 flex-wrap">
        <button
          class="px-4 py-2 rounded border border-orange-500 text-orange-500 hover:bg-orange-100 transition-all"
          :class="{ 'bg-orange-500 text-white': isGroupMode }"
          @click="confirmSwitchMode(true)"
        >
          多人一起點<br class="sm:hidden" />(幫全桌點餐)
        </button>
        <button
          class="px-4 py-2 rounded border border-orange-500 text-orange-500 hover:bg-orange-100 transition-all"
          :class="{ 'bg-orange-500 text-white': !isGroupMode }"
          @click="confirmSwitchMode(false)"
        >
          自己點自己的<br class="sm:hidden" />(每人各自選)
        </button>
      </div>
    </div>

    <!-- 顧客點餐區塊 -->
    <div v-for="(order, index) in orders" :key="index" class="mb-8">
      <OrderBlock
        :order="order"
        :index="index"
        :hide-title="!showTitle(index)"
        @update="(value) => updateOrder(index, value)"
        @preview="(item) => openPreview(item)"
      />
    </div>

    <!-- 彈出確認切換模式的 Modal -->
    <div v-if="showConfirmModal" class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white rounded-lg shadow-xl p-6 w-11/12 max-w-sm">
        <h2 class="text-lg font-semibold mb-4 text-gray-800">切換點餐模式</h2>
        <p class="text-gray-700 mb-6 text-sm">
          您將更換點餐模式，原點餐資料將清除，是否確定更改？
        </p>
        <div class="flex justify-end gap-3">
          <button
            class="px-4 py-2 bg-gray-200 rounded text-gray-700 hover:bg-gray-300"
            @click="cancelSwitch"
          >取消</button>
          <button
            class="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            @click="applySwitchMode"
          >確定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import OrderBlock from '../components/OrderBlock.vue'

const name = ref('')
const date = ref('')
const time = ref('')
const peopleCount = ref('')
const timeSlots = ['11:30–13:00', '12:30–13:50', '13:10–14:40', '14:00–15:30']

// 點餐模式：true 為多人一起點，false 為自己點自己的
const isGroupMode = ref(true)
const showConfirmModal = ref(false)
const pendingMode = ref(true)

// 點餐資料
const orders = ref([])

// 當人數變動時初始化訂單區塊
watch(peopleCount, (newCount) => {
  if (!newCount) return
  const count = parseInt(newCount)
  orders.value = Array.from({ length: count }, () => ({
    main: '', drink: '', side: '', addons: []
  }))
})

// 切換點餐模式：預先記錄要切換的模式，開啟 Modal
const confirmSwitchMode = (mode) => {
  if (isGroupMode.value === mode) return
  pendingMode.value = mode
  showConfirmModal.value = true
}

// 按「確定」切換點餐模式
const applySwitchMode = () => {
  isGroupMode.value = pendingMode.value
  resetOrders()
  showConfirmModal.value = false
}

// 按「取消」關閉彈窗
const cancelSwitch = () => {
  showConfirmModal.value = false
}

// 清空所有點餐資料
const resetOrders = () => {
  orders.value = orders.value.map(() => ({
    main: '', drink: '', side: '', addons: []
  }))
}

// 是否顯示顧客 title（只在多人一起點時顯示）
const showTitle = (index) => {
  return peopleCount.value > 1 && isGroupMode.value
}

// 處理更新每位顧客的點餐資料
const updateOrder = (index, value) => {
  orders.value[index] = value
}

// 預覽功能略過
const openPreview = (item) => {
  console.log('預覽品項：', item)
}
</script>

<style>
.input {
  @apply border rounded px-3 py-2 text-sm w-full;
}
</style>
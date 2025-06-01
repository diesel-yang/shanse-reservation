<template>
  <div class="max-w-4xl mx-auto p-4 space-y-6">
    <!-- 訂位資料區塊 -->
    <section class="bg-orange-50 p-4 rounded shadow">
      <h2 class="text-lg font-semibold mb-2">餐桌予約</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label>訂位人姓名</label>
          <input v-model="reservation.name" type="text" class="input" required />
        </div>
        <div>
          <label>用餐日期</label>
          <input v-model="reservation.date" type="date" class="input" required />
        </div>
        <div>
          <label>用餐時段</label>
          <select v-model="reservation.time" class="input" required>
            <option value="">請選擇</option>
            <option v-for="t in times" :key="t">{{ t }}</option>
          </select>
        </div>
        <div>
          <label>用餐人數</label>
          <select v-model.number="reservation.people" class="input" required>
            <option v-for="n in 8" :key="n" :value="n">{{ n }} 位</option>
          </select>
        </div>
      </div>
    </section>

    <!-- 餐點選擇區塊 -->
    <section class="bg-orange-50 p-4 rounded shadow" v-for="(guest, index) in guests" :key="index">
      <h2 class="text-md font-bold mb-2">第 {{ index + 1 }} 位</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label>主餐</label>
          <select v-model="guest.main" class="input" required>
            <option value="">請選擇</option>
            <option v-for="item in mains" :key="item">{{ item }}</option>
          </select>
        </div>
        <div>
          <label>飲品</label>
          <select v-model="guest.drink" class="input" required>
            <option value="">請選擇</option>
            <option v-for="item in drinks" :key="item">{{ item }}</option>
          </select>
        </div>
        <div>
          <label>副餐</label>
          <select v-model="guest.side" class="input" required>
            <option value="">請選擇</option>
            <option v-for="item in sides" :key="item">{{ item }}</option>
          </select>
        </div>
        <div>
          <label>加點（可複選）</label>
          <div class="flex flex-wrap gap-2">
            <label v-for="addon in addons" :key="addon" class="flex items-center space-x-1">
              <input type="checkbox" :value="addon" v-model="guest.addons" />
              <span>{{ addon }}</span>
            </label>
          </div>
        </div>
      </div>
    </section>

    <!-- 餐點明細 -->
    <section class="bg-white p-4 border rounded">
      <h2 class="font-semibold text-lg mb-2">訂單總覽</h2>
      <div v-for="(guest, index) in guests" :key="'summary' + index" class="border-t pt-2 mt-2">
        <p><strong>第 {{ index + 1 }} 位：</strong></p>
        <ul class="ml-4 text-sm space-y-1">
          <li>主餐：{{ guest.main }}</li>
          <li>飲品：{{ guest.drink }}</li>
          <li>副餐：{{ guest.side }}</li>
          <li>套餐小計：${{ basePrice }}</li>
          <li v-if="guest.addons.length > 0">加點：
            <ul class="ml-4">
              <li v-for="(addon, aIndex) in guest.addons" :key="aIndex">加點{{ aIndex + 1 }}：{{ addon }}</li>
            </ul>
          </li>
          <li>加點小計：${{ guest.addons.length * addonPrice }}</li>
        </ul>
      </div>
      <div class="mt-4 font-semibold text-right">
        套餐總計：${{ reservation.people * basePrice }}<br />
        加點總計：${{ totalAddons * addonPrice }}<br />
        服務費（10%）：${{ serviceCharge }}<br />
        <strong>總金額：${{ totalAmount }}</strong>
      </div>
    </section>

    <div class="text-center">
      <button @click="submitOrder" class="bg-orange-500 text-white px-6 py-2 mt-4 rounded hover:bg-orange-600">
        送出訂單
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

// 價格設定
const basePrice = 700
const addonPrice = 60

// 訂位資訊
const reservation = ref({
  name: '',
  date: '',
  time: '',
  people: 1
})

// 餐點選項
const mains = ['鮮蝦蟹醬黃咖哩', '綠咖哩嫩雞', '瑪莎曼牛肋咖哩']
const drinks = ['泰式奶茶', '芒果冰茶', '火烤椰子咖啡']
const sides = ['南薑椰汁雞湯', '茉莉牛奶冰淇淋', '斑蘭葉豆花']
const addons = ['蘇丹王榴槤冰淇淋', '草莓波堤布丁', '生椰雪球布丁']

// 時段選項
const times = ['11:30–13:00', '12:20–13:50', '13:10–14:40', '14:00–15:30']

// 每位客人餐點資料
const guests = ref([])

// 監看人數變動，自動調整 guests 長度
watch(() => reservation.value.people, (newVal) => {
  while (guests.value.length < newVal) {
    guests.value.push({ main: '', drink: '', side: '', addons: [] })
  }
  while (guests.value.length > newVal) {
    guests.value.pop()
  }
})

// 金額計算
const totalAddons = computed(() =>
  guests.value.reduce((sum, g) => sum + g.addons.length, 0)
)
const serviceCharge = computed(() =>
  Math.round((reservation.value.people * basePrice + totalAddons.value * addonPrice) * 0.1)
)
const totalAmount = computed(() =>
  reservation.value.people * basePrice + totalAddons.value * addonPrice + serviceCharge.value
)

// 送出訂單
const submitOrder = async () => {
  const url = 'https://script.google.com/macros/s/AKfycbxsywNwio4gJU4acT7vHdRXnQxUdNVBBob8mFDsy_vkf2eKJEe6LRsQwZrVEHdmBmImow/exec'

  const payload = {
    ...reservation.value,
    guests: guests.value
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const result = await res.json()
    if (result.result === 'success') {
      alert('✅ 訂單已送出！')
    } else {
      alert('❌ 訂單送出失敗')
    }
  } catch (e) {
    console.error(e)
    alert('❌ 發送錯誤，請稍後再試')
  }
}
</script>

<style scoped>
.input {
  @apply border border-gray-300 p-2 rounded w-full;
}
</style>
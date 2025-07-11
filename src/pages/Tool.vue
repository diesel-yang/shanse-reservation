<template>
  <div class="max-w-5xl mx-auto p-6 text-gray-800">
    <h1 class="text-2xl font-bold mb-4 text-orange-600">簡碼自動生成工具</h1>
    <p class="mb-2 text-sm text-gray-600">
      請貼上從 Google Sheets 匯出的 JSON 陣列（含分類、名稱、價格、備註、圖片網址、停售）。
    </p>

    <textarea
      v-model="input"
      placeholder="貼上 JSON 內容..."
      class="w-full h-48 border rounded p-2 mb-4 font-mono text-sm"></textarea>

    <button
      @click="generate"
      class="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded shadow">
      🔁 轉換為菜單格式
    </button>

    <div v-if="output" class="mt-6">
      <h2 class="font-semibold mb-2">🍱 輸出結果</h2>
      <pre class="bg-gray-100 border rounded p-3 text-sm overflow-x-auto whitespace-pre-wrap">{{
        output
      }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const input = ref('')
const output = ref('')

const generate = () => {
  let raw = []
  try {
    raw = JSON.parse(input.value)
  } catch (e) {
    output.value = '❌ 請輸入正確的 JSON 格式'
    return
  }

  const categoryMap = {
    主餐: 'main',
    飲品: 'drink',
    副餐: 'side',
    加點: 'addon'
  }

  const counters = { main: 1, drink: 1, side: 1, addon: 1 }
  const result = { main: [], drink: [], side: [], addon: [] }

  for (const item of raw) {
    const catKey = categoryMap[item['分類']]
    if (!catKey) continue

    const code = `${catKey}_${String(counters[catKey]++).padStart(2, '0')}`

    result[catKey].push({
      code,
      name: item['名稱'] || '',
      price: Number(item['價格']) || 0,
      note: item['備註'] || '',
      image: item['圖片網址'] || '',
      disabled: item['停售'] === '是'
    })
  }

  output.value = JSON.stringify(result, null, 2)
}
</script>

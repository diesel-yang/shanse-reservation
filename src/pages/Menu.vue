<template>
  <div class="max-w-5xl mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6 text-orange-600">完整菜單</h1>

    <div v-for="category in ['主餐', '飲品', '副餐', '加點']" :key="category" class="mb-10">
      <h2 class="text-2xl font-semibold mb-4">{{ category }}</h2>
      <div class="grid md:grid-cols-2 gap-4">
        <div
          v-for="item in menuByCategory[category]"
          :key="item.name"
          class="p-4 border rounded shadow-sm bg-white"
        >
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-medium">{{ item.name }}</h3>
            <span class="text-sm text-gray-600">{{ item.price }} 元</span>
          </div>
          <p class="text-sm text-gray-500 mt-1" v-if="item.note">{{ item.note }}</p>
          <img
            v-if="item.image"
            :src="item.image"
            @error="e => e.target.style.display = 'none'"
            alt="圖片"
            class="mt-2 max-h-40 object-cover w-full rounded"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'

const menuByCategory = ref({
  主餐: [],
  飲品: [],
  副餐: [],
  加點: []
})

const fetchMenu = async () => {
  try {
    const res = await fetch('https://script.google.com/macros/s/AKfycbxsywNwio4gJU4acT7vHdRXnQxUdNVBBob8mFDsy_vkf2eKJEe6LRsQwZrVEHdmBmImow/exec')
    const json = await res.json()

    const grouped = {
      主餐: [],
      飲品: [],
      副餐: [],
      加點: []
    }

    for (const item of json.menu) {
      if (grouped[item.category]) {
        grouped[item.category].push({
          name: item.name,
          price: item.price,
          note: item.note,
          image: item.image
        })
      }
    }

    menuByCategory.value = grouped
  } catch (err) {
    console.error('讀取菜單失敗', err)
  }
}

onMounted(() => {
  fetchMenu()
})
</script>
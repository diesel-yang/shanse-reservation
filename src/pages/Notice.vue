<template>
  <div class="max-w-3xl mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-orange-600 mb-6">訂位及用餐須知</h1>

    <template v-if="groups.length">
      <section v-for="g in groups" :key="g.category || 'default'" class="mb-8">
        <h2 v-if="g.category" class="text-xl font-semibold mb-2">﹡{{ g.category }}</h2>
        <ul class="list-disc list-inside space-y-1">
          <li v-for="it in g.items" :key="it.order + it.rule">{{ it.rule }}</li>
        </ul>
      </section>
    </template>

    <p v-else class="opacity-60">目前沒有須知。</p>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'

const items = ref([])

onMounted(async () => {
  const api = import.meta.env.VITE_API
  const res = await fetch(`${api}/exec?type=notice`)
  const json = await res.json()
  items.value = json?.data || []
})

const groups = computed(() => {
  // 以 category 分組；沒有分類的就歸到空字串
  const map = new Map()
  for (const it of items.value) {
    const k = it.category || ''
    if (!map.has(k)) map.set(k, [])
    map.get(k).push(it)
  }
  return Array.from(map.entries()).map(([category, list]) => ({ category, items: list }))
})
</script>

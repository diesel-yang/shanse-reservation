// src/pages/Notice.vue（取代原本 Faq.vue）

<template>
  <div class="max-w-3xl mx-auto px-4 py-8">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-bold text-orange-600">訂位及用餐須知</h1>
      <button
        @click="reload"
        class="px-3 py-1.5 text-sm border rounded hover:bg-orange-50"
        :disabled="loading"
      >
        {{ loading ? '更新中...' : '重新整理' }}
      </button>
    </div>

    <p v-if="error" class="text-red-600 mb-4">⚠️ {{ error }}</p>
    <p v-if="loading" class="text-gray-500">載入中…</p>

    <div v-if="!loading && !error" class="space-y-4">
      <article
        v-for="(item, i) in faqs"
        :key="item.anchor"
        :id="item.anchor"
        class="bg-white border rounded-xl shadow p-4"
      >
        <header class="flex items-start justify-between gap-3">
          <h2 class="font-semibold text-lg text-gray-900 leading-snug">
            <span
              class="inline-flex items-center justify-center w-7 h-7 rounded-full border mr-2 text-sm"
            >
              {{ i + 1 }}
            </span>
            {{ item.question }}
          </h2>
          <div class="flex items-center gap-2 shrink-0">
            <button
              @click="copyLink(item.anchor)"
              class="text-xs px-2 py-1 border rounded hover:bg-gray-50"
            >
              複製連結
            </button>
            <button
              @click="toggle(i)"
              class="text-xs px-2 py-1 border rounded hover:bg-gray-50"
              :aria-expanded="openIndex === i"
              :aria-controls="`panel-${item.anchor}`"
            >
              {{ openIndex === i ? '收合' : '展開' }}
            </button>
          </div>
        </header>

        <section
          :id="`panel-${item.anchor}`"
          v-show="openIndex === i"
          class="mt-3 prose prose-sm max-w-none text-gray-800 whitespace-pre-line"
        >
          {{ item.answer }}
        </section>
      </article>

      <p v-if="faqs.length === 0" class="text-gray-500">目前尚無條文。</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const faqs = ref([])
const loading = ref(false)
const error = ref('')
const openIndex = ref(0) // 預設展開第一條

const CACHE_KEY = 'notice-cache-v1'
const CACHE_TTL_MS = 10 * 60 * 1000

function slug(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-一-龥]/g, '')
    .slice(0, 40)
}

function enhance(items) {
  return (items || []).map((it, idx) => ({
    ...it,
    anchor: it.order
      ? `rule-${it.order}-${slug(it.question)}`
      : `rule-${idx + 1}-${slug(it.question)}`
  }))
}

async function fetchFaq(force = false) {
  error.value = ''
  loading.value = true

  if (!force) {
    const raw = localStorage.getItem(CACHE_KEY)
    if (raw) {
      try {
        const cached = JSON.parse(raw)
        if (Date.now() - cached.ts < CACHE_TTL_MS) {
          faqs.value = cached.data || []
          loading.value = false
          setTimeout(() => fetchFaq(true), 0)
          return
        }
      } catch {}
    }
  }

  try {
    const endpoint = `${import.meta.env.VITE_GAS_URL}?type=faq`
    const res = await fetch(endpoint, { method: 'GET' })
    const json = await res.json()
    if (json?.result === 'success') {
      faqs.value = enhance(json.data || [])
      localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: faqs.value }))
    } else {
      throw new Error(json?.message || '讀取失敗')
    }
  } catch (e) {
    error.value = e.message || '無法載入資料'
  } finally {
    loading.value = false
  }
}

function reload() {
  fetchFaq(true)
}

function toggle(i) {
  openIndex.value = openIndex.value === i ? -1 : i
}

async function copyLink(anchor) {
  const url = `${location.origin}${location.pathname}#${anchor}`
  try {
    await navigator.clipboard.writeText(url)
    alert('已複製此條文連結')
  } catch {
    prompt('無法自動複製，請手動複製：', url)
  }
}

onMounted(() => fetchFaq(false))
</script>

<style scoped>
.prose :where(p):not(:where([class~='not-prose'] *)) {
  margin: 0 0 0.75rem 0;
}
</style>

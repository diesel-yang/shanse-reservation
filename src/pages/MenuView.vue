<!-- src/pages/MenuView.vue -->
<template>
  <div class="max-w-3xl mx-auto px-4 py-6" :style="pagePadStyle">
    <!-- 頁首 -->
    <header class="mb-6">
      <h1 class="text-2xl font-bold mb-3">菜單 MENU</h1>

      <!-- 說明區 -->
      <div class="text-sm text-gray-700 leading-relaxed space-y-1 mb-3">
        <p>
          提供單人午間套餐
          <span class="font-semibold">$700 起（加收 10% 服務費）</span>。
        </p>
        <p>為維持用餐品質，每位客人低消為一份套餐。</p>
        <p class="text-xs text-gray-500">
          實際菜色依當日食材與季節變化調整，請以現場供應為主。
        </p>
      </div>
    </header>

    <!-- 主餐 -->
    <SectionCard
      v-if="mains.length"
      title="主餐 Main"
      :items="mains"
      :mode="'menu'"
    />

    <!-- 副餐 -->
    <SectionCard
      v-if="sides.length"
      title="副餐 Side"
      :items="sides"
      :mode="'menu'"
    />

    <!-- 飲品 -->
    <SectionCard
      v-if="drinks.length"
      title="飲品 Drinks"
      :items="drinks"
      :mode="'menu'"
    />

    <!-- 無資料 -->
    <p
      v-if="!mains.length && !sides.length && !drinks.length"
      class="text-gray-400 text-sm mt-6 text-center"
    >
      目前沒有菜單資料，請稍後再試。
    </p>

    <div aria-hidden="true" :style="bottomSpacerStyle"></div>
  </div>
</template>

<script setup>
import { inject, computed } from 'vue'
import SectionCard from '@/components/SectionCard.vue'

const pagePadStyle = { 'padding-bottom': 'var(--nav-height, 100px)' }
const bottomSpacerStyle = { height: 'calc(var(--nav-height, 100px) + 12px)' }

// App.vue 有 provide('menu', { main, drink, side, addon })
const providedMenu = inject('menu', {
  main: [],
  drink: [],
  side: [],
  addon: []
})

const mains = computed(() => providedMenu?.main || [])
const sides = computed(() => providedMenu?.side || [])
const drinks = computed(() => providedMenu?.drink || [])
</script>

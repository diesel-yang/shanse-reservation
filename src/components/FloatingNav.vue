<!-- src/components/FloatingNav.vue -->
<template>
  <transition name="fade-slide-up">
    <nav
      v-show="visible"
      class="fixed inset-x-0 bottom-5 z-50 flex items-end justify-center pointer-events-none"
      aria-label="Floating navigation"
      :style="{ '--nav-height': '92px' }"
    >
      <div class="flex items-center gap-4 pointer-events-auto">
        <!-- 左：圓形 Home/LOGO -->
        <RouterLink
          to="/"
          class="w-14 h-14 rounded-full bg-white shadow-[0_6px_22px_rgba(0,0,0,0.18)] flex items-center justify-center"
          aria-label="首頁"
        >
          <img src="/icon/shane-logo-orange.svg" alt="山色" class="w-9 h-9 object-contain" />
        </RouterLink>

        <!-- 中：橢圓形群組 -->
        <div
          class="min-w-[68vw] max-w-[84vw] md:min-w-[520px] md:max-w-[640px] bg-white/90 backdrop-blur-md rounded-[26px] px-5 py-3 shadow-[0_8px_28px_rgba(0,0,0,0.18)] flex items-center justify-around gap-3"
        >
          <RouterLink
            to="/about"
            class="flex items-center gap-2 text-gray-800 hover:opacity-80"
            aria-label="關於山色"
          >
            <UserIcon class="w-6 h-6" />
            <span class="hidden sm:inline text-sm font-medium">關於</span>
          </RouterLink>

          <!-- 外部連結 -->
          <a
            href="https://instantfood.store/collections/%E9%A4%90%E6%A1%8C%E4%BA%88%E7%B4%84"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-2 text-gray-800 hover:opacity-80"
            aria-label="餐桌予約（外部）"
          >
            <CalendarDaysIcon class="w-6 h-6" />
            <span class="hidden sm:inline text-sm font-medium">予約</span>
          </a>

          <RouterLink
            to="/menu"
            class="flex items-center gap-2 text-gray-800 hover:opacity-80"
            aria-label="預先點餐"
          >
            <BookOpenIcon class="w-6 h-6" />
            <span class="hidden sm:inline text-sm font-medium">點餐</span>
          </RouterLink>

          <RouterLink
            to="/notice"
            class="flex items-center gap-2 text-gray-800 hover:opacity-80"
            aria-label="訂位及用餐須知"
          >
            <QuestionMarkCircleIcon class="w-6 h-6" />
            <span class="hidden sm:inline text-sm font-medium">須知</span>
          </RouterLink>

          <!-- 🟧 修改：零售商品 + 購物車角標 -->
          <RouterLink
            to="/cart"
            class="relative flex items-center gap-2 text-gray-800 hover:opacity-80"
            aria-label="零售商品"
          >
            <ShoppingBagIcon class="w-6 h-6" />
            <span class="hidden sm:inline text-sm font-medium">購物車</span>
            <!-- 🟧 新增：小紅點 -->
            <span
              v-if="cartCount > 0"
              class="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] leading-none px-1.5 py-0.5 rounded-full"
            >
              {{ cartCount }}
            </span>
          </RouterLink>
        </div>

        <!-- 右：圓形 IG 私訊 -->
        <a
          :href="igDmUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="w-14 h-14 rounded-full bg-white shadow-[0_6px_22px_rgba(0,0,0,0.18)] flex items-center justify-center"
          aria-label="IG 私訊"
        >
          <img src="/icon/ig-dm.svg" alt="IG Message" class="w-8 h-8" />
        </a>
      </div>
    </nav>
  </transition>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { RouterLink } from 'vue-router'
import {
  UserIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  QuestionMarkCircleIcon,
  ShoppingBagIcon
} from '@heroicons/vue/24/outline'

import { useCart } from '@/composables/useCart' // 🟧 新增

const { count: cartCount } = useCart() // 🟧 新增

/** 行為參數（可依需求微調） */
const GRACE_MS = 5000
const IDLE_SHOW_MS = 10000
const MIN_DELTA = 8

const visible = ref(true)
const armed = ref(false)
const igDmUrl = 'https://ig.me/m/mmshanse'

let lastY = 0
let ticking = false
let graceTimer = null
let idleTimer = null

function clearGrace() {
  if (graceTimer) {
    clearTimeout(graceTimer)
    graceTimer = null
  }
}
function clearIdle() {
  if (idleTimer) {
    clearTimeout(idleTimer)
    idleTimer = null
  }
}
function scheduleIdleShow() {
  clearIdle()
  idleTimer = setTimeout(() => {
    visible.value = true
  }, IDLE_SHOW_MS)
}

/** 任何互動都重置 idle 計時 */
function onActivity() {
  if (!armed.value) return
  scheduleIdleShow()
}

/** 依捲動方向切換顯示 */
function onScroll() {
  if (!armed.value) return
  if (ticking) return
  ticking = true

  requestAnimationFrame(() => {
    const y = window.scrollY || 0
    const dy = y - lastY

    if (Math.abs(dy) >= MIN_DELTA) {
      if (dy > 0) {
        // 下滑 -> 隱藏
        if (visible.value) visible.value = false
      } else {
        // 上滑 -> 顯示
        if (!visible.value) visible.value = true
      }
      onActivity()
      lastY = y
    }

    ticking = false
  })
}

onMounted(() => {
  lastY = window.scrollY || 0

  // 緩衝：前 5 秒不隱藏
  graceTimer = setTimeout(() => {
    armed.value = true
  }, GRACE_MS)

  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('mousemove', onActivity, { passive: true })
  window.addEventListener('touchstart', onActivity, { passive: true })
  window.addEventListener('keydown', onActivity)

  scheduleIdleShow()
})

onBeforeUnmount(() => {
  clearGrace()
  clearIdle()
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('mousemove', onActivity)
  window.removeEventListener('touchstart', onActivity)
  window.removeEventListener('keydown', onActivity)
})
</script>

<style scoped>
.fade-slide-up-enter-active,
.fade-slide-up-leave-active {
  transition: all 0.22s ease;
}
.fade-slide-up-enter-from,
.fade-slide-up-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
<!-- src/App.vue -->

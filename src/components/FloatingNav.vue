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
          class="min-w-[68vw] max-w-[84vw] md:min-w-[520px] md:max-w-[640px]
                 bg-white/90 backdrop-blur-md rounded-[26px] px-5 py-3
                 shadow-[0_8px_28px_rgba(0,0,0,0.18)]
                 flex items-center justify-around gap-3"
        >
          <!-- 關於我們 -->
          <RouterLink
            to="/about"
            class="flex items-center gap-2 text-gray-800 hover:opacity-80"
            aria-label="關於我們"
          >
            <UserIcon class="w-6 h-6" />
            <span class="hidden sm:inline text-sm font-medium">關於</span>
          </RouterLink>

          <!-- 餐桌予約（外部連結） -->
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

          <!-- 預先點餐 -->
          <RouterLink
            to="/menu"
            class="flex items-center gap-2 text-gray-800 hover:opacity-80"
            aria-label="預先點餐"
          >
            <BookOpenIcon class="w-6 h-6" />
            <span class="hidden sm:inline text-sm font-medium">點餐</span>
          </RouterLink>

          <!-- 零售商店（🟧 高亮在 /retail） -->
          <RouterLink
            to="/retail"
            class="flex items-center gap-2 hover:opacity-80"
            :class="isRetailPage ? 'text-orange-600 font-bold' : 'text-gray-800'"
            aria-label="零售商店"
          >
            <ShoppingBagIcon class="w-6 h-6" />
            <span class="hidden sm:inline text-sm font-medium">零售</span>
          </RouterLink>

          <!-- 購物車 + 小紅點（🟧 高亮在 /cart） -->
          <RouterLink
            to="/cart"
            class="relative flex items-center gap-2 hover:opacity-80"
            :class="isCartPage ? 'text-orange-600 font-bold' : 'text-gray-800'"
            aria-label="購物車"
          >
            <ShoppingCartIcon class="w-6 h-6" />
            <span class="hidden sm:inline text-sm font-medium">購物車</span>
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
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import {
  UserIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  ShoppingBagIcon,
  ShoppingCartIcon
} from '@heroicons/vue/24/outline'

import { useCart } from '@/composables/useCart'

const { count: cartCount } = useCart()

// 🟧 高亮判斷
const route = useRoute()
const isCartPage = computed(() => route.path === '/cart')
const isRetailPage = computed(() => route.path === '/retail')

/** 行為參數 */
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

function onActivity() {
  if (!armed.value) return
  scheduleIdleShow()
}

function onScroll() {
  if (!armed.value) return
  if (ticking) return
  ticking = true

  requestAnimationFrame(() => {
    const y = window.scrollY || 0
    const dy = y - lastY

    if (Math.abs(dy) >= MIN_DELTA) {
      if (dy > 0) {
        if (visible.value) visible.value = false
      } else {
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

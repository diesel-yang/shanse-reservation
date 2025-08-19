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

          <RouterLink
            to="/retail"
            class="flex items-center gap-2 text-gray-800 hover:opacity-80"
            aria-label="零售商品"
          >
            <ShoppingBagIcon class="w-6 h-6" />
            <span class="hidden sm:inline text-sm font-medium">零售</span>
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

const VISIBLE_ON_MOUNT_MS = 0
const IDLE_HIDE_MS = 20000
const visible = ref(false)
let hideTimer = null
let ticking = false

const igDmUrl = 'https://ig.me/m/mmshanse'

function showNav() {
  visible.value = true
  resetIdleTimer()
}

function clearTimer() {
  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = null
  }
}

function resetIdleTimer() {
  clearTimer()
  hideTimer = setTimeout(() => {
    visible.value = false
  }, IDLE_HIDE_MS)
}

function onActivity() {
  if (!visible.value) visible.value = true
  resetIdleTimer()
}

function onScroll() {
  if (!ticking) {
    ticking = true
    requestAnimationFrame(() => {
      showNav()
      ticking = false
    })
  }
}

onMounted(() => {
  if (VISIBLE_ON_MOUNT_MS > 0) {
    visible.value = true
    setTimeout(() => (visible.value = false), VISIBLE_ON_MOUNT_MS)
  }

  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('mousemove', onActivity, { passive: true })
  window.addEventListener('touchstart', onActivity, { passive: true })
  window.addEventListener('keydown', onActivity)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('mousemove', onActivity)
  window.removeEventListener('touchstart', onActivity)
  window.removeEventListener('keydown', onActivity)
  clearTimer()
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

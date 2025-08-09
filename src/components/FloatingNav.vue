<!-- src/components/FloatingNav.vue -->
<template>
  <transition name="fade-slide-up">
    <nav
      v-show="visible"
      class="fixed inset-x-0 bottom-5 z-50 flex items-end justify-center pointer-events-none"
      aria-label="Floating navigation"
    >
      <div class="flex items-center gap-4 pointer-events-auto">
        <!-- 左：圓形 Home/LOGO -->
        <RouterLink
          to="/"
          class="w-14 h-14 rounded-full bg-white shadow-[0_6px_22px_rgba(0,0,0,0.18)] flex items-center justify-center"
          aria-label="首頁"
        >
          <!-- 換成你的 LOGO（建議用實心版 or 圓形裁切 PNG/SVG） -->
          <img src="/hero-transparent.png" alt="山色" class="w-9 h-9 object-contain" />
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

          <!-- 餐桌予約：內部或外部擇一 -->
          <!-- 內部頁面 -->
          <!-- <RouterLink to="/reserve" class="flex items-center gap-2 text-gray-800 hover:opacity-80" aria-label="餐桌予約">
            <CalendarDaysIcon class="w-6 h-6" />
            <span class="hidden sm:inline text-sm font-medium">予約</span>
          </RouterLink> -->

          <!-- 外部連結（你現在用的商店） -->
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
            to="/faq"
            class="flex items-center gap-2 text-gray-800 hover:opacity-80"
            aria-label="常見問題"
          >
            <QuestionMarkCircleIcon class="w-6 h-6" />
            <span class="hidden sm:inline text-sm font-medium">FAQ</span>
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
          <!-- 建議放你的 IG DM SVG：/icon/instagram-message.svg -->
          <img src="/icon/ig-dm.svg" alt="IG Message" class="w-8 h-8" />
        </a>
      </div>
    </nav>
  </transition>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import {
  HomeIcon,
  UserIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  QuestionMarkCircleIcon
} from '@heroicons/vue/24/outline'

const VISIBLE_ON_MOUNT_MS = 0 // 初次載入是否要先顯示，可改 1500
const IDLE_HIDE_MS = 20000 // 靜止多久自動隱藏（20 秒）
const visible = ref(false)
let hideTimer = null
let ticking = false

// 你的 IG 私訊連結：把 USERNAME 改為你的帳號
const igDmUrl = 'https://ig.me/m/mmshanse'

function showNav() {
  visible.value = true
  resetIdleTimer()
}

function hideNav() {
  visible.value = false
  clearTimer()
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
  // 任何互動都視為活躍：滾動/滑鼠移動/觸控
  if (!visible.value) visible.value = true
  resetIdleTimer()
}

function onScroll() {
  // 使用 rAF 節流，避免過度觸發
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

  // 首次互動前保持隱藏；若想一載入就顯示可改成 showNav()
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

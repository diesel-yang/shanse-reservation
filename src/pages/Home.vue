<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 長按偵測
const pressTimer = ref(null)
const pressing = ref(false)
const LONG_PRESS_MS = 1800 // 1.8 秒

function startPress() {
  pressing.value = true

  pressTimer.value = setTimeout(() => {
    if (pressing.value) {
      // 振動提示（若支援）
      if (navigator.vibrate) navigator.vibrate(70)

      router.push('/admin/login')
    }
  }, LONG_PRESS_MS)
}

function cancelPress() {
  pressing.value = false
  if (pressTimer.value) clearTimeout(pressTimer.value)
}
</script>

<template>
  <div
    class="min-h-[100dvh] bg-gradient-to-b from-[#e5712f] to-[#f39532] flex flex-col items-center text-black"
  >
    <!-- 跑馬燈 -->
    <div class="relative w-screen overflow-hidden whitespace-nowrap">
      <div class="bg-black py-1">
        <div
          class="animate-marquee text-[60%] text-white font-normal inline-block px-4 leading-tight"
        >
          ขอให้โชคดียิ้มให้คุณและนำพรทุกอย่างมาให้คุณ
        </div>
      </div>
      <div
        class="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-b from-black/40 to-transparent pointer-events-none"
      ></div>
    </div>

    <!-- LOGO 區（長按入口） -->
    <div class="flex flex-col items-center px-6 mt-6 select-none">
      <img
        src="/hero-transparent.png"
        alt="山色主視覺"
        class="w-[140px] h-auto mb-4 object-contain bg-transparent opacity-100 active:opacity-80 transition"
        @mousedown="startPress"
        @mouseup="cancelPress"
        @mouseleave="cancelPress"
        @touchstart.prevent="startPress"
        @touchend.prevent="cancelPress"
        @touchmove.prevent="cancelPress"
      />

      <p class="text-xl text-black font-normal mb-1">ขอบคุณค่ะ</p>
      <div class="h-[1.5em]"></div>
      <p class="text-lg mb-8 text-black font-semibold custom-wide-jp">完全予約制</p>
    </div>

    <!-- 其他按鈕 -->
    <div class="flex-1 flex items-start justify-center w-full px-6">
      <div
        class="w-full max-w-sm space-y-6 mb-16 sm:mb-24"
        :style="{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }"
      >
        <router-link to="/about" class="block">
          <button class="btn-main">關於我們</button>
        </router-link>

        <router-link to="/menu-view" class="block">
          <button class="btn-main">菜單 MENU</button>
        </router-link>

        <a
          href="https://instantfood.store/collections/%E9%A4%90%E6%A1%8C%E4%BA%88%E7%B4%84"
          target="_blank"
          rel="noopener noreferrer"
          class="block w-full"
        >
          <button class="btn-main">訂位</button>
        </a>

        <router-link to="/menu" class="block">
          <button class="btn-main">點餐</button>
        </router-link>

        <router-link to="/retail" class="block">
          <button class="btn-main">零售商品</button>
        </router-link>

        <router-link to="/notice" class="block">
          <button class="btn-main">訂位及用餐須知</button>
        </router-link>

        <router-link to="/return-policy" class="block">
          <button class="btn-main">訂退換貨政策</button>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.btn-main {
  width: 100%;
  background: #ed8a3f;
  color: black;
  border-radius: 9999px;
  border: 1px solid black;
  box-shadow: 6px 6px 0 rgba(0, 0, 0, 1);
  padding: 1rem 1.5rem;
  font-size: 1.125rem;
  font-weight: 400;
  letter-spacing: 0.2em;
}

@keyframes marquee {
  0% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(-100%);
  }
}
.animate-marquee {
  animation: marquee 20s linear infinite;
}
.custom-wide-jp {
  letter-spacing: 0.8em;
}
</style>

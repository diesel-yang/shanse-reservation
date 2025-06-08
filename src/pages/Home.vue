<template>
  <div class="min-h-screen bg-[#f2701d] font-[DM Sans] text-base leading-relaxed">
    <!-- 黑底跑馬燈 -->
    <div class="w-full bg-black text-white text-sm whitespace-nowrap overflow-hidden">
      <div
        class="animate-marquee py-1"
        style="animation-duration: 18s;"
      >
        ขอให้โชคดียิ้มให้คุณและนำพรทุกอย่างมาให้คุณ
      </div>
    </div>

    <!-- 主內容區塊 -->
    <div class="flex flex-col items-center justify-center px-4 pt-10 pb-6 space-y-6">
      <img
        src="/shanse-logo.png"
        alt="山色 logo"
        class="h-[7vh] object-contain"
      />

      <router-link
        to="/about"
        class="w-full max-w-xs rounded-2xl border border-black bg-[#f2701d] py-3 text-center text-lg text-black shadow-md"
      >
        關於我們
      </router-link>

      <router-link
        to="/reserve"
        class="w-full max-w-xs rounded-2xl border border-black bg-[#f2701d] py-3 text-center text-lg text-black shadow-md"
      >
        餐桌予約
      </router-link>

      <router-link
        to="/menu"
        class="w-full max-w-xs rounded-2xl border border-black bg-[#f2701d] py-3 text-center text-lg text-black shadow-md"
      >
        預先點餐
      </router-link>

      <router-link
        to="/faq"
        class="w-full max-w-xs rounded-2xl border border-black bg-[#f2701d] py-3 text-center text-lg text-black shadow-md"
      >
        訂位問題
      </router-link>

      <div class="text-black pt-8">完全予約制</div>
    </div>
  </div>
</template>

<style scoped>
@keyframes marquee {
  0% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(-100%);
  }
}

.animate-marquee {
  display: inline-block;
  white-space: nowrap;
  animation: marquee linear infinite;
}
</style>

<template>
  <!-- 黑底跑馬燈 -->
  <div class="w-full bg-black text-white text-[70%] py-[2px] text-center whitespace-nowrap animate-marquee z-50">
    ขอให้โชคดียิ้มให้คุณและนำพรทุกอย่างมาให้คุณ
  </div>

  <!-- 主畫面 -->
  <div class="min-h-screen bg-[#f47c20] flex flex-col items-center justify-center text-black font-normal">
    <img
      src="/shanse-logo.png"
      alt="logo"
      class="w-1/3 sm:w-1/4 md:w-1/5 lg:w-1/6 xl:w-1/8 mb-8"
    />

    <div class="flex flex-col space-y-6 w-4/5 sm:w-2/3 md:w-1/2">
      <router-link
        to="/about"
        class="bg-orange-500 text-black py-3 rounded-full text-center border border-black shadow"
      >
        關於我們
      </router-link>
      <router-link
        to="/reserve"
        class="bg-orange-500 text-black py-3 rounded-full text-center border border-black shadow"
      >
        餐桌予約
      </router-link>
      <router-link
        to="/menu"
        class="bg-orange-500 text-black py-3 rounded-full text-center border border-black shadow"
      >
        預先點餐
      </router-link>
      <router-link
        to="/faq"
        class="bg-orange-500 text-black py-3 rounded-full text-center border border-black shadow"
      >
        訂位問題
      </router-link>
    </div>

    <p class="mt-10 text-black">完全予約制</p>
  </div>
</template>

<script setup>
// 無需邏輯
</script>

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
  animation: marquee 15s linear infinite;
}
</style>

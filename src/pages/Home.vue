<template>
  <div
    class="min-h-screen bg-gradient-to-b from-[#e5712f] to-[#f39532] flex flex-col items-center px-6 text-black"
  >
    <!-- 黑底跑馬燈 -->
    <div class="w-screen bg-black overflow-hidden whitespace-nowrap py-1">
      <div
        class="animate-marquee text-[60%] text-white font-normal inline-block px-4 leading-tight"
      >
        ขอให้โชคดียิ้มให้คุณและนำพรทุกอย่างมาให้คุณ
      </div>
    </div>

    <!-- LOGO -->
    <img
      src="/hero-transparent.png"
      alt="山色主視覺"
      class="w-[140px] h-auto mt-6 mb-4 object-contain bg-transparent"
    />

    <!-- 中間文字 -->
    <p class="text-xl text-black font-normal mb-1">ขอบคุณค่ะ</p>
    <div class="h-[1.5em]"></div>
    <p class="text-lg mb-8 text-black font-semibold custom-wide-jp">完全予約制</p>

    <!-- 按鈕群 -->
    <div class="w-full max-w-sm space-y-6">
      <router-link to="/about" class="block">
        <button
          class="w-full bg-[#ed8a3f] text-black rounded-full border border-black shadow-[6px_6px_0_rgba(0,0,0,1)] py-4 px-6 text-lg font-normal"
        >
          <span class="block text-center tracking-[0.2em]">關於我們</span>
        </button>
      </router-link>
      <a
        href="https://instantfood.store/collections/%E9%A4%90%E6%A1%8C%E4%BA%88%E7%B4%84"
        target="_blank"
        rel="noopener noreferrer"
        class="block w-full"
      >
        <button
          class="w-full bg-[#ed8a3f] text-black rounded-full border border-black shadow-[6px_6px_0_rgba(0,0,0,1)] py-4 px-6 text-lg font-normal"
        >
          餐桌予約
        </button>
      </a>

      <router-link to="/menu" class="block">
        <button
          class="w-full bg-[#ed8a3f] text-black rounded-full border border-black shadow-[6px_6px_0_rgba(0,0,0,1)] py-4 px-6 text-lg font-normal"
        >
          <span class="block text-center tracking-[0.2em]">預先點餐</span>
        </button>
      </router-link>

      <!-- 🆕 新增零售商品按鈕 -->
      <router-link to="/retail" class="block">
        <button
          class="w-full bg-[#ed8a3f] text-black rounded-full border border-black shadow-[6px_6px_0_rgba(0,0,0,1)] py-4 px-6 text-lg font-normal"
        >
          <span class="block text-center tracking-[0.2em]">零售商品</span>
        </button>
      </router-link>

      <router-link to="/notice" class="block">
        <button
          class="w-full bg-[#ed8a3f] text-black rounded-full border border-black shadow-[6px_6px_0_rgba(0,0,0,1)] py-4 px-6 text-lg font-normal"
        >
          <span class="block text-center tracking-[0.2em]">訂位及用餐須知</span>
        </button>
      </router-link>
    
      <router-link to="/return-policy" class="block">
        <button
          class="w-full bg-[#ed8a3f] text-black rounded-full border border-black shadow-[6px_6px_0_rgba(0,0,0,1)] py-4 px-6 text-lg font-normal"
        >
          <span class="block text-center tracking-[0.2em]">訂退換貨政策</span>
        </button>
      </router-link>
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
  animation: marquee 20s linear infinite;
}

.custom-wide-jp {
  letter-spacing: 0.8em;
}
</style>

<script setup></script>

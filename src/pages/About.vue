<template>
  <div
    class="min-h-screen bg-gradient-to-b from-[#dc5f20] to-[#e26a1e] flex flex-col items-center px-6 py-10 text-black">
    <!-- LOGO -->
    <img
      src="/hero-transparent.png"
      alt="山色主視覺"
      class="w-[70px] h-auto mb-10 object-contain bg-transparent" />

    <!-- 影片播放 -->
    <video
      src="/shanse-about-us.mp4"
      controls
      class="w-full max-w-sm aspect-video rounded-lg shadow mb-6"></video>

    <!-- 關於我們說明 -->
    <p class="text-lg leading-relaxed max-w-xl text-center mb-10 font-semibold tracking-wide">
      山色是一間以完全預約制方式運作的小餐館，我們以選用在地與東方風味為基礎，傳遞季節與心意。
      <br /><br />
      謝謝您每一次的到來。<br />
      ขอขอบคุณค่ะ 🌿
    </p>

    <!-- 分散對齊按鈕 -->
    <div class="w-full max-w-sm space-y-5">
      <router-link to="/" class="block">
        <div
          class="flex justify-between items-center w-full bg-white/80 backdrop-blur-sm text-black px-6 py-4 rounded-lg border border-black shadow hover:scale-[1.02] transition font-medium">
          <span>回首頁</span>
          <span>→</span>
        </div>
      </router-link>
      <router-link to="/menu" class="block">
        <div
          class="flex justify-between items-center w-full bg-white/80 backdrop-blur-sm text-black px-6 py-4 rounded-lg border border-black shadow hover:scale-[1.02] transition font-medium">
          <span>預先點餐</span>
          <span>→</span>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup></script>

<template>
  <div class="relative min-h-screen w-full overflow-hidden text-white">
    <!-- 背景影片 -->
    <video autoplay muted loop playsinline class="absolute inset-0 w-full h-full object-cover z-0">
      <source src="/shanse.mp4" type="video/mp4" />
      您的瀏覽器不支援影片播放
    </video>

    <!-- IG 聯絡按鈕區塊 -->
    <div class="absolute bottom-28 w-full flex justify-center z-10">
      <a
        href="https://www.instagram.com/mmshanse"
        target="_blank"
        rel="noopener"
        class="flex items-center px-5 py-3 rounded-full bg-white/40 backdrop-blur text-white text-lg font-semibold shadow-md hover:scale-105 transition"
      >
        <img src="/icon/ins-q.svg" alt="IG" class="w-20 h-20 mr-2" />
        與我們聊聊
      </a>
    </div>

    <!-- LOGO（可選）-->
    <div class="absolute top-6 w-full flex justify-center z-10">
      <img
        src="/hero-transparent.png"
        alt="山色主視覺"
        class="w-[70px] h-auto object-contain bg-transparent"
      />
    </div>
  </div>
</template>

<script setup>
// 無需 script，除非你要動態處理 IG 連結
</script>

<style>
body {
  font-family: 'DM Sans', sans-serif;
}
</style>

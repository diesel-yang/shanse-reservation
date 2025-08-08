<template>
  <div class="relative w-full h-screen overflow-hidden">
    <!-- 背景影片 -->
    <video autoplay muted loop playsinline class="absolute inset-0 w-full h-full object-cover z-0">
      <source src="/shanse.mp4" type="video/mp4" />
      您的瀏覽器不支援影片播放
    </video>
    <!-- 半透明遮罩可選（可移除） -->
    <div class="absolute inset-0 bg-black/30 z-10"></div>

    <!-- IG 私訊區塊 -->
    <div class="relative z-20 flex flex-col items-center justify-center h-full text-white px-6">
      <a
        href="https://instagram.com/_u/mmshanse/"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-3 bg-white/20 hover:bg-white/30 px-6 py-3 rounded-full backdrop-blur-md transition"
      >
        <img src="/icon/ins-q.svg" alt="IG訊息" class="w-6 h-6" />
        <span class="text-lg font-medium tracking-wide">與我們聊聊</span>
      </a>
    </div>
  </div>
</template>

<script setup>
// 無需 JS 處理
</script>

<style>
body {
  font-family: 'DM Sans', sans-serif;
}
</style>

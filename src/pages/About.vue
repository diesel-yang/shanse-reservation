<template>
  <div class="relative min-h-screen">
    <!-- 背景影片 -->
    <video autoplay muted loop playsinline class="absolute inset-0 w-full h-full object-cover z-0">
      <source src="/shanse.mp4" type="video/mp4" />
    </video>

    <!-- IG 私訊按鈕 -->
    <a
      href="https://ig.me/m/mmshanse"
      target="_blank"
      class="absolute bottom-28 left-1/2 transform -translate-x-1/2 z-10 flex items-center justify-center px-6 py-3 rounded-full bg-white/30 backdrop-blur-sm text-white font-medium shadow-lg"
    >
      <span class="text-lg"> 聯絡我們 </span>
    </a>

    <!-- 放大 ICON：絕對定位在按鈕左側 -->
    <img
      src="/icon/ins-q.svg"
      alt="IG"
      class="absolute bottom-[122px] left-1/2 transform -translate-x-[80px] w-18 h-18 z-20"
    />
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

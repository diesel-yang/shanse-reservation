<template>
  <div class="relative min-h-screen w-full text-white font-sans">
      <!-- LOGO -->
    <img
      src="/hero-transparent.png"
      alt="山色主視覺"
      class="w-[70px] h-auto mb-10 object-contain bg-transparent"
    />
    <!-- 背景影片 -->
    <video autoplay muted loop playsinline class="absolute inset-0 w-full h-full object-cover z-0">
      <source src="/shanse-about-us.mp4" type="video/mp4" />
      您的瀏覽器不支援影片播放
    </video>

    <!-- 疊加圖片層 -->
    <div
      class="absolute inset-0 z-10 bg-no-repeat bg-cover bg-center opacity-30"
      style="background-image: url('/山色-about-us-2.WEBP')"
    ></div>

    <!-- 文字區塊 -->
    <div class="relative z-20 flex flex-col items-center justify-center h-screen text-center px-6">
      <h1 class="text-3xl tracking-widest mb-4">山色 Shān Sè</h1>
      <p class="max-w-xl text-base leading-relaxed text-white/80">
        山色，是一段旅程的中繼，<br />
        我們以餐桌連接季節、風土與情感，<br />
        邀請你靜下來，與時間一起品嚐生活。
      </p>
    </div>
  </div>
</template>

<script setup>
// 無需額外 JS
</script>

<style>
body {
  font-family: 'DM Sans', sans-serif;
}
</style>
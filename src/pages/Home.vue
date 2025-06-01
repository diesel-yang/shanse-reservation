<template>
  <section class="min-h-screen flex flex-col justify-center items-center bg-orange-100 px-4 text-center">
    <div class="max-w-3xl">
      <img
        src="/hero.jpg"
        alt="山色主視覺"
        class="w-full max-h-[400px] object-cover rounded-lg shadow-md mb-6"
      />
      <h1 class="text-4xl md:text-5xl font-bold text-orange-700 mb-4">山色</h1>
      <p class="text-lg md:text-xl text-gray-700 mb-6">
        ขอให้โชคดียิ้มให้คุณและนำพรทุกอย่างมาให้คุณ
      </p>
      <router-link
        to="/reserve"
        class="inline-block bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded transition"
      >
        桌餐予約
      </router-link>
    </div>
  </section>
</template>

<script setup>
// 無需邏輯，純展示頁
</script>
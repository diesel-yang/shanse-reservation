<template>
  <div class="max-w-3xl mx-auto px-4 py-8 text-gray-800 leading-relaxed">
    <h1 class="text-2xl font-bold mb-6">退換貨與退款政策</h1>

    <section class="mb-6">
      <h2 class="text-lg font-semibold mb-2">一、法規依據</h2>
      <p>
        本店遵循《消費者保護法》及《通訊交易解除權合理例外情事適用準則》。依規定，消費者享有
        <strong>7 日鑑賞期</strong>（猶豫期）之權益。但食品屬於
        <strong>合理例外情事</strong>，除非商品本身有瑕疵或出貨錯誤，否則無法適用無條件退換貨。
      </p>
    </section>

    <section class="mb-6">
      <h2 class="text-lg font-semibold mb-2">二、可受理退換貨情況</h2>
      <ul class="list-disc pl-6 space-y-2">
        <li>收到之商品與訂購內容不符（品項或數量錯誤）。</li>
        <li>商品本身瑕疵（如嚴重破損、封裝不良、異常變質）。</li>
        <li>配送過程造成嚴重損壞，導致無法食用。</li>
      </ul>
    </section>

    <section class="mb-6">
      <h2 class="text-lg font-semibold mb-2">三、無法受理退換貨情況</h2>
      <ul class="list-disc pl-6 space-y-2">
        <li>因食品屬易於腐敗、保存期限短，除非有瑕疵，否則不適用 7 日鑑賞期。</li>
        <li>已拆封、食用過、保存不當導致變質者。</li>
        <li>因個人口味或偏好不合而要求退貨者。</li>
      </ul>
    </section>

    <section class="mb-6">
      <h2 class="text-lg font-semibold mb-2">四、退換貨申請流程</h2>
      <ol class="list-decimal pl-6 space-y-2">
        <li>請於收到商品後 <strong>24 小時內</strong> 拍照留存（含外箱、內裝與瑕疵處），並透過
          <a :href="igDmUrl" target="_blank" class="text-blue-600 underline">Instagram 私訊</a>
          與我們聯繫。
        </li>
        <li>客服將核對情況，並於 1–3 個工作日內回覆是否受理。</li>
        <li>若需退回，請保持商品完整冷凍（或冷藏），並依客服指示寄回或等待物流收件。</li>
        <li>收到並檢驗無誤後，將於 <strong>7–10 個工作日</strong> 內辦理退款或換貨。</li>
      </ol>
    </section>

    <section class="mb-6">
      <h2 class="text-lg font-semibold mb-2">五、退款方式</h2>
      <p>
        退款將依原付款方式退回（行動支付或轉帳）。實際入帳時間依各發卡銀行或金流單位規定為準。
      </p>
    </section>

    <section class="mb-6">
      <h2 class="text-lg font-semibold mb-2">六、聯絡資訊</h2>
      <ul class="list-disc pl-6 space-y-1">
        <li>IG 私訊：<a :href="igDmUrl" target="_blank" class="underline">mmshanse</a></li>
      </ul>
    </section>

    <div class="mt-10">
      <RouterLink to="/cart" class="inline-block bg-black text-white px-5 py-3 rounded-full">
        回到購物車
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
const igDmUrl = 'https://ig.me/m/mmshanse'
</script>

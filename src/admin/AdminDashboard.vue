<template>
  <div class="page">
    <h2>營收儀表板</h2>

    <div class="card">
      <p>今日收入：<b>{{ data.todayIncome }}</b></p>
      <p>Line Pay：{{ data.todayLinePay }}</p>
      <p>現金/轉帳：{{ data.todayCash }}</p>
      <p>退款：<span class="refund">{{ data.refundTotal }}</span></p>
      <p>淨收入：<b>{{ data.net }}</b></p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useAdminAuth } from "@/composables/useAdminAuth";

export default {
  setup() {
    const data = ref({});
    const { idToken } = useAdminAuth();

    async function load() {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE}/admin/dashboard`,
        {
          headers: { Authorization: `Bearer ${idToken.value}` },
        }
      );
      const json = await res.json();
      data.value = json.data;
    }

    onMounted(load);
    return { data };
  },
};
</script>

<style scoped>
.card {
  border: 1px solid #ccc;
  padding: 16px;
  border-radius: 12px;
}
.refund {
  color: #d9534f;
}
</style>

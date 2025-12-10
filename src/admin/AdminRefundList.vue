<template>
  <div class="page">
    <h2>Line Pay 退款管理</h2>

    <!-- 搜尋列 -->
    <input
      v-model="search"
      placeholder="搜尋訂單編號 / 姓名 / 電話"
      class="search"
    />

    <!-- 訂單列表 -->
    <div v-for="o in filtered" :key="o.orderId" class="order-card">
      <div class="left">
        <p><b>訂單編號：</b>{{ o.orderId }}</p>
        <p><b>姓名：</b>{{ o.name }}</p>
        <p><b>電話：</b>{{ o.phone }}</p>
        <p><b>金額：</b>{{ o.total }}</p>
        <p><b>付款方式：</b>{{ o.paymentMethod }}</p>
        <p><b>狀態：</b>
          <span v-if="o.refunded">🟢 已退款</span>
          <span v-else>🔵 未退款</span>
        </p>
      </div>

      <div class="right">
        <button
          :disabled="o.refunded"
          @click="openRefund(o)"
        >
          {{ o.refunded ? '已退款' : '退款' }}
        </button>
      </div>
    </div>

    <!-- Refund Modal -->
    <div v-if="showRefundModal" class="modal">
      <div class="modal-content">
        <button class="close" @click="closeModal">✕</button>

        <AdminRefund :order="currentOrder" />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import AdminRefund from "./AdminRefund.vue";

export default {
  components: { AdminRefund },
  setup() {
    const orders = ref([]);
    const search = ref("");
    const showRefundModal = ref(false);
    const currentOrder = ref(null);

    async function loadOrders() {
      const url = `${import.meta.env.VITE_GAS_URL}?type=retailOrders`;
      const res = await fetch(url);
      const json = await res.json();

      // 整理資料：只取 linepay 訂單
      orders.value = json.data
        .filter((o) => o.paymentMethod === "linepay")
        .map((o) => ({
          ...o,
          refunded: !!o.refundTransactionId,
        }));
    }

    function openRefund(order) {
      currentOrder.value = order;
      showRefundModal.value = true;
    }

    function closeModal() {
      showRefundModal.value = false;
    }

    const filtered = computed(() => {
      if (!search.value) return orders.value;

      const s = search.value.toLowerCase();
      return orders.value.filter(
        (o) =>
          o.orderId.toLowerCase().includes(s) ||
          o.name.toLowerCase().includes(s) ||
          o.phone.toLowerCase().includes(s)
      );
    });

    onMounted(() => {
      loadOrders();
    });

    return {
      orders,
      search,
      filtered,
      showRefundModal,
      currentOrder,
      openRefund,
      closeModal,
    };
  },
};
</script>

<style scoped>
.page {
  padding: 16px;
}

.search {
  width: 100%;
  padding: 8px;
  margin-bottom: 16px;
}

.order-card {
  border: 1px solid #ccc;
  padding: 12px;
  border-radius: 12px;
  margin-bottom: 12px;

  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-card button {
  padding: 6px 14px;
  border-radius: 6px;
}

.order-card button:disabled {
  background: #ddd;
  color: #777;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.55);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 12px;
  width: 90%;
  max-width: 450px;
  position: relative;
}

.close {
  position: absolute;
  right: 8px;
  top: 8px;
}
</style>

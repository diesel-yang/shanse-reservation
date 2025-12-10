<template>
  <div class="refund-box">
    <h3>退款操作</h3>

    <p>訂單編號：{{ order.orderId }}</p>
    <p>交易編號：{{ order.transactionId }}</p>
    <p>總金額：{{ order.total }}</p>

    <p v-if="order.refunded === true" class="refunded-msg">
      ⚠ 此訂單已退款，無法再次退款
    </p>

    <div v-else>
      <!-- 全額退款 -->
      <button @click="refundFull" class="full-btn">全額退款</button>

      <!-- 部分退款 -->
      <div class="partial-box">
        <input
          type="number"
          v-model.number="amount"
          placeholder="部分退款金額"
        />
        <button @click="refundPartial">部分退款</button>
      </div>
    </div>

    <p v-if="msg" class="msg">{{ msg }}</p>
  </div>
</template>

<script>
import { ref } from "vue";
import { useAdminAuth } from "@/composables/useAdminAuth";

export default {
  props: ["order"],

  setup(props) {
    const msg = ref("");
    const amount = ref("");
    const { idToken } = useAdminAuth();

    async function doRefund(payload) {
      msg.value = "處理中…";

      const res = await fetch(`${import.meta.env.VITE_API_BASE}/linepay/refund`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken.value}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (json.success) {
        msg.value = "退款成功！";
      } else {
        msg.value = "退款失敗：" + (json.error || json.message);
      }
    }

    function refundFull() {
      doRefund({
        transactionId: props.order.transactionId,
        orderId: props.order.orderId,
      });
    }

    function refundPartial() {
      if (!amount.value) {
        msg.value = "請輸入退款金額";
        return;
      }
      if (amount.value <= 0 || amount.value > props.order.total) {
        msg.value = "金額不正確";
        return;
      }
      doRefund({
        transactionId: props.order.transactionId,
        refundAmount: amount.value,
        orderId: props.order.orderId,
      });
    }

    return {
      msg,
      amount,
      refundFull,
      refundPartial,
    };
  },
};
</script>

<style scoped>
.refund-box {
  padding: 16px;
  border: 1px solid #ccc;
  border-radius: 12px;
}

.full-btn {
  background: #d9534f;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
}

.partial-box {
  margin-top: 12px;
  display: flex;
  gap: 8px;
}

.refunded-msg {
  color: #d9534f;
  font-weight: bold;
}

.msg {
  margin-top: 12px;
}
</style>

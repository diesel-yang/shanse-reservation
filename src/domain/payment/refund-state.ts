/**
 * refund-state.ts
 * -------------------------------------------------------------
 * FINAL – Refund UI / Business Read Model
 *
 * 用途：
 * - 計算「退款顯示狀態」（給 Admin UI）
 * - 不寫 DB、不影響 booking / payment 狀態
 *
 * 核心原則：
 * - Cancel（取消）與 Refund（退款）完全正交
 * - 退款狀態只由「金額事實」推導
 */

/**
 * Refund State 定義
 *
 * - not_applicable : 尚未付款（沒有可退款概念）
 * - pending_refund : 已付款，但尚未退款
 * - partial_refund : 已部分退款
 * - full_refund    : 已全額退款
 * - invalid        : 資料異常（防線）
 */
export type RefundState =
  | 'not_applicable'
  | 'pending_refund'
  | 'partial_refund'
  | 'full_refund'
  | 'invalid';

export interface RefundStateInput {
  /**
   * 訂單狀態（僅作為背景資訊，不影響判斷）
   * pending | confirmed | cancelled | archived
   */
  bookingStatus: string;

  /**
   * 累計已付款金額（所有 paid 紀錄加總）
   */
  paidTotal: number;

  /**
   * 累計已退款金額（所有 refunded 紀錄加總）
   */
  refundedTotal: number;
}

/**
 * -------------------------------------------------------------
 * 計算退款狀態（純函式）
 * -------------------------------------------------------------
 *
 * 規則說明：
 * 1. 是否能退款，與 booking 是否 cancelled 無關
 * 2. 狀態只由「已付 / 已退金額」決定
 */
export function computeRefundState(
  input: RefundStateInput
): RefundState {
  const { paidTotal, refundedTotal } = input;

  // 尚未付款 → 不適用退款
  if (paidTotal === 0) {
    return 'not_applicable';
  }

  // 尚未退款
  if (refundedTotal === 0) {
    return 'pending_refund';
  }

  // 部分退款
  if (refundedTotal > 0 && refundedTotal < paidTotal) {
    return 'partial_refund';
  }

  // 全額退款
  if (refundedTotal === paidTotal) {
    return 'full_refund';
  }

  // 超額退款 / 異常資料
  return 'invalid';
}

/**
 * -------------------------------------------------------------
 * 可選：退款狀態對應 UI 顯示（Badge）
 * -------------------------------------------------------------
 * （給 AdminPaymentPanel 使用）
 */
export function refundStateLabel(state: RefundState): string {
  switch (state) {
    case 'not_applicable':
      return '未付款';
    case 'pending_refund':
      return '待退款';
    case 'partial_refund':
      return '部分退款';
    case 'full_refund':
      return '已全額退款';
    case 'invalid':
    default:
      return '異常';
  }
}

export function refundStateColor(state: RefundState): string {
  switch (state) {
    case 'pending_refund':
      return 'bg-yellow-100 text-yellow-800';
    case 'partial_refund':
      return 'bg-blue-100 text-blue-800';
    case 'full_refund':
      return 'bg-green-100 text-green-800';
    case 'invalid':
      return 'bg-red-100 text-red-800';
    case 'not_applicable':
    default:
      return 'bg-gray-100 text-gray-500';
  }
}

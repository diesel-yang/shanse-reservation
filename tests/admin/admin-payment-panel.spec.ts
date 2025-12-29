import { test, expect } from '@playwright/test'

/**
 * AdminPaymentPanel E2E
 * -------------------------------------------------------------
 * 這支測試會做三件事：
 *
 * 1️⃣ 測試前用「後端 API」建立真實資料
 *    - 建立 booking
 *    - 建立 payment（現金）
 *
 * 2️⃣ 進入 /admin/bookings
 *    - 確保畫面一定 render 出 AdminPaymentPanel
 *
 * 3️⃣ 驗證互動
 *    - hover 展開
 *    - click 固定
 *    - snapshot（UI 回歸）
 */

test.describe('AdminPaymentPanel', () => {
  let bookingId: string
  let paymentId: string

  /**
   * -----------------------------------------------------------
   * ✅ 測試前準備資料（關鍵！）
   * -----------------------------------------------------------
   * 沒有這段，畫面上「不會有 refund-badge」
   */
  test.beforeEach(async ({ request }) => {
    // 1️⃣ 建立 booking
    const bookingRes = await request.post(
      'http://localhost:8080/api/booking',
      {
        data: {
          customer: 'playwright-admin',
          people: 2,
          note: 'AdminPaymentPanel E2E'
        }
      }
    )

    expect(bookingRes.ok()).toBeTruthy()
    const bookingJson = await bookingRes.json()
    bookingId = bookingJson.bookingId

    // 2️⃣ 建立 payment（現金）
    const paymentRes = await request.post(
      'http://localhost:8080/api/payment/pay',
      {
        data: {
          bookingId,
          method: 'cash',
          amount: 1000,
          operator: 'playwright'
        }
      }
    )

    expect(paymentRes.ok()).toBeTruthy()
    const paymentJson = await paymentRes.json()
    paymentId = paymentJson.data.paymentId
  })

  /**
   * -----------------------------------------------------------
   * 🧪 測試 1：hover / click 展開 + snapshot
   * -----------------------------------------------------------
   */
  test('hover & click 展開 PaymentPanel（snapshot）', async ({ page }) => {
    // 1️⃣ 直接進後台（使用 test token 模式）
    await page.goto('/admin/bookings?test=1')

    // 2️⃣ 等 refund badge 出現（現在一定會有）
    const badge = page.getByTestId('refund-badge').first()
    await expect(badge).toBeVisible()

    // 3️⃣ Hover → 展開 panel
    await badge.hover()

    const panel = page.getByTestId('payment-panel').first()
    await expect(panel).toBeVisible()

    // 4️⃣ Snapshot：hover 狀態
    await expect(panel).toHaveScreenshot(
      'admin-payment-panel-hover.png'
    )

    // 5️⃣ Click → 固定展開
    await badge.click()
    await expect(panel).toBeVisible()

    // 6️⃣ Snapshot：click 固定狀態
    await expect(panel).toHaveScreenshot(
      'admin-payment-panel-click.png'
    )
  })

  /**
   * -----------------------------------------------------------
   * 🧪 測試 2：輸入退款金額（不送出）
   * -----------------------------------------------------------
   */
  test('輸入退款金額（不送出）', async ({ page }) => {
    await page.goto('/admin/bookings?test=1')

    const badge = page.getByTestId('refund-badge').first()
    await badge.click()

    const panel = page.getByTestId('payment-panel').first()
    await expect(panel).toBeVisible()

    const input = page.getByTestId('refund-input').first()
    await input.fill('300')

    // Snapshot：含輸入金額狀態
    await expect(panel).toHaveScreenshot(
      'admin-payment-panel-input.png'
    )
  })
})

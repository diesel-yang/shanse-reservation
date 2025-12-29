import { Page } from '@playwright/test'

export async function adminLogin(page: Page) {
  await page.goto('/admin/login')
  await page.fill('input[name=email]', 'admin@test.com')
  await page.fill('input[name=password]', 'password')
  await page.click('button[type=submit]')
  await page.waitForURL('/admin/**')
}
test('PaymentPanel UI snapshot', async ({ page }) => {
  await page.goto('/admin/retail')

  const trigger = page.locator('[data-test=payment-panel-trigger]').first()
  await trigger.click()

  await expect(page.locator('[data-test=payment-panel]'))
    .toMatchSnapshot('payment-panel-expanded.png')
})

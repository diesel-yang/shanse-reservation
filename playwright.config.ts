// playwright.config.ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  timeout: 30 * 1000,

  use: {
    baseURL: 'http://localhost:5173',
    viewport: { width: 1280, height: 800 },

    // UI 回歸防護
    screenshot: 'only-on-failure',
    trace: 'on-first-retry'
  },

  snapshotDir: '__snapshots__',

  // 不跑多瀏覽器，避免干擾
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' }
    }
  ]
})

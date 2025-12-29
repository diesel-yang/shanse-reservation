// src/admin/composables/useAdminAuth.js
import { ref } from 'vue'

/**
 * Admin Auth Composable
 * -------------------------------------------------------------
 * 用途：
 * - 管理後台登入狀態
 * - 支援「正式登入」與「測試 token 模式」
 *
 * 原則：
 * - router guard 只問「現在是不是 admin」
 * - 不關心你是怎麼登入的
 */

/**
 * 是否為測試模式
 * - VITE_ADMIN_TEST_MODE = true 時啟用
 * - Playwright / E2E 專用
 */
const isTestMode =
  import.meta.env.VITE_ADMIN_TEST_MODE === 'true'

/**
 * 全域 admin 狀態（單例）
 * ※ 這裡是唯一真實來源
 */
const adminUser = ref(null)
const adminToken = ref(null)

/**
 * 初始化（模組載入時只跑一次）
 * - 若為測試模式，自動注入假 admin
 */
if (isTestMode) {
  adminUser.value = {
    email: 'test-admin@local',
    name: 'Test Admin'
  }
  adminToken.value = 'TEST_ADMIN_TOKEN'
}

/**
 * 主 composable
 */
export function useAdminAuth() {
  /**
   * 設定登入狀態（正式登入 / 測試登入都走這）
   */
  function setAuth(token, user) {
    adminToken.value = token
    adminUser.value = user
  }

  /**
   * 是否已登入（有 token 就算）
   */
  function isLoggedIn() {
    return !!adminToken.value
  }

  /**
   * router.beforeEach 用的 guard helper
   */
  function ensureAdminLoggedIn(router, to) {
    // ✅ 修正點：用 adminToken，不是 token
    if (adminToken.value) {
      return true
    }

    // 未登入 → 導向 login
    router.replace({
      path: '/admin/login',
      query: { redirect: to.fullPath }
    })

    // 告訴 router：我已處理 redirect
    return false
  }

  /**
   * 登出
   */
  function logout(router) {
    adminToken.value = null
    adminUser.value = null
    router.replace('/admin/login')
  }

  return {
    adminUser,
    adminToken,
    isLoggedIn,
    setAuth,
    ensureAdminLoggedIn,
    logout
  }
}

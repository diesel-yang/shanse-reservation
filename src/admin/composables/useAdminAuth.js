// src/admin/composables/useAdminAuth.js
import { ref, computed } from 'vue'

const idToken = ref(null)
const adminUser = ref(null)
const initialized = ref(false)

/**
 * 初始化：只在第一次載入檔案時執行
 */
function init() {
  if (initialized.value) return

  const t = localStorage.getItem('admin_id_token')
  const u = localStorage.getItem('admin_user')

  if (t) idToken.value = t
  if (u) adminUser.value = JSON.parse(u)

  initialized.value = true
}

init() // ⭐ 只執行一次，不會重覆導致 reactivity 問題

/**
 * 設定登入資料
 */
function setAuth(token, userInfo) {
  idToken.value = token
  adminUser.value = userInfo

  localStorage.setItem('admin_id_token', token)
  localStorage.setItem('admin_user', JSON.stringify(userInfo))
}

/**
 * 登出
 */
function logout() {
  idToken.value = null
  adminUser.value = null

  localStorage.removeItem('admin_id_token')
  localStorage.removeItem('admin_user')

  // ⭐ 重要：停止 Google 自動登入
  if (window.google?.accounts?.id) {
    try {
      google.accounts.id.disableAutoSelect()
    } catch (_) {}
  }
}

/**
 * 檢查是否登入（供 router 使用）
 */
const isAuthed = computed(() => !!idToken.value)

/**
 * Router guard 專用：未登入導向 /admin/login
 */
function ensureAdminLoggedIn(router, to) {
  init() // 確保 localStorage 已經同步到 memory

  if (!idToken.value) {
    return router.replace({
      path: '/admin/login',
      query: { redirect: to.fullPath }
    })
  }
}

export function useAdminAuth() {
  return {
    idToken,
    adminUser,
    isAuthed,
    setAuth,
    logout,
    ensureAdminLoggedIn
  }
}

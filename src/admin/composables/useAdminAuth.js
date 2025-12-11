// src/admin/composables/useAdminAuth.js
import { ref, computed } from 'vue'

const idToken = ref(null)
const adminUser = ref(null)
const initialized = ref(false)

/**
 * 一次性初始化（讀取 localStorage）
 */
function init() {
  if (initialized.value) return

  idToken.value = localStorage.getItem('admin_id_token') || null
  const u = localStorage.getItem('admin_user')
  adminUser.value = u ? JSON.parse(u) : null

  initialized.value = true
}

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
}

/**
 * 檢查是否登入（for router）
 */
const isAuthed = computed(() => !!idToken.value)

/**
 * Router Guard 專用
 */
function ensureAdminLoggedIn(router, to) {
  init()

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
    ensureAdminLoggedIn,
    init
  }
}

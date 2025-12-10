import { ref, computed } from 'vue'

const idToken = ref(null)
const adminUser = ref(null)

export function useAdminAuth() {
  loadFromStorage() // ⭐ 每次使用時自動載入

  function loadFromStorage() {
    const t = localStorage.getItem('admin_id_token')
    const u = localStorage.getItem('admin_user')

    if (t) idToken.value = t
    if (u) adminUser.value = JSON.parse(u)
  }

  function setAuth(token, userInfo) {
    idToken.value = token
    adminUser.value = userInfo

    localStorage.setItem('admin_id_token', token)
    localStorage.setItem('admin_user', JSON.stringify(userInfo))
  }

  function logout() {
    idToken.value = null
    adminUser.value = null
    localStorage.removeItem('admin_id_token')
    localStorage.removeItem('admin_user')
  }

  const isAuthed = computed(() => !!idToken.value)

  async function ensureAdminLoggedIn() {
    loadFromStorage()

    if (!idToken.value) {
      window.location.href = '/admin/login'
      return false
    }
    return true
  }

  return {
    idToken,
    adminUser,
    isAuthed,
    loadFromStorage,
    setAuth,
    logout,
    ensureAdminLoggedIn
  }
}

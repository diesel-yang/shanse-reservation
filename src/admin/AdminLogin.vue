<!-- src/admin/AdminLogin.vue -->
<script setup>
import { onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAdminAuth } from '@/admin/composables/useAdminAuth'

const router = useRouter()
const route = useRoute()
const { setAuth } = useAdminAuth()

/**
 * --------------------------------------------------
 * ✅ Test Mode 判斷
 * --------------------------------------------------
 * 1. ?test=1
 * 2. VITE_ADMIN_TEST_MODE=true
 */
const isTestMode = computed(() => {
  return (
    route.query.test === '1' ||
    import.meta.env.VITE_ADMIN_TEST_MODE === 'true'
  )
})

/**
 * --------------------------------------------------
 * ✅ Google Login（正式登入）
 * --------------------------------------------------
 */
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

function parseJwt(token) {
  const base64Url = token.split('.')[1]
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  )
  return JSON.parse(jsonPayload)
}

function loadGoogleLogin() {
  // 防呆：已載入就不再載
  if (window.google) return

  const script = document.createElement('script')
  script.src = 'https://accounts.google.com/gsi/client'
  script.async = true
  script.defer = true
  script.onload = initGoogle
  document.head.appendChild(script)
}

function initGoogle() {
  if (!window.google) return

  window.google.accounts.id.initialize({
    client_id: CLIENT_ID,
    callback: handleCredentialResponse
  })

  window.google.accounts.id.renderButton(
    document.getElementById('google-btn'),
    {
      theme: 'outline',
      size: 'large',
      width: 320,
      shape: 'pill'
    }
  )
}

function handleCredentialResponse(response) {
  const idToken = response.credential
  const payload = parseJwt(idToken)

  if (!payload.email) {
    alert('登入錯誤：Google 未回傳 email')
    return
  }

  setAuth(idToken, {
    email: payload.email,
    name: payload.name,
    picture: payload.picture
  })

  const target = route.query.redirect || '/admin'
  router.replace(target)
}

/**
 * --------------------------------------------------
 * ✅ Test Token Login（給 E2E / Playwright）
 * --------------------------------------------------
 */
function loginWithTestToken() {
  setAuth('test-token', {
    email: 'test@admin.local',
    name: 'Test Admin',
    picture: ''
  })

  const target = route.query.redirect || '/admin'
  router.replace(target)
}

/**
 * --------------------------------------------------
 * ✅ 正確處理模式切換
 * --------------------------------------------------
 */
onMounted(() => {
  if (!isTestMode.value) {
    loadGoogleLogin()
  }
})

watch(isTestMode, value => {
  if (!value) {
    loadGoogleLogin()
  }
})
</script>

<template>
  <div class="login-bg">
    <div class="login-card">
      <img src="/hero-transparent.png" alt="logo" class="logo" />

      <h1 class="title">山色後台登入</h1>

      <!-- ===============================
           正式模式：Google 登入
           =============================== -->
      <template v-if="!isTestMode">
        <p class="subtitle">請使用 Google 帳號登入</p>
        <div id="google-btn" class="google-btn"></div>
      </template>

      <!-- ===============================
           測試模式：Test Token 登入
           =============================== -->
      <template v-else>
        <p class="subtitle text-red-500">
          ⚠ 測試模式（不經 Google）
        </p>

        <button
          class="w-full bg-black text-white py-2 rounded mt-4"
          @click="loginWithTestToken"
          data-testid="admin-test-login"
        >
          使用測試帳號登入
        </button>
      </template>
    </div>
  </div>
</template>

<style scoped>
.login-bg {
  min-height: 100vh;
  backdrop-filter: blur(16px);
  background: rgba(255, 255, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.login-card {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 40px 32px;
  max-width: 380px;
  width: 100%;
  text-align: center;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.2);
}

.logo {
  width: 90px;
  margin: 0 auto 12px;
}

.title {
  font-size: 1.6rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 0.9rem;
  color: #444;
  margin-bottom: 24px;
}

.google-btn {
  display: flex;
  justify-content: center;
}
</style>

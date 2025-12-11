<script setup>
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAdminAuth } from '@/admin/composables/useAdminAuth'

const router = useRouter()
const route = useRoute()
const { setAuth } = useAdminAuth()

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

onMounted(() => {
  const script = document.createElement('script')
  script.src = 'https://accounts.google.com/gsi/client'
  script.async = true
  script.defer = true
  script.onload = initGoogle
  document.head.appendChild(script)
})

function initGoogle() {
  google.accounts.id.initialize({
    client_id: CLIENT_ID,
    callback: handleCredentialResponse
  })

  google.accounts.id.renderButton(document.getElementById('google-btn'), {
    theme: 'outline',
    size: 'large',
    width: 320,
    shape: 'pill'
  })
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
</script>

<template>
  <div class="login-bg">
    <div class="login-card">
      <img src="/hero-transparent.png" alt="logo" class="logo" />

      <h1 class="title">山色後台登入</h1>
      <p class="subtitle">請使用 Google 帳號登入</p>

      <div id="google-btn" class="google-btn"></div>
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

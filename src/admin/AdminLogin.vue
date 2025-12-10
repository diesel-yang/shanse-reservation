<script setup>
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAdminAuth } from '@/admin/composables/useAdminAuth'

const router = useRouter()
const route = useRoute()
const { setAuth } = useAdminAuth()

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

// 解析 JWT payload
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
  // eslint-disable-next-line no-undef
  google.accounts.id.initialize({
    client_id: CLIENT_ID,
    callback: handleCredentialResponse
  })

  // eslint-disable-next-line no-undef
  google.accounts.id.renderButton(document.getElementById('google-login-btn'), {
    theme: 'outline',
    size: 'large',
    width: '100%'
  })
}

function handleCredentialResponse(response) {
  const idToken = response.credential
  const payload = parseJwt(idToken)

  if (!payload.email) {
    alert('登入錯誤：Google 回傳無 email')
    return
  }

  // 儲存管理者登入資訊
  setAuth(idToken, {
    email: payload.email,
    name: payload.name,
    picture: payload.picture
  })

  // 導回被擋住的頁面
  const target = route.query.redirect || '/admin/retail'
  router.replace(target)
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 p-6">
    <div class="bg-white shadow rounded-xl p-6 w-full max-w-sm text-center">
      <h1 class="text-lg font-semibold mb-3">山色 後台登入</h1>
      <p class="text-sm text-gray-600 mb-4">請使用帳號登入</p>

      <div id="google-login-btn" class="flex justify-center"></div>
    </div>
  </div>
</template>

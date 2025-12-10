<template>
  <div class="login-wrapper">
    <h2>山色後台登入</h2>
    <button @click="googleLogin">使用 Google 登入</button>
  </div>
</template>

<script setup>
import { useAdminAuth } from './composables/useAdminAuth.js'
const { setAuth } = useAdminAuth()

function googleLogin() {
  google.accounts.id.initialize({
    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    callback: handleCredential
  })
  google.accounts.id.prompt()
}

async function handleCredential(response) {
  const token = response.credential

  const res = await fetch('https://你的-cloud-run-url/admin/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken: token })
  })

  const data = await res.json()

  if (!data.success) {
    alert('您沒有後台管理權限')
    return
  }

  setAuth(token, data.user)

  window.location.href = '/admin/bookings'
}
</script>

// src/api/axios.js
// 角色：Frontend API 的 Transport Layer（HTTP client）
// 負責把 /api/... 的 request 送出去，不管 booking、payment、admin，都共用它
import axios from 'axios'

const instance = axios.create({
  baseURL: '/', // ✅ 走 Vite proxy
  withCredentials: true // ✅ 若之後有 cookie / auth
})

export default instance

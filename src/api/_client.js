import axios from 'axios'

export const apiClient = axios.create({
  baseURL: '', // 走 vite proxy
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 之後要加 token / trace / logging，全加在這

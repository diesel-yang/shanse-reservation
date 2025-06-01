// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import Menu from '../pages/Menu.vue'
import Reserve from '../pages/Reserve.vue'
import Faq from '../pages/Faq.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/menu',
    name: 'Menu',
    component: Menu,
  },
  {
    path: '/reserve',
    name: 'Reserve',
    component: Reserve,
  },
  {
    path: '/faq',
    name: 'Faq',
    component: Faq,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
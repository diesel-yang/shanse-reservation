<template>
  <nav class="admin-nav">
    <div class="logo">山色後台</div>
    <ul>
      <li><router-link to="/admin/bookings">訂位管理</router-link></li>
      <li><router-link to="/admin/retail">零售訂單</router-link></li>
      <li><router-link to="/admin/preorders">預點餐</router-link></li>
    </ul>
  </nav>
</template>

<style>
.admin-nav {
  width: 200px;
  background: #222;
  color: #fff;
  padding: 20px;
  height: 100vh;
}
.admin-nav a {
  color: white;
  text-decoration: none;
}
.admin-nav ul {
  padding: 0;
  list-style: none;
}
.admin-nav li {
  margin: 10px 0;
}
</style>

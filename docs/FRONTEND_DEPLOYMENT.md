Frontend Deployment SOP

（STG / PROD 發版流程）

專案背景

專案類型：Vite + Vue

部署平台：Vercel

原始碼管理：GitHub

目標：

STG 與 PROD 完全隔離

避免誤上線

前端不依賴環境變數切 API

一、整體架構設計（結論先行）
Branch 策略
Branch 用途 會部署到
develop 測試 / 驗證 STG
main 正式營運 PROD
Vercel Project 對應
Vercel Project Production Branch
shanse-reservation-stg develop
shanse-reservation main

沒有 merge，不會上線正式版

二、前端環境變數規範（Vite）
核心原則

前端 env 只用於顯示與工具

不得用來切 API 或業務邏輯

所有變數必須以 VITE\_ 開頭

標準命名表
變數名稱 STG 值 PROD 值 用途
VITE_APP_ENV stg prod 環境識別
VITE_APP_NAME Shanse Reservation (STG) Shanse Reservation 顯示用
VITE_APP_BADGE STAGING (不設) STG UI 標示
禁止項目（明確禁止）
VITE_API_URL
VITE_BACKEND_URL
VITE_ENV=prod

原因：
環境切分由「Vercel Project + Branch」負責，不由前端程式碼負責。

三、Vercel 環境變數設定方式（重要）
STG Project（shanse-reservation-stg）

設定位置：

Settings → Environment Variables

Scope 勾選：

☑️ Production

⛔ Preview

⛔ Development

說明：
STG Project 的 Production = develop branch
所以 env 必須設在 Production

PROD Project（shanse-reservation）

VITE_APP_ENV=prod

不設定 VITE_APP_BADGE

四、STG UI 標示（防誤用）
放置位置

App.vue 或全站 Layout

標準實作

<script setup>
const env = import.meta.env.VITE_APP_ENV
const badge = import.meta.env.VITE_APP_BADGE
</script>

<template>
  <slot />

  <div
    v-if="env === 'stg'"
    class="fixed bottom-3 right-3 z-50 rounded
           bg-orange-600 px-3 py-1
           text-xs font-bold text-white shadow-lg"
  >
    {{ badge || 'STAGING' }}
  </div>
</template>

特性：

僅 STG 顯示

不影響功能

PROD 永遠不顯示

五、日常開發 / 測試流程（STG）
git checkout develop
git commit -m "feat: xxx"
git push develop

結果：

只部署 STG

STG 有「STAGING」標示

PROD 不會被影響

六、STG 驗收檢查清單（必做）

Vercel STG 最新 Deployment branch = develop

畫面右下角顯示 STAGING

API 請求未直寫 domain（使用 /api/...）

正式版沒有新部署

七、正式上線流程（PROD）
git checkout main
git merge develop
git push main

結果：

只部署 PROD

STAGING 標示不會出現

八、緊急回滾（前端）
git revert <commit>
git push main
九、常見錯誤與原則（務必遵守）
❌ Router / 業務層 import 靜態圖片

Router 不應依賴 assets

圖片應放在 component 或 public/

❌ 用 env 切 API

這會破壞 STG / PROD 的隔離性

✅ 唯一切環境的地方

Vercel Project + Branch

十、核心原則（請記住）

沒有 merge，就不會上線。
前端 env 只負責提醒，不負責決策。

文件狀態

版本：v1.0

適用：單人 / 小型團隊正式營運專案

可直接複製使用

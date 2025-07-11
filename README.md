# 山色予約系統 ｜ Shanse Reservation System

這是一個使用 **Vue 3 + Vite + Tailwind CSS** 開發的單頁式前端網站，提供顧客預約餐桌、預先點餐、查詢常見訂位問題等功能，並以 **靜態方式部署至 Vercel**。本專案初期以靜態預建構為主，後期可擴充為動態 API 架構。

---

## 📁 專案架構

- `src/`：主要 Vue 組件與頁面
- `dist/`：預建構產物，Vercel 部署用
- `.vercel/`：Vercel CLI 設定（自動生成）
- `.gitignore` / `.vercelignore`：版本控制與部署排除規則
- `deploy.sh`：部署指令腳本（可選）
- `README.md`：專案說明文件

---

## 🛠️ 安裝與開發流程

### 1. 安裝依賴套件

```bash
npm install
```

### 2. 本地開發模式（含熱更新）

```bash
npm run dev
```

瀏覽器開啟：http://localhost:5173

---

## 🏗️ 建構靜態網站

```bash
npm run build
```

會產生 `dist/` 資料夾，內含靜態 HTML / JS / CSS 檔案。

---

## 🚀 部署到 Vercel（靜態預建構方式）

建議以 **預建構後手動部署**方式進行：

### 1. 登入 Vercel CLI（僅第一次）

```bash
npm install -g vercel
vercel login
```

### 2. 手動部署產出結果

```bash
npm run build
vercel --prod
```

⚠️ **務必執行 `npm run build` 再 `vercel --prod`，否則會出現空白頁面或模組錯誤。**

---

## ✅ 上傳 GitHub 教學

```bash
git add .
git commit -m "更新首頁樣式與跑馬燈動畫"
git push
```

---

## 🧩 設計規範與技術要點

- 使用 Tailwind CSS 實現自適應排版
- 首頁頂部跑馬燈使用 CSS animation 替代 `<marquee>`
- Vue Router 處理頁面切換
- `vite.config.js` 中設為 `base: './'`，確保 GitHub / Vercel 靜態路徑正確

---

## 🔄 未來擴充方向（可選）

目前為靜態預建構架構，後續可切換至下列方案：

- 使用 [Google Sheets API](https://developers.google.com/sheets/api) 讀取/寫入菜單與訂單資料
- 建立 Node.js 後端伺服器或使用 Vercel Serverless Function
- 前端改為 `axios` 讀取遠端 JSON 或 API，支援動態更新

---

## 📸 畫面預覽

![首頁預覽](./public/hero-transparent.png)

---

## 🧑‍💻 作者資訊

- GitHub: [diesel-yang](https://github.com/diesel-yang)
- Vercel: [專案部署頁面](https://vue-tailwind-order.vercel.app)

---

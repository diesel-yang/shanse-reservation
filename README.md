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

## Retail.vue：

模板完全維持你原本結構（骨架、清單、浮動購物車、詳情視窗都在）。

只是把本地 cart 換成 useCart，並保留同名方法 addToCart/inc/dec/remove 供模板使用。

submitOrder 事件改以 callback done 把 { orderId } 傳回給子層，不破壞事件架構；同時保留原本的 alert + 清空作為相容後備路徑（通常不會走）。

## ModalCheckout.vue：

表單/驗證原樣保留。

新增成功彈窗 + 透過 useCart.clear() 清空購物車（含 localStorage）。

呼叫父層 @submit 時帶入 done 回呼以取得 { orderId }。

## Cart.vue：

獨立購物車頁（選用），直接讀取 useCart 狀態，可在 /cart 觀看/編輯購物車。

## useCart.js：

全域購物車狀態，支援 localStorage 永續化、基本加減刪、（可用）運費/折扣欄位。

## useOrder.js
共用的送單邏輯只存在一份 (useOrder.js)。
Retail.vue 與 Cart.vue 都只需呼叫 submitOrderCommon。

## 使用者流程

/cart 頁面：可以檢視、修改購物車。
點 前往結帳 → 會開啟 ModalCheckout 視窗。
ModalCheckout 送出 → 呼叫 submitOrder → 打 GAS → 成功 → 顯示 感謝訂購 + 訂單編號 彈窗 → 清空購物車。
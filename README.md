# 山色預約點餐系統

本專案為「山色」品牌的預約點餐網頁，採用 Vue 3 + Vite + Tailwind CSS 架構，透過 Google Sheets 作為後端儲存，並使用 GitHub 管理原始碼、Vercel 部署網站。

---

## 🚀 建置與部署說明

### 本地開發流程

```bash
# 安裝依賴套件
npm install

# 啟動本地開發伺服器（http://localhost:5173）
npm run dev
```

### 本地建構（推送至 Vercel 前需執行）

由於 Vercel 使用預建構模式部署，請務必在推送前手動建構：

```bash
# 清除快取並重新建構
rm -rf dist
npm run build
```

### 推送至 GitHub

```bash
git add .
git commit -m "更新首頁樣式與內容"
git push origin main
```

> ✅ GitHub 更新後，Vercel 會自動部署最新版本（基於 `dist/` 資料夾內容）

---

## 📁 專案結構簡述

- `src/pages/`：首頁、菜單、FAQ 頁面
- `src/components/`：共用元件，如導覽列、按鈕、表單等
- `public/`：靜態資源與影片
- `dist/`：建構後的靜態檔案（會自動產生，勿手動修改）

---

## ✅ Node.js 版本建議

本專案建議使用 Node.js `18.x` ~ `20.x`，符合 Vercel 預設支援範圍。
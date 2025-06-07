#!/bin/bash

# 停止遇錯
set -e

echo "🚀 開始建構專案..."
npm run build

echo "✅ 建構完成，準備提交 Git..."

git add .
commit_msg="build: 部署 $(date '+%Y-%m-%d %H:%M:%S')"
git commit -m "$commit_msg"

echo "📤 推送至 GitHub..."
git push

echo "🎉 完成部署！已將 dist 上傳 GitHub，Vercel 將自動重新部署。"

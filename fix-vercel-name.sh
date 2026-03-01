#!/bin/bash

# Vercel项目名称修复脚本
# 当项目名称冲突时使用

echo "🔧 Vercel项目名称修复工具"
echo "================================"

# 获取当前项目名
CURRENT_NAME="crossborder-tee-store"
echo "当前项目名: $CURRENT_NAME"

# 建议新项目名
SUGGESTIONS=(
    "crossborder-tee-shop"
    "crossborder-store-1"
    "wocao233-tee-store"
    "tee-store-international"
    "crossborder-ecom-store"
)

echo ""
echo "💡 建议的新项目名:"
for i in "${!SUGGESTIONS[@]}"; do
    echo "  $((i+1)). ${SUGGESTIONS[$i]}"
done

echo ""
read -p "请输入新项目名（或按Enter使用 ${SUGGESTIONS[0]}）: " NEW_NAME

if [ -z "$NEW_NAME" ]; then
    NEW_NAME="${SUGGESTIONS[0]}"
fi

echo ""
echo "🔄 更新配置文件中..."
echo "----------------------------------"

# 更新环境变量模板
if [ -f ".env.example" ]; then
    sed -i "s|https://crossborder-tee-store.vercel.app|https://${NEW_NAME}.vercel.app|g" .env.example
    echo "✅ 更新 .env.example"
fi

if [ -f ".env.local" ]; then
    sed -i "s|https://crossborder-tee-store.vercel.app|https://${NEW_NAME}.vercel.app|g" .env.local
    echo "✅ 更新 .env.local"
fi

# 更新部署指南
if [ -f "VERCEL_DEPLOY_GUIDE.md" ]; then
    sed -i "s|crossborder-tee-store|${NEW_NAME}|g" VERCEL_DEPLOY_GUIDE.md
    echo "✅ 更新 VERCEL_DEPLOY_GUIDE.md"
fi

# 更新README
if [ -f "README.md" ]; then
    sed -i "s|crossborder-tee-store|${NEW_NAME}|g" README.md
    echo "✅ 更新 README.md"
fi

# 更新部署指令
if [ -f "DEPLOY_INSTRUCTIONS.md" ]; then
    sed -i "s|crossborder-tee-store|${NEW_NAME}|g" DEPLOY_INSTRUCTIONS.md
    echo "✅ 更新 DEPLOY_INSTRUCTIONS.md"
fi

echo ""
echo "🎯 更新完成！"
echo "----------------------------------"
echo "新项目名: $NEW_NAME"
echo "Vercel链接: https://${NEW_NAME}.vercel.app"
echo ""
echo "🚀 部署步骤:"
echo "1. 访问 https://vercel.com/new"
echo "2. 导入仓库: wocao233/crossborder-tee-store"
echo "3. 项目名输入: $NEW_NAME"
echo "4. 点击 'Deploy'"
echo ""
echo "📋 环境变量配置:"
echo "   NEXT_PUBLIC_APP_URL=https://${NEW_NAME}.vercel.app"
echo ""
echo "🔗 Stripe Webhook:"
echo "   https://${NEW_NAME}.vercel.app/api/webhook/stripe"
echo ""
echo "💾 提交更改到GitHub:"
echo "   git add ."
echo "   git commit -m 'Update project name to ${NEW_NAME}'"
echo "   git push"
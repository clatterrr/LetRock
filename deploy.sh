#!/bin/bash

echo "🚀 开始部署到 Vercel..."

# 清除缓存
echo "📦 清除 Vercel 缓存..."
vercel --clear-cache

# 强制重新部署
echo "🔄 强制重新部署..."
vercel --prod --force

echo "✅ 部署完成！"
echo ""
echo "🔗 测试链接："
echo "https://theme7-beta.vercel.app/api/hello"
echo "https://theme7-beta.vercel.app/api/test"
echo ""
echo "📝 如果仍然有问题，请检查："
echo "1. Vercel 控制台中的环境变量"
echo "2. Functions 标签中的函数列表"
echo "3. 部署日志中的错误信息" 
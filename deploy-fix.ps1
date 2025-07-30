Write-Host "🔧 修复 axios 模块问题..." -ForegroundColor Yellow

# 清理缓存
Write-Host "📦 清理缓存..." -ForegroundColor Cyan
vercel --clear-cache

# 强制重新部署
Write-Host "🚀 强制重新部署..." -ForegroundColor Green
vercel --prod --force

Write-Host "✅ 部署完成！" -ForegroundColor Green
Write-Host ""
Write-Host "🔗 测试链接：" -ForegroundColor Cyan
Write-Host "https://theme7-beta.vercel.app/api/test-simple"
Write-Host "https://theme7-beta.vercel.app/api/cos?action=test-connection"
Write-Host ""
Write-Host "📝 如果仍然有问题：" -ForegroundColor Yellow
Write-Host "1. 检查 Vercel 控制台中的 Functions 状态"
Write-Host "2. 查看部署日志"
Write-Host "3. 确保环境变量已设置" 
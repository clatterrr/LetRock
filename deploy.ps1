Write-Host "🚀 开始部署到 Vercel..." -ForegroundColor Green

# 检查项目结构
Write-Host "📁 检查项目结构..." -ForegroundColor Yellow
Get-ChildItem api -Name | ForEach-Object { Write-Host "  - $_" }

# 清除缓存
Write-Host "📦 清除 Vercel 缓存..." -ForegroundColor Yellow
vercel --clear-cache

# 强制重新部署
Write-Host "🔄 强制重新部署..." -ForegroundColor Yellow
vercel --prod --force

Write-Host "✅ 部署完成！" -ForegroundColor Green
Write-Host ""
Write-Host "🔗 测试链接：" -ForegroundColor Cyan
Write-Host "https://theme7-beta.vercel.app/api/ping"
Write-Host "https://theme7-beta.vercel.app/api/hello"
Write-Host "https://theme7-beta.vercel.app/api/test"
Write-Host ""
Write-Host "📝 如果仍然有问题，请检查：" -ForegroundColor Yellow
Write-Host "1. Vercel 控制台中的环境变量"
Write-Host "2. Functions 标签中的函数列表"
Write-Host "3. 部署日志中的错误信息"
Write-Host ""
Write-Host "🔧 调试命令：" -ForegroundColor Cyan
Write-Host "vercel logs"
Write-Host "vercel ls" 
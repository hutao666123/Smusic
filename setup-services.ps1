# 创建 services 目录
if (-not (Test-Path "services")) {
    New-Item -ItemType Directory -Path "services" | Out-Null
    Write-Host "✓ 创建 services 目录"
}

# 克隆 api-enhanced
if (-not (Test-Path "services/api-enhanced")) {
    Write-Host "⏳ 正在克隆 api-enhanced..."
    git clone https://github.com/NeteaseCloudMusicApiEnhanced/api-enhanced.git services/api-enhanced
    Write-Host "✓ api-enhanced 克隆完成"
    
    Write-Host "⏳ 正在安装 api-enhanced 依赖..."
    Push-Location services/api-enhanced
    npm install
    Pop-Location
    Write-Host "✓ api-enhanced 依赖安装完成"
} else {
    Write-Host "✓ api-enhanced 已存在，跳过克隆"
}

# 注意：不再需要单独的 UnblockNeteaseMusic 服务
# api-enhanced 已内置解灰功能（基于 @unblockneteasemusic/server）

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✓ 服务设置完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "启动服务："
Write-Host "  cd services/api-enhanced && node app.js"
Write-Host ""
Write-Host "提示：api-enhanced 已内置多音源解灰功能，无需额外服务"
Write-Host ""

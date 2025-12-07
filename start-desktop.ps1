# Smusic 桌面应用启动脚本

Write-Host "========================================" -ForegroundColor Green
Write-Host "🎵 Smusic 桌面应用启动" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# 检查依赖
Write-Host "检查依赖..." -ForegroundColor Cyan
if (-not (Test-Path "node_modules")) {
    Write-Host "安装依赖中..." -ForegroundColor Yellow
    npm install
}

# 检查后端服务
Write-Host ""
Write-Host "检查后端服务..." -ForegroundColor Cyan

$apiEnhancedRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/search/suggest?keywords=test" -TimeoutSec 2 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        $apiEnhancedRunning = $true
        Write-Host "✓ api-enhanced 已运行（内置解灰功能）" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ api-enhanced 未运行" -ForegroundColor Red
}

if (-not $apiEnhancedRunning) {
    Write-Host ""
    Write-Host "⚠️  后端服务未启动，请在新的终端中运行：" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  cd services/api-enhanced && node app.js" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "提示：api-enhanced 已内置多音源解灰功能" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "按 Enter 继续启动应用..." -ForegroundColor Cyan
    Read-Host
}

Write-Host ""
Write-Host "启动 Electron 应用..." -ForegroundColor Cyan
Write-Host ""

# 启动 Electron 开发模式
npm run electron-dev

Write-Host ""
Write-Host "应用已关闭" -ForegroundColor Cyan

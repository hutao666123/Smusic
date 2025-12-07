# 🚀 Smusic 桌面应用启动指南

## 最快的启动方式

### 一键启动（推荐）

在项目根目录打开 PowerShell，运行：

```powershell
powershell -ExecutionPolicy Bypass -File start-desktop.ps1
```

脚本会自动处理所有启动步骤。

---

## 手动启动（3 个终端）

### 终端 1：启动 api-enhanced

```bash
cd services/api-enhanced
node app.js
```

### 终端 3：启动 Electron 应用

```bash
npm run electron-dev
```

---

## 调试快捷键

| 快捷键 | 功能 |
|--------|------|
| **F12** | 打开开发者工具 |
| **F5** | 刷新应用 |
| **Ctrl+Shift+R** | 强制刷新 |
| **Ctrl+Q** | 退出应用 |

---

## 遇到问题？

1. **应用白屏** → 打开开发者工具（F12）查看错误
2. **无法播放** → 检查后端服务是否运行
3. **搜索失败** → 访问诊断页面（http://localhost:5173/#/debug）

详见 `DESKTOP_DEBUG.md`

---

**现在就启动应用吧！🎵**

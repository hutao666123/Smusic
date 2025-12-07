# 🖥️ Smusic 桌面应用调试指南

## 快速启动

### 方式 1：使用启动脚本（推荐）

```bash
powershell -ExecutionPolicy Bypass -File start-desktop.ps1
```

脚本会自动：
1. 检查依赖是否安装
2. 检查后端服务是否运行
3. 启动 Electron 应用

### 方式 2：手动启动

#### 步骤 1：启动后端服务

打开两个新的终端：

**终端 1：启动 api-enhanced**
```bash
cd services/api-enhanced
node app.js
```

#### 步骤 2：启动 Electron 应用

**终端 3：启动应用**
```bash
npm run electron-dev
```

---

## 调试技巧

### 打开开发者工具

在 Electron 应用中：
- 按 **F12** 打开开发者工具
- 或点击菜单 → 查看 → 开发者工具

### 查看日志

1. **主进程日志** - 在启动 Electron 的终端中查看
2. **渲染进程日志** - 在开发者工具的 Console 标签中查看

### 快捷键

| 快捷键 | 功能 |
|--------|------|
| F12 | 打开/关闭开发者工具 |
| F5 | 刷新应用 |
| Ctrl+Shift+R | 强制刷新（清除缓存） |
| F11 | 全屏 |
| Ctrl+Q | 退出应用 |

### 菜单选项

**文件菜单**
- 退出 (Ctrl+Q)

**编辑菜单**
- 撤销 (Ctrl+Z)
- 重做 (Ctrl+Y)
- 剪切 (Ctrl+X)
- 复制 (Ctrl+C)
- 粘贴 (Ctrl+V)

**查看菜单**
- 开发者工具 (F12)
- 刷新 (F5)
- 强制刷新 (Ctrl+Shift+R)
- 全屏 (F11)

**帮助菜单**
- 关于

---

## 常见问题

### Q: 应用启动后白屏？

**A:** 检查以下几点：

1. 确保 Vite 开发服务器已启动（http://localhost:5173）
2. 打开开发者工具（F12）查看错误信息
3. 检查后端服务是否运行
4. 尝试刷新应用（F5）

### Q: 无法连接到后端服务？

**A:**

1. 确保 api-enhanced 运行在 http://localhost:3000
2. 确保 UnblockNeteaseMusic 运行在 http://localhost:8080
3. 访问诊断页面（http://localhost:5173/#/debug）测试连接

### Q: 应用卡顿或响应缓慢？

**A:**

1. 打开开发者工具的 Performance 标签进行性能分析
2. 检查网络请求是否正常
3. 查看 Console 标签是否有错误信息
4. 尝试强制刷新（Ctrl+Shift+R）

### Q: 如何调试主进程代码？

**A:**

1. 在 `electron-main.js` 中添加 `console.log()` 语句
2. 在启动 Electron 的终端中查看输出
3. 或使用 VS Code 的 Electron 调试器

### Q: 如何调试渲染进程代码？

**A:**

1. 打开开发者工具（F12）
2. 在 Sources 标签中设置断点
3. 执行相关操作触发断点
4. 在 Console 标签中查看变量值

---

## 开发工作流

### 修改前端代码

1. 编辑 `src/` 目录中的文件
2. Vite 会自动热更新
3. 应用会自动刷新（无需重启 Electron）

### 修改主进程代码

1. 编辑 `electron-main.js` 或 `preload.js`
2. 重启 Electron 应用（关闭后重新启动）

### 修改 API 接口

1. 编辑 `src/api/music.js`
2. Vite 会自动热更新
3. 应用会自动刷新

---

## 构建生产版本

### 构建应用

```bash
npm run electron-build
```

生成的可执行文件位置：
- Windows: `dist/Smusic Setup 1.0.0.exe`
- macOS: `dist/Smusic-1.0.0.dmg`
- Linux: `dist/smusic-1.0.0.AppImage`

### 测试生产版本

```bash
npm run build
npm run electron
```

---

## 性能优化

### 减小应用体积

1. 移除不必要的依赖
2. 使用动态导入
3. 启用代码分割

### 提高启动速度

1. 优化依赖加载
2. 使用预加载脚本
3. 缓存静态资源

### 改善运行性能

1. 使用虚拟滚动处理大列表
2. 缓存 API 响应
3. 使用 Web Workers 处理耗时操作

---

## 发布和更新

### 配置自动更新

在 `electron-main.js` 中添加：

```javascript
import { autoUpdater } from 'electron-updater'

if (!isDev) {
  autoUpdater.checkForUpdatesAndNotify()
}
```

### 发布到应用商店

参考 Electron 官方文档：
- [macOS App Store](https://www.electronjs.org/docs/tutorial/mac-app-store-submission-guide)
- [Windows Store](https://www.electronjs.org/docs/tutorial/windows-store-guide)

---

## 相关资源

- [Electron 官方文档](https://www.electronjs.org/docs)
- [Vite 官方文档](https://vitejs.dev/)
- [Vue 3 官方文档](https://vuejs.org/)
- [electron-builder 文档](https://www.electron.build/)

---

**最后更新：2025 年 12 月 7 日**

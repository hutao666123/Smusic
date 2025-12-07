# 🎵 Smusic - Vue3 + Electron 音乐播放器

一个基于 Vue3 + Electron 的现代化音乐播放器，支持网易云音乐搜索、播放、灰色歌曲解灰等功能。

## ✨ 功能特性

- 🔍 **歌曲搜索** - 搜索歌曲、歌手、歌单
- 🎵 **音乐播放** - 播放网易云音乐
- 🔓 **灰色歌曲解灰** - 自动处理无版权歌曲
- 📝 **歌词显示** - 普通歌词和逐字歌词
- 🎼 **歌单管理** - 浏览和播放歌单
- 🎤 **推荐功能** - 热门歌单和推荐歌曲
- 💾 **状态持久化** - 播放列表自动保存

## 🛠️ 技术栈

### 前端
- **Vue 3** - 渐进式 JavaScript 框架
- **Vite** - 下一代前端构建工具
- **Electron** - 跨平台桌面应用框架
- **Pinia** - 状态管理库
- **Vue Router** - 路由管理
- **Naive UI** - UI 组件库
- **Axios** - HTTP 客户端

### 后端服务
- **api-enhanced** (端口 3000) - 网易云音乐 API 代理（内置多音源解灰功能）

## 📦 项目结构

```
Smusic/
├── src/
│   ├── main.js              # 应用入口
│   ├── App.vue              # 根组件
│   ├── api/                 # API 接口
│   │   ├── request.js       # Axios 配置
│   │   └── music.js         # 音乐 API
│   ├── stores/              # Pinia 状态管理
│   │   └── player.js        # 播放器状态
│   ├── components/          # 组件
│   │   └── PlayerBar.vue    # 播放器控制条
│   ├── pages/               # 页面
│   │   ├── Home.vue         # 首页
│   │   ├── Search.vue       # 搜索页
│   │   └── Playlist.vue     # 歌单页
│   └── router/              # 路由配置
│       └── index.js
├── index.html               # HTML 入口
├── vite.config.js           # Vite 配置
├── electron-main.js         # Electron 主进程
├── package.json             # 项目配置
└── README.md                # 项目说明
```

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 设置后端服务（首次运行）

```powershell
# 自动克隆并安装 api-enhanced
.\setup-services.ps1
```

这会自动安装：
- **api-enhanced** - 网易云音乐 API（端口 3000，内置解灰功能）

### 3. 启动后端服务

```bash
# 启动 api-enhanced (端口 3000)
cd services/api-enhanced
node app.js
```

### 4. 启动应用

```bash
# Web 开发模式
npm run dev

# Electron 桌面应用（推荐）
npm run electron-dev

# 或使用一键启动脚本（会自动检查后端服务）
.\start-desktop.ps1
```

### 5. 构建应用

```bash
npm run build
npm run electron-build
```

## ⚠️ 重要说明

### 关于灰度歌曲

**什么是灰度歌曲？**
- 灰度歌曲是指因版权限制无法完整播放的歌曲
- 表现：页面显示完整时长（如 3:00），但实际只能播放 30 秒

**如何解决？**
1. **确保 api-enhanced 服务已启动**（端口 3000）
2. api-enhanced 内置了多音源解灰功能（基于 UnblockNeteaseMusic）
3. 应用会自动检测灰度歌曲并从其他音源（酷我、酷狗、咪咕、QQ音乐等）获取完整版本
4. 如果仍无法播放，检查控制台日志

**支持的音源：**
- bodian（波点音乐）
- kuwo（酷我音乐）
- kugou（酷狗音乐）
- migu（咪咕音乐）
- qq（QQ音乐）
- pyncmd（第三方网易云API）

**检查服务状态：**
```bash
# 测试 api-enhanced
curl http://localhost:3000/search/suggest?keywords=test

# 测试解灰功能
curl "http://localhost:3000/song/url/match?id=1901371647"
```

## 📝 API 说明

### 搜索歌曲

```javascript
import { searchSongs } from '@/api/music'

const res = await searchSongs('周杰伦', 30, 0)
```

### 获取播放 URL（含灰色歌曲解灰）

```javascript
import { getMusicUrl } from '@/api/music'

const url = await getMusicUrl(1234567)
```

### 获取歌词

```javascript
import { getLyric } from '@/api/music'

const res = await getLyric(1234567)
```

### 获取歌单详情

```javascript
import { getPlaylistDetail } from '@/api/music'

const res = await getPlaylistDetail(playlistId)
```

## 🔧 配置

### 修改 API 端口

如果后端服务使用了不同的端口，修改 `src/api/request.js`：

```javascript
export const apiRequest = axios.create({
  baseURL: 'http://localhost:3000',  // 修改这里
  timeout: 10000
})
```

## 📚 相关资源

- [api-enhanced GitHub](https://github.com/NeteaseCloudMusicApiEnhanced/api-enhanced) - 内置 UnblockNeteaseMusic 解灰功能
- [Vue 3 官方文档](https://vuejs.org/)
- [Electron 官方文档](https://www.electronjs.org/docs)
- [Vite 官方文档](https://vitejs.dev/)

## 📄 许可证

MIT

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**最后更新：2025 年 12 月 7 日**

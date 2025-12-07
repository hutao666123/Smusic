# 🎵 Vue3 + Electron 音乐播放器开发指南

> 学习如何调用 api-enhanced 和 UnblockNeteaseMusic 两个接口，开发音乐播放器

## 📑 目录

- [要开发什么](#要开发什么)
- [用什么技术](#用什么技术)
- [两个接口说明](#两个接口说明)
- [快速开始](#快速开始)
- [常见问题](#常见问题)

---

## 要开发什么

### 核心功能

| 功能 | 说明 | 调用接口 |
|------|------|---------|
| **搜索歌曲** | 搜索歌曲、歌手、歌单 | api-enhanced |
| **播放音乐** | 获取播放 URL，播放音乐 | api-enhanced |
| **灰色歌曲解灰** | 自动处理无版权歌曲 | UnblockNeteaseMusic |
| **显示歌词** | 普通歌词和逐字歌词 | api-enhanced |
| **用户登录** | 手机号、邮箱、二维码登录 | api-enhanced |
| **歌单管理** | 获取歌单、创建歌单 | api-enhanced |
| **推荐功能** | 每日推荐、私人 FM、热门歌单 | api-enhanced |
| **评论功能** | 查看和发送评论 | api-enhanced |

### 可选功能

- 桌面歌词显示
- 本地音乐导入
- 全局快捷键支持
- 自动更新

---

## 用什么技术

### 前端技术栈

| 技术 | 用途 | 说明 |
|------|------|------|
| **Vue 3** | 前端框架 | 构建用户界面 |
| **Vite** | 开发服务器 | 快速开发和打包 |
| **Electron** | 桌面应用 | 跨平台桌面应用框架 |
| **Axios** | HTTP 请求 | 调用 API 接口 |
| **Pinia** | 状态管理 | 管理播放器状态 |
| **Vue Router** | 路由 | 页面导航 |
| **Naive UI** | UI 组件库 | 美观的界面组件 |

### 后端服务

| 服务 | 端口 | 用途 |
|------|------|------|
| **api-enhanced** | 3000 | 网易云音乐 API 代理 |
| **UnblockNeteaseMusic** | 8080 | 灰色歌曲解灰服务 |

---

## 两个接口说明

### 1️⃣ api-enhanced（网易云音乐 API）

**是什么？**
- 网易云音乐的第三方 Node.js API 代理
- 提供网易云音乐的所有接口

**主要接口：**

```
搜索功能
├─ /cloudsearch          搜索歌曲、歌手、歌单
└─ /search/suggest       搜索建议

播放功能
├─ /song/url             获取播放 URL
├─ /song/detail          获取歌曲详情
├─ /lyric                获取歌词
└─ /lyric/new            获取逐字歌词

歌单功能
├─ /top/playlist         热门歌单
├─ /top/playlist/highquality  精品歌单
├─ /personalized         推荐歌单
└─ /playlist/detail      歌单详情

用户功能
├─ /login/cellphone      手机号登录
├─ /login                邮箱登录
├─ /login/qr/key         二维码登录
├─ /login/status         检查登录状态
└─ /user/playlist        获取用户歌单

推荐功能
├─ /personalized/newsong 推荐新歌
├─ /recommend/songs      推荐歌曲（需登录）
├─ /personal_fm          私人 FM（需登录）
└─ /top/song             热门单曲

其他功能
├─ /comment/music        获取评论
├─ /comment              发送评论
└─ /like                 添加到喜欢
```

**如何调用？**

```javascript
// 基础配置
const request = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 10000,
})

// 搜索歌曲
const res = await request.get('/cloudsearch', {
  params: {
    keywords: '周杰伦',
    type: 1,  // 1=歌曲, 100=歌手, 1000=歌单
    limit: 30,
    offset: 0
  }
})

// 获取播放 URL
const res = await request.get('/song/url', {
  params: { id: 1234567 }
})

// 获取歌词
const res = await request.get('/lyric', {
  params: { id: 1234567 }
})
```

---

### 2️⃣ UnblockNeteaseMusic（灰色歌曲解灰）

**是什么？**
- 解锁网易云音乐灰色歌曲的代理服务
- 从其他平台（QQ、虾米、百度、酷狗等）获取替代音源

**主要功能：**

```
灰色歌曲解灰
├─ 检测无版权歌曲
├─ 从其他平台获取音源
└─ 返回可用的播放 URL

支持的音源
├─ QQ 音乐
├─ 虾米音乐
├─ 百度音乐
├─ 酷狗音乐
├─ 酷我音乐
├─ 咪咕音乐
└─ JOOX
```

**如何调用？**

```javascript
// 基础配置
const unblockRequest = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 10000,
})

// 获取解灰 URL
const res = await unblockRequest.get('/song/url', {
  params: { id: 1234567 }
})

// 返回结果
// {
//   "data": [
//     {
//       "id": 1234567,
//       "url": "http://...",
//       "br": 320000
//     }
//   ]
// }
```

---

## 快速开始

### 第 1 步：安装依赖

```bash
npm install vue@3 vite @vitejs/plugin-vue axios pinia vue-router
npm install -D electron electron-builder
```

### 第 2 步：克隆服务

```bash
# 克隆 api-enhanced
git clone https://github.com/NeteaseCloudMusicApiEnhanced/api-enhanced.git services/api-enhanced
cd services/api-enhanced && npm install && cd ../..

# 克隆 UnblockNeteaseMusic
git clone https://github.com/UnblockNeteaseMusic/server.git services/unblock-music
cd services/unblock-music && npm install && cd ../..
```

### 第 3 步：启动服务

```bash
# 终端 1：启动 api-enhanced
cd services/api-enhanced
node app.js

# 终端 2：启动 UnblockNeteaseMusic
cd services/unblock-music
npm start

# 终端 3：启动你的应用
npm run dev
```

### 第 4 步：验证服务

```bash
# 测试 api-enhanced
curl http://localhost:3000/search/suggest?keywords=周杰伦

# 测试 UnblockNeteaseMusic
curl http://localhost:8080/song/url?id=1234567
```

---

## 常见问题

### Q1: 如何在 Electron 中启动这两个服务？

**A:** 在 Electron 主进程中启动：

```javascript
// src/background.js
const { app } = require('electron/main')

async function startServices() {
  // 启动 api-enhanced
  const { serveNcmApi } = require('../services/api-enhanced/server')
  await serveNcmApi({ port: 3000 })

  // 启动 UnblockNeteaseMusic
  const { startServer } = require('../services/unblock-music/server')
  await startServer({ port: 8080 })
}

app.whenReady().then(async () => {
  await startServices()
  // 创建窗口...
})
```

### Q2: 灰色歌曲如何自动解灰？

**A:** 先调用 api-enhanced，失败时调用 UnblockNeteaseMusic：

```javascript
export const getMusicUrl = async (id) => {
  try {
    // 先从 api-enhanced 获取
    const res = await request.get('/song/url', { params: { id } })
    if (res.data.data?.[0]?.url) {
      return res.data.data[0].url
    }

    // 失败时调用解灰服务
    const unblockRes = await unblockRequest.get('/song/url', { params: { id } })
    return unblockRes.data.data?.[0]?.url
  } catch (error) {
    console.error('获取播放 URL 失败:', error)
    return null
  }
}
```

### Q3: 如何处理用户登录？

**A:** 使用 api-enhanced 的登录接口：

```javascript
// 手机号登录
const res = await request.get('/login/cellphone', {
  params: {
    phone: '13800138000',
    password: 'password'
  }
})

// 保存 cookie
if (res.data.code === 200) {
  localStorage.setItem('neteaseCookie', res.data.cookie)
}

// 后续请求自动带上 cookie
const params = {
  keywords: '周杰伦',
  cookie: localStorage.getItem('neteaseCookie')
}
```

### Q4: 搜索功能怎么实现？

**A:** 调用 `/cloudsearch` 接口：

```javascript
// 搜索歌曲
const res = await request.get('/cloudsearch', {
  params: {
    keywords: '周杰伦',
    type: 1,      // 1=歌曲, 100=歌手, 1000=歌单
    limit: 30,
    offset: 0
  }
})

const songs = res.data.result?.songs || []
```

### Q5: 如何获取歌词？

**A:** 调用 `/lyric` 接口：

```javascript
// 普通歌词
const res = await request.get('/lyric', {
  params: { id: 1234567 }
})
const lyric = res.data.lrc?.lyric

// 逐字歌词
const res = await request.get('/lyric/new', {
  params: { id: 1234567 }
})
const wordLyric = res.data.tlyric?.lyric
```

### Q6: 如何管理播放状态？

**A:** 使用 Pinia 状态管理：

```javascript
// stores/player.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePlayerStore = defineStore('player', () => {
  const playlist = ref([])
  const currentIndex = ref(0)
  const isPlaying = ref(false)

  const play = () => { isPlaying.value = true }
  const pause = () => { isPlaying.value = false }
  const next = () => { currentIndex.value++ }

  return { playlist, currentIndex, isPlaying, play, pause, next }
}, {
  persist: true  // 持久化存储
})
```

### Q7: 端口被占用怎么办？

**A:** 修改端口配置：

```javascript
// api-enhanced
PORT=4000 node app.js

// UnblockNeteaseMusic
unblockneteasemusic -p 9000
```

然后更新 Axios 配置：

```javascript
const request = axios.create({
  baseURL: 'http://localhost:4000'
})

const unblockRequest = axios.create({
  baseURL: 'http://localhost:9000'
})
```

---

## 相关资源

- [api-enhanced GitHub](https://github.com/NeteaseCloudMusicApiEnhanced/api-enhanced)
- [UnblockNeteaseMusic GitHub](https://github.com/UnblockNeteaseMusic/server)
- [Vue 3 官方文档](https://vuejs.org/)
- [Electron 官方文档](https://www.electronjs.org/docs)

---

**最后更新：2025 年 12 月 7 日**

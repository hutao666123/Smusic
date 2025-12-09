# 设计文档

## 概述

本设计文档描述了音乐播放器本地音乐管理功能的技术实现方案。该功能通过 Electron 的主进程进行文件系统操作，使用 IPC 通信机制与 Vue 渲染进程交互，采用 Pinia 进行状态管理。所有用户数据以 JSON 格式存储在本地文件系统中，确保数据持久化和隐私保护。

## 架构

### 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                      渲染进程 (Vue)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Vue 组件    │  │ Pinia Store  │  │  API 服务    │     │
│  │  - 歌单页面  │←→│  - playlist  │←→│  - music.js  │     │
│  │  - 播放器    │  │  - player    │  │  - request   │     │
│  │  - 下载管理  │  │  - download  │  └──────────────┘     │
│  └──────────────┘  └──────────────┘                        │
│         ↕                  ↕                                │
│  ┌──────────────────────────────────────────────────┐      │
│  │         window.electron (preload.js)             │      │
│  └──────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
                           ↕ IPC
┌─────────────────────────────────────────────────────────────┐
│                    主进程 (Electron)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ IPC Handlers │  │ File Manager │  │   Download   │     │
│  │  - 歌单操作  │→│  - JSON 读写 │  │   Manager    │     │
│  │  - 下载管理  │  │  - 路径管理  │  │  - 任务队列  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                           ↕                                 │
│  ┌──────────────────────────────────────────────────┐      │
│  │           本地文件系统 (userData)                 │      │
│  │  ~/.music-player/                                │      │
│  │    ├── data/                                     │      │
│  │    │   ├── favorites.json                        │      │
│  │    │   ├── downloads.json                        │      │
│  │    │   ├── custom-playlists.json                 │      │
│  │    │   └── collected-playlists.json              │      │
│  │    └── downloads/                                │      │
│  │        ├── songs/                                │      │
│  │        └── covers/                               │      │
│  └──────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### 数据流

1. **读取流程**：用户操作 → Vue 组件 → Pinia Store → IPC 调用 → 主进程读取文件 → 返回数据 → Store 更新 → 组件渲染
2. **写入流程**：用户操作 → Vue 组件 → Pinia Store → IPC 调用 → 主进程写入文件 → 返回结果 → Store 更新状态
3. **下载流程**：用户点击下载 → Download Manager → API 获取链接 → 下载文件 → 更新进度 → 完成后更新歌单

## 组件和接口

### 主进程模块

#### FileManager (文件管理器)

负责所有本地文件的读写操作。

```javascript
class FileManager {
  constructor(userDataPath)
  
  // 初始化数据目录
  async initDataDirectory()
  
  // 读取 JSON 文件
  async readJSON(filePath)
  
  // 写入 JSON 文件
  async writeJSON(filePath, data)
  
  // 检查文件是否存在
  async fileExists(filePath)
  
  // 删除文件
  async deleteFile(filePath)
  
  // 获取文件大小
  async getFileSize(filePath)
  
  // 获取目录大小
  async getDirectorySize(dirPath)
}
```

#### PlaylistManager (歌单管理器)

管理所有歌单相关的业务逻辑。

```javascript
class PlaylistManager {
  constructor(fileManager)
  
  // 我喜欢的音乐
  async addToFavorites(song)
  async removeFromFavorites(songId)
  async getFavorites()
  async isFavorite(songId)
  
  // 自定义歌单
  async createPlaylist(name, description)
  async updatePlaylist(playlistId, data)
  async deletePlaylist(playlistId)
  async getCustomPlaylists()
  
  // 歌曲操作
  async addSongToPlaylist(playlistId, song)
  async removeSongFromPlaylist(playlistId, songId)
  async addSongsToPlaylist(playlistId, songs)
  
  // 歌单合并
  async mergePlaylist(targetId, sourceId, sourceSongs)
  
  // 在线歌单收藏
  async collectOnlinePlaylist(playlist)
  async uncollectOnlinePlaylist(playlistId)
  async getCollectedPlaylists()
  
  // 已下载歌单
  async addToDownloads(song, localPath, fileSize, quality)
  async removeFromDownloads(songId)
  async getDownloads()
}
```

#### DownloadManager (下载管理器)

处理歌曲下载任务。

```javascript
class DownloadManager {
  constructor(fileManager, downloadPath)
  
  // 下载单曲
  async downloadSong(songId, songUrl, metadata)
  
  // 批量下载
  async downloadPlaylist(songs, onProgress)
  
  // 取消下载
  cancelDownload(taskId)
  
  // 暂停/恢复下载
  pauseDownload(taskId)
  resumeDownload(taskId)
  
  // 获取下载进度
  getDownloadProgress(taskId)
  
  // 获取所有下载任务
  getAllTasks()
  
  // 清理失败的下载
  cleanupFailedDownload(taskId)
}
```

### IPC 接口定义

主进程暴露给渲染进程的所有 IPC 接口。

```javascript
// preload.js 暴露的 API
window.electron = {
  // 我喜欢的音乐
  addToFavorites: (song) => ipcRenderer.invoke('add-to-favorites', song),
  removeFromFavorites: (songId) => ipcRenderer.invoke('remove-from-favorites', songId),
  getFavorites: () => ipcRenderer.invoke('get-favorites'),
  isFavorite: (songId) => ipcRenderer.invoke('is-favorite', songId),
  
  // 自定义歌单
  createPlaylist: (name, description) => ipcRenderer.invoke('create-playlist', {name, description}),
  updatePlaylist: (playlistId, data) => ipcRenderer.invoke('update-playlist', {playlistId, ...data}),
  deletePlaylist: (playlistId) => ipcRenderer.invoke('delete-playlist', playlistId),
  getCustomPlaylists: () => ipcRenderer.invoke('get-custom-playlists'),
  
  // 歌曲操作
  addSongToPlaylist: (playlistId, song) => ipcRenderer.invoke('add-song-to-playlist', {playlistId, song}),
  removeSongFromPlaylist: (playlistId, songId) => ipcRenderer.invoke('remove-song-from-playlist', {playlistId, songId}),
  addSongsToPlaylist: (playlistId, songs) => ipcRenderer.invoke('add-songs-to-playlist', {playlistId, songs}),
  
  // 歌单合并
  mergePlaylist: (targetId, sourceId, sourceSongs) => ipcRenderer.invoke('merge-playlist', {targetId, sourceId, sourceSongs}),
  
  // 在线歌单收藏
  collectOnlinePlaylist: (playlist) => ipcRenderer.invoke('collect-online-playlist', playlist),
  uncollectOnlinePlaylist: (playlistId) => ipcRenderer.invoke('uncollect-online-playlist', playlistId),
  getCollectedPlaylists: () => ipcRenderer.invoke('get-collected-playlists'),
  
  // 已下载歌单
  getDownloads: () => ipcRenderer.invoke('get-downloads'),
  removeFromDownloads: (songId) => ipcRenderer.invoke('remove-from-downloads', songId),
  
  // 下载功能
  downloadSong: (songId, songUrl, metadata) => ipcRenderer.invoke('download-song', {songId, songUrl, metadata}),
  downloadPlaylist: (songs) => ipcRenderer.invoke('download-playlist', songs),
  cancelDownload: (taskId) => ipcRenderer.invoke('cancel-download', taskId),
  pauseDownload: (taskId) => ipcRenderer.invoke('pause-download', taskId),
  resumeDownload: (taskId) => ipcRenderer.invoke('resume-download', taskId),
  
  // 下载进度监听
  onDownloadProgress: (callback) => ipcRenderer.on('download-progress', (event, data) => callback(data)),
  offDownloadProgress: (callback) => ipcRenderer.removeListener('download-progress', callback),
  
  // 获取本地歌曲路径
  getLocalSongPath: (songId) => ipcRenderer.invoke('get-local-song-path', songId)
}
```

### Pinia Store

#### playlistStore (歌单状态管理)

```javascript
export const usePlaylistStore = defineStore('playlist', () => {
  // 状态
  const favorites = ref([])
  const customPlaylists = ref([])
  const collectedPlaylists = ref([])
  const downloads = ref([])
  const loading = ref(false)
  const error = ref(null)
  
  // 计算属性
  const allLocalPlaylists = computed(() => [
    { id: 'local-favorites', name: '我喜欢的音乐', songs: favorites.value, type: 'system' },
    { id: 'local-downloads', name: '已下载', songs: downloads.value, type: 'system' },
    ...customPlaylists.value
  ])
  
  // 方法
  async function loadAllPlaylists()
  async function addToFavorites(song)
  async function removeFromFavorites(songId)
  function isFavorite(songId)
  
  async function createPlaylist(name, description)
  async function updatePlaylist(playlistId, data)
  async function deletePlaylist(playlistId)
  
  async function addSongToPlaylist(playlistId, song)
  async function removeSongFromPlaylist(playlistId, songId)
  async function mergePlaylist(targetId, sourceId, sourceSongs)
  
  async function collectOnlinePlaylist(playlist)
  async function uncollectOnlinePlaylist(playlistId)
  
  return {
    favorites,
    customPlaylists,
    collectedPlaylists,
    downloads,
    loading,
    error,
    allLocalPlaylists,
    // ... 所有方法
  }
})
```

#### downloadStore (下载状态管理)

```javascript
export const useDownloadStore = defineStore('download', () => {
  // 状态
  const downloadTasks = ref(new Map())
  const downloadQueue = ref([])
  const isDownloading = ref(false)
  
  // 方法
  async function downloadSong(song)
  async function downloadPlaylist(songs)
  function cancelDownload(taskId)
  function pauseDownload(taskId)
  function resumeDownload(taskId)
  function getTaskProgress(taskId)
  
  // 监听下载进度
  function setupProgressListener()
  
  return {
    downloadTasks,
    downloadQueue,
    isDownloading,
    // ... 所有方法
  }
})
```

### Vue 组件

#### MyPlaylists.vue (我的歌单页面)

显示所有本地歌单（系统歌单 + 自定义歌单）。

```vue
<template>
  <div class="my-playlists">
    <h2>我的音乐</h2>
    <div class="system-playlists">
      <playlist-card :playlist="favorites" />
      <playlist-card :playlist="downloads" />
    </div>
    
    <div class="custom-playlists-header">
      <h3>自定义歌单</h3>
      <n-button @click="showCreateDialog">新建歌单</n-button>
    </div>
    
    <div class="custom-playlists">
      <playlist-card 
        v-for="playlist in customPlaylists" 
        :key="playlist.id"
        :playlist="playlist"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </div>
  </div>
</template>
```

#### CollectedPlaylists.vue (收藏的歌单页面)

显示所有收藏的在线歌单。

#### LocalPlaylist.vue (本地歌单详情页)

显示本地歌单的歌曲列表，支持播放、删除、下载等操作。

#### DownloadManager.vue (下载管理组件)

显示所有下载任务的进度和状态。

#### AddToPlaylistDialog.vue (添加到歌单对话框)

选择目标歌单的弹窗组件。

## 数据模型

### 歌曲元数据 (Song)

```typescript
interface Song {
  id: string                    // 歌曲 ID
  name: string                  // 歌曲名称
  artists: Artist[]             // 歌手列表
  album: Album                  // 专辑信息
  duration: number              // 时长（毫秒）
  addTime?: number              // 添加时间戳
  downloadTime?: number         // 下载时间戳
  localPath?: string            // 本地文件路径
  fileSize?: number             // 文件大小（字节）
  quality?: string              // 音质（如 "320000"）
}

interface Artist {
  id: string
  name: string
}

interface Album {
  id: string
  name: string
  picUrl: string
}
```

### 本地歌单 (LocalPlaylist)

```typescript
interface LocalPlaylist {
  id: string                    // 歌单 ID
  name: string                  // 歌单名称
  description?: string          // 描述
  coverUrl?: string             // 封面图片
  createTime: number            // 创建时间戳
  updateTime: number            // 更新时间戳
  songs: Song[]                 // 歌曲列表
  type: 'system' | 'custom'     // 类型
}
```

### 在线歌单引用 (CollectedPlaylist)

```typescript
interface CollectedPlaylist {
  id: string                    // 歌单 ID
  name: string                  // 歌单名称
  creator: {
    userId: string
    nickname: string
  }
  coverImgUrl: string           // 封面
  trackCount: number            // 歌曲数量
  playCount: number             // 播放次数
  description: string           // 描述
  addTime: number               // 收藏时间戳
  tags: string[]                // 标签
}
```

### 下载任务 (DownloadTask)

```typescript
interface DownloadTask {
  id: string                    // 任务 ID
  songId: string                // 歌曲 ID
  songName: string              // 歌曲名称
  status: 'pending' | 'downloading' | 'completed' | 'failed' | 'cancelled'
  progress: number              // 进度 (0-100)
  downloadedSize: number        // 已下载大小
  totalSize: number             // 总大小
  speed: number                 // 下载速度 (bytes/s)
  error?: string                // 错误信息
  startTime: number             // 开始时间
  endTime?: number              // 结束时间
}
```

### 文件存储格式

#### favorites.json

```json
{
  "version": "1.0",
  "id": "local-favorites",
  "name": "我喜欢的音乐",
  "createTime": 1701234567890,
  "updateTime": 1701234567890,
  "songs": [
    {
      "id": "123456",
      "name": "歌曲名",
      "artists": [{"id": "111", "name": "歌手"}],
      "album": {"id": "222", "name": "专辑", "picUrl": "..."},
      "duration": 240000,
      "addTime": 1701234567890
    }
  ]
}
```

#### downloads.json

```json
{
  "version": "1.0",
  "id": "local-downloads",
  "name": "已下载",
  "createTime": 1701234567890,
  "updateTime": 1701234567890,
  "songs": [
    {
      "id": "123456",
      "name": "歌曲名",
      "artists": [{"id": "111", "name": "歌手"}],
      "album": {"id": "222", "name": "专辑", "picUrl": "..."},
      "duration": 240000,
      "downloadTime": 1701234567890,
      "localPath": "downloads/songs/123456.mp3",
      "fileSize": 10485760,
      "quality": "320000"
    }
  ]
}
```

#### custom-playlists.json

```json
{
  "version": "1.0",
  "playlists": [
    {
      "id": "custom-1701234567890",
      "name": "跑步专用",
      "description": "适合跑步听的歌",
      "coverUrl": "",
      "createTime": 1701234567890,
      "updateTime": 1701234567890,
      "songs": [...]
    }
  ]
}
```

#### collected-playlists.json

```json
{
  "version": "1.0",
  "playlists": [
    {
      "id": "789012",
      "name": "华语经典",
      "creator": {"userId": "xxx", "nickname": "创建者"},
      "coverImgUrl": "...",
      "trackCount": 50,
      "playCount": 10000,
      "description": "歌单描述",
      "addTime": 1701234567890,
      "tags": ["流行", "华语"]
    }
  ]
}
```

## 正确性属性

*属性是一个特征或行为，应该在系统的所有有效执行中保持为真——本质上是关于系统应该做什么的正式陈述。属性作为人类可读规范和机器可验证正确性保证之间的桥梁。*


### 属性反思

在编写正确性属性之前，我们需要识别并消除冗余：

**识别的冗余：**
1. 属性 1.4（持久化到文件）和 9.1（立即写入文件）测试相同的行为
2. 属性 6.3 和 8.1 都测试下载完成后添加到"已下载"歌单
3. 属性 1.5 和 9.2 都测试应用启动时加载数据

**合并策略：**
- 将 1.4 和 9.1 合并为一个通用的持久化属性
- 将 6.3 和 8.1 合并为下载完成后的自动添加属性
- 将 1.5 和 9.2 合并为数据加载往返属性

### 正确性属性

**属性 1：喜欢添加的完整性**
*对于任何*歌曲，当添加到"我喜欢的音乐"后，查询该歌单应该包含该歌曲
**验证需求：1.1**

**属性 2：喜欢移除的往返性**
*对于任何*歌曲，添加到喜欢然后移除，歌单应该回到原始状态
**验证需求：1.2**

**属性 3：喜欢查询的一致性**
*对于任何*喜欢的歌曲集合，查询"我喜欢的音乐"应该返回完全相同的集合
**验证需求：1.3**

**属性 4：数据持久化的往返性**
*对于任何*歌单操作（添加、删除、更新），操作后从文件重新加载应该反映最新状态
**验证需求：1.4, 9.1, 9.2**

**属性 5：歌单 ID 的唯一性**
*对于任何*创建的歌单集合，所有歌单 ID 应该互不相同
**验证需求：2.1**

**属性 6：歌单更新的正确性**
*对于任何*歌单和新的名称/描述，更新后查询应该返回新值
**验证需求：2.2**

**属性 7：自定义歌单删除的有效性**
*对于任何*自定义歌单，删除后查询歌单列表应该不再包含该歌单
**验证需求：2.3**

**属性 8：系统歌单的不可删除性**
*对于任何*系统歌单（local-favorites, local-downloads），尝试删除应该失败且歌单仍然存在
**验证需求：2.4**

**属性 9：歌单列表的完整性**
*对于任何*创建的 N 个自定义歌单，查询应该返回 2 个系统歌单 + N 个自定义歌单
**验证需求：2.5**

**属性 10：歌曲元数据的完整性**
*对于任何*添加到歌单的歌曲，查询该歌单应该包含歌曲的所有元数据字段（id, name, artists, album, duration）
**验证需求：3.1**

**属性 11：歌曲添加的幂等性**
*对于任何*歌曲和歌单，添加同一首歌曲两次，歌单长度应该只增加 1
**验证需求：3.2**

**属性 12：歌曲移除的有效性**
*对于任何*歌单中的歌曲，移除后查询该歌单应该不再包含该歌曲
**验证需求：3.3**

**属性 13：添加时间戳的存在性**
*对于任何*添加到歌单的歌曲，其 addTime 字段应该存在且为有效的时间戳
**验证需求：3.4**

**属性 14：批量添加的去重性**
*对于任何*包含重复歌曲的列表，批量添加后歌单应该只包含唯一的歌曲
**验证需求：3.5**

**属性 15：在线歌单收藏的持久性**
*对于任何*在线歌单，收藏后查询收藏列表应该包含该歌单的基本信息
**验证需求：4.1**

**属性 16：在线歌单取消收藏的往返性**
*对于任何*在线歌单，收藏然后取消收藏，收藏列表应该回到原始状态
**验证需求：4.2**

**属性 17：收藏列表的一致性**
*对于任何*收藏的在线歌单集合，查询应该返回完全相同的集合
**验证需求：4.3**

**属性 18：歌单合并的完整性**
*对于任何*两个歌单 A 和 B，将 A 合并到 B 后，B 应该包含原有歌曲 + A 的所有歌曲（去重后）
**验证需求：4.5, 5.1**

**属性 19：歌单合并的去重性**
*对于任何*包含重复歌曲的两个歌单，合并后不应该有重复歌曲
**验证需求：5.2**

**属性 20：合并统计的准确性**
*对于任何*合并操作，返回的新增数量和跳过数量之和应该等于源歌单的歌曲总数
**验证需求：5.4**

**属性 21：下载完成后的自动添加**
*对于任何*下载完成的歌曲，查询"已下载"歌单应该包含该歌曲
**验证需求：6.3, 8.1**

**属性 22：下载取消的清理性**
*对于任何*进行中的下载任务，取消后未完成的文件应该被删除
**验证需求：6.6**

**属性 23：重复下载的幂等性**
*对于任何*已下载的歌曲，再次下载应该被跳过
**验证需求：6.7**

**属性 24：批量下载的完整性**
*对于任何*歌曲列表，批量下载应该处理所有歌曲（成功或失败）
**验证需求：7.2**

**属性 25：批量下载的错误隔离**
*对于任何*批量下载任务，部分歌曲失败不应该阻止其他歌曲下载
**验证需求：7.4**

**属性 26：批量下载统计的准确性**
*对于任何*批量下载结果，成功数量 + 失败数量应该等于总歌曲数量
**验证需求：7.5**

**属性 27：已下载歌单的信息完整性**
*对于任何*已下载的歌曲，查询应该返回完整的本地文件信息（localPath, fileSize, quality）
**验证需求：8.2**

**属性 28：本地播放的路径正确性**
*对于任何*"已下载"歌单中的歌曲，播放时应该使用本地文件路径而非 API 链接
**验证需求：8.3**

**属性 29：删除的同步性**
*对于任何*已下载的歌曲，从"已下载"歌单删除后，本地文件应该不存在
**验证需求：8.4**

**属性 30：磁盘空间计算的准确性**
*对于任何*已下载的歌曲集合，总占用空间应该等于所有文件大小之和
**验证需求：8.5**

**属性 31：路径验证的安全性**
*对于任何*包含路径遍历字符（如 ../）的文件路径，系统应该拒绝操作
**验证需求：10.5**

## 错误处理

### 文件系统错误

1. **文件不存在**：首次启动时创建默认数据文件
2. **文件损坏**：捕获 JSON 解析错误，记录日志，使用空数据初始化
3. **磁盘空间不足**：下载前检查可用空间，不足时提示用户
4. **权限错误**：捕获文件读写权限错误，提示用户检查权限

### 网络错误

1. **API 请求失败**：重试机制（最多 3 次），失败后提示用户
2. **下载中断**：支持断点续传，保存已下载的部分
3. **超时**：设置合理的超时时间，超时后标记任务失败

### 数据错误

1. **歌曲 ID 无效**：验证 ID 格式，无效时拒绝操作
2. **重复操作**：检测重复（如重复添加），跳过并提示用户
3. **数据版本不匹配**：检查 version 字段，执行数据迁移

### IPC 错误

1. **通信失败**：捕获 IPC 异常，返回错误信息给渲染进程
2. **参数验证**：验证所有 IPC 参数的类型和格式
3. **路径安全**：验证文件路径，防止路径遍历攻击

### 错误响应格式

所有 IPC 接口返回统一的错误格式：

```typescript
interface Result<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
}
```

## 测试策略

### 单元测试

**主进程模块测试：**
- FileManager：测试文件读写、目录创建、文件删除等基本操作
- PlaylistManager：测试歌单 CRUD、歌曲添加/删除、合并等业务逻辑
- DownloadManager：测试下载任务创建、取消、进度更新等

**测试工具：**
- 使用 Jest 作为测试框架
- 使用 mock-fs 模拟文件系统
- 使用 nock 模拟 HTTP 请求

**测试覆盖：**
- 正常流程：基本的 CRUD 操作
- 边界情况：空列表、单个元素、大量数据
- 错误情况：文件不存在、权限错误、网络错误

### 属性测试

**属性测试库：**
- 使用 fast-check 进行属性测试
- 每个属性测试运行至少 100 次迭代

**测试策略：**
- 为每个正确性属性编写对应的属性测试
- 使用随机生成器生成测试数据（歌曲、歌单、文件路径等）
- 验证属性在所有随机输入下都成立

**生成器设计：**
```javascript
// 歌曲生成器
const songArbitrary = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  artists: fc.array(fc.record({
    id: fc.string(),
    name: fc.string()
  }), { minLength: 1, maxLength: 5 }),
  album: fc.record({
    id: fc.string(),
    name: fc.string(),
    picUrl: fc.webUrl()
  }),
  duration: fc.integer({ min: 1000, max: 600000 })
})

// 歌单生成器
const playlistArbitrary = fc.record({
  id: fc.string(),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  description: fc.option(fc.string()),
  songs: fc.array(songArbitrary, { maxLength: 100 })
})
```

**属性测试标记：**
每个属性测试必须使用注释标记对应的设计文档属性：
```javascript
// **Feature: local-music-management, Property 1: 喜欢添加的完整性**
test('adding a song to favorites makes it appear in favorites list', () => {
  fc.assert(fc.property(songArbitrary, async (song) => {
    // 测试逻辑
  }), { numRuns: 100 })
})
```

### 集成测试

**IPC 通信测试：**
- 测试渲染进程与主进程的完整通信流程
- 使用 Spectron 或 Playwright 进行 E2E 测试

**文件系统集成：**
- 在临时目录中测试实际的文件读写
- 测试数据持久化和加载的完整流程

### 测试数据管理

**测试隔离：**
- 每个测试使用独立的临时目录
- 测试结束后清理所有临时文件

**测试数据：**
- 使用 fixture 提供标准测试数据
- 使用随机生成器创建多样化的测试场景

## 性能考虑

### 文件 I/O 优化

1. **防抖写入**：使用防抖机制，避免频繁写入文件（延迟 500ms）
2. **批量操作**：批量添加歌曲时，一次性写入文件
3. **异步操作**：所有文件操作使用异步 API，避免阻塞主进程

### 内存管理

1. **懒加载**：只在需要时加载歌单数据
2. **数据分页**：大型歌单支持分页加载
3. **缓存策略**：在内存中缓存常用数据，减少文件读取

### 下载优化

1. **并发控制**：限制同时下载的任务数量（最多 3 个）
2. **队列管理**：使用队列管理下载任务，按顺序处理
3. **断点续传**：支持下载中断后继续，避免重复下载

### 性能指标

- 文件读取：< 100ms
- 文件写入：< 200ms
- 歌单加载：< 500ms（1000 首歌曲）
- 下载速度：取决于网络，但应该接近带宽上限

## 安全考虑

### 路径安全

1. **路径验证**：验证所有文件路径，拒绝包含 `../` 的路径
2. **路径规范化**：使用 `path.normalize()` 和 `path.resolve()` 规范化路径
3. **白名单机制**：只允许访问 userData 目录下的文件

### 数据验证

1. **输入验证**：验证所有来自渲染进程的输入
2. **类型检查**：使用 TypeScript 或运行时类型检查
3. **SQL 注入防护**：虽然使用 JSON 而非数据库，但仍需防止恶意数据

### IPC 安全

1. **contextBridge**：使用 contextBridge 暴露 API，避免直接暴露 Node.js API
2. **最小权限**：只暴露必要的功能，不暴露底层文件系统 API
3. **参数验证**：验证所有 IPC 参数，防止注入攻击

## 部署和维护

### 数据迁移

当数据格式变更时，需要提供迁移脚本：

```javascript
async function migrateData(oldVersion, newVersion) {
  if (oldVersion === '1.0' && newVersion === '1.1') {
    // 执行 1.0 到 1.1 的迁移
    // 例如：添加新字段、重命名字段等
  }
}
```

### 备份和恢复

1. **自动备份**：每次写入前备份旧文件（保留最近 3 个版本）
2. **手动备份**：提供导出功能，允许用户备份数据
3. **恢复功能**：提供导入功能，允许用户恢复数据

### 日志记录

1. **操作日志**：记录所有文件操作（创建、更新、删除）
2. **错误日志**：记录所有错误和异常
3. **性能日志**：记录关键操作的耗时

### 监控指标

1. **文件大小**：监控数据文件大小，防止无限增长
2. **磁盘空间**：监控下载目录的磁盘占用
3. **错误率**：监控文件操作的失败率

const { app, BrowserWindow, Menu, ipcMain, protocol } = require('electron')
const path = require('path')
const fs = require('fs')
const isDev = require('electron-is-dev')
const FileManager = require('./lib/FileManager')
const PlaylistManager = require('./lib/PlaylistManager')
const DownloadManager = require('./lib/DownloadManager')

// 在 app ready 之前注册自定义协议
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'local-audio',
    privileges: {
      bypassCSP: true,
      supportFetchAPI: true,
      stream: true,
      standard: true,
      secure: true
    }
  }
])

let mainWindow
let fileManager
let playlistManager
let downloadManager

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    frame: false, // 隐藏默认标题栏
    icon: path.join(__dirname, 'assets/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false
    }
  })

  const startUrl = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, '../dist/index.html')}`

  mainWindow.loadURL(startUrl)

  // 开发模式下自动打开开发者工具
  if (isDev) {
    mainWindow.webContents.openDevTools()
  }

  // 创建菜单
  createMenu()

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function createMenu() {
  const template = [
    {
      label: '文件',
      submenu: [
        {
          label: '退出',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit()
          }
        }
      ]
    },
    {
      label: '编辑',
      submenu: [
        { label: '撤销', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: '重做', accelerator: 'CmdOrCtrl+Y', role: 'redo' },
        { type: 'separator' },
        { label: '剪切', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: '复制', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: '粘贴', accelerator: 'CmdOrCtrl+V', role: 'paste' }
      ]
    },
    {
      label: '查看',
      submenu: [
        {
          label: '开发者工具',
          accelerator: 'F12',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.toggleDevTools()
            }
          }
        },
        { type: 'separator' },
        { label: '刷新', accelerator: 'F5', role: 'reload' },
        { label: '强制刷新', accelerator: 'CmdOrCtrl+Shift+R', role: 'forceReload' },
        { label: '全屏', accelerator: 'F11', role: 'togglefullscreen' }
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '关于',
          click: () => {
            console.log('Smusic v1.0.0')
          }
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

// IPC 事件处理
ipcMain.handle('get-app-version', () => {
  return app.getVersion()
})

ipcMain.handle('get-app-path', () => {
  return app.getAppPath()
})

ipcMain.handle('get-user-data-path', () => {
  return app.getPath('userData')
})

// 窗口控制
ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize()
})

ipcMain.on('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow.maximize()
    }
  }
})

ipcMain.on('window-close', () => {
  if (mainWindow) mainWindow.close()
})

// 初始化管理器
async function initializeManagers() {
  const userDataPath = app.getPath('userData')
  // 下载路径改为项目根目录的 downloads 文件夹
  const downloadPath = path.join(__dirname, 'downloads')
  
  fileManager = new FileManager(userDataPath)
  await fileManager.initDataDirectory()
  
  playlistManager = new PlaylistManager(fileManager)
  downloadManager = new DownloadManager(fileManager, playlistManager, downloadPath)
  
  // 初始化默认数据文件（如果不存在）
  await initializeDefaultData()
}

// 初始化默认数据文件
async function initializeDefaultData() {
  try {
    // 检查并创建 favorites.json
    const favoritesExists = await fileManager.fileExists('favorites.json')
    if (!favoritesExists.data) {
      const defaultFavorites = {
        version: '1.0',
        id: 'local-favorites',
        name: '我喜欢的音乐',
        createTime: Date.now(),
        updateTime: Date.now(),
        songs: []
      }
      await fileManager.writeJSON('favorites.json', defaultFavorites)
    }
    
    // 检查并创建 downloads.json
    const downloadsExists = await fileManager.fileExists('downloads.json')
    if (!downloadsExists.data) {
      const defaultDownloads = {
        version: '1.0',
        id: 'local-downloads',
        name: '已下载',
        createTime: Date.now(),
        updateTime: Date.now(),
        songs: []
      }
      await fileManager.writeJSON('downloads.json', defaultDownloads)
    }
    
    // 检查并创建 custom-playlists.json
    const customPlaylistsExists = await fileManager.fileExists('custom-playlists.json')
    if (!customPlaylistsExists.data) {
      const defaultCustomPlaylists = {
        version: '1.0',
        playlists: []
      }
      await fileManager.writeJSON('custom-playlists.json', defaultCustomPlaylists)
    }
    
    // 检查并创建 collected-playlists.json
    const collectedPlaylistsExists = await fileManager.fileExists('collected-playlists.json')
    if (!collectedPlaylistsExists.data) {
      const defaultCollectedPlaylists = {
        version: '1.0',
        playlists: []
      }
      await fileManager.writeJSON('collected-playlists.json', defaultCollectedPlaylists)
    }
  } catch (error) {
    // 初始化失败
  }
}

// 统一错误响应格式
function createResponse(success, data = null, error = null) {
  return {
    success,
    data,
    error: error ? {
      code: error.code || 'UNKNOWN_ERROR',
      message: error.message || '未知错误',
      details: error.details || null
    } : null
  }
}

// 参数验证辅助函数
function validateParams(params, requiredFields) {
  for (const field of requiredFields) {
    if (params[field] === undefined || params[field] === null) {
      throw new Error(`缺少必需参数: ${field}`)
    }
  }
}

// 注册 IPC 处理器
function registerIpcHandlers() {
  // ==================== 我喜欢的音乐 ====================
  ipcMain.handle('add-to-favorites', async (event, song) => {
    try {
      validateParams({ song }, ['song'])
      validateParams(song, ['id', 'name', 'artists', 'album', 'duration'])
      
      const result = await playlistManager.addToFavorites(song)
      return createResponse(true, result)
    } catch (error) {
      return createResponse(false, null, error)
    }
  })

  ipcMain.handle('remove-from-favorites', async (event, songId) => {
    try {
      validateParams({ songId }, ['songId'])
      
      const result = await playlistManager.removeFromFavorites(songId)
      return createResponse(true, result)
    } catch (error) {
      return createResponse(false, null, error)
    }
  })

  ipcMain.handle('get-favorites', async () => {
    try {
      const result = await playlistManager.getFavorites()
      return result  // playlistManager 已经返回标准格式，直接返回
    } catch (error) {
      return createResponse(false, null, error)
    }
  })

  ipcMain.handle('is-favorite', async (event, songId) => {
    try {
      validateParams({ songId }, ['songId'])
      
      const result = await playlistManager.isFavorite(songId)
      return createResponse(true, result)
    } catch (error) {
      return createResponse(false, null, error)
    }
  })

  // ==================== 自定义歌单 ====================
  ipcMain.handle('create-playlist', async (event, { name, description }) => {
    try {
      validateParams({ name }, ['name'])
      
      const result = await playlistManager.createPlaylist(name, description)
      return result  // playlistManager 已经返回标准格式，直接返回
    } catch (error) {
      return createResponse(false, null, error)
    }
  })

  ipcMain.handle('update-playlist', async (event, { playlistId, ...data }) => {
    try {
      validateParams({ playlistId }, ['playlistId'])
      
      const result = await playlistManager.updatePlaylist(playlistId, data)
      return result  // playlistManager 已经返回标准格式，直接返回
    } catch (error) {
      return createResponse(false, null, error)
    }
  })

  ipcMain.handle('delete-playlist', async (event, playlistId) => {
    try {
      validateParams({ playlistId }, ['playlistId'])
      
      const result = await playlistManager.deletePlaylist(playlistId)
      return result  // playlistManager 已经返回标准格式，直接返回
    } catch (error) {
      return createResponse(false, null, error)
    }
  })

  ipcMain.handle('get-custom-playlists', async () => {
    try {
      const result = await playlistManager.getCustomPlaylists()
      return result  // playlistManager 已经返回标准格式，直接返回
    } catch (error) {
      return createResponse(false, null, error)
    }
  })

  // ==================== 歌曲操作 ====================
  ipcMain.handle('add-song-to-playlist', async (event, { playlistId, song }) => {
    try {
      validateParams({ playlistId, song }, ['playlistId', 'song'])
      validateParams(song, ['id', 'name', 'artists', 'album', 'duration'])
      
      const result = await playlistManager.addSongToPlaylist(playlistId, song)
      return createResponse(true, result)
    } catch (error) {
      return createResponse(false, null, error)
    }
  })

  ipcMain.handle('remove-song-from-playlist', async (event, { playlistId, songId }) => {
    try {
      validateParams({ playlistId, songId }, ['playlistId', 'songId'])
      
      const result = await playlistManager.removeSongFromPlaylist(playlistId, songId)
      return createResponse(true, result)
    } catch (error) {
      return createResponse(false, null, error)
    }
  })

  ipcMain.handle('add-songs-to-playlist', async (event, { playlistId, songs }) => {
    try {
      validateParams({ playlistId, songs }, ['playlistId', 'songs'])
      
      if (!Array.isArray(songs)) {
        throw new Error('songs 必须是数组')
      }
      
      const result = await playlistManager.addSongsToPlaylist(playlistId, songs)
      return createResponse(true, result)
    } catch (error) {
      return createResponse(false, null, error)
    }
  })

  // ==================== 歌单合并 ====================
  ipcMain.handle('merge-playlist', async (event, { targetId, sourceId, sourceSongs }) => {
    try {
      validateParams({ targetId }, ['targetId'])
      
      const result = await playlistManager.mergePlaylist(targetId, sourceId, sourceSongs)
      return createResponse(true, result)
    } catch (error) {
      return createResponse(false, null, error)
    }
  })

  // ==================== 在线歌单收藏 ====================
  ipcMain.handle('collect-online-playlist', async (event, playlist) => {
    try {
      validateParams({ playlist }, ['playlist'])
      validateParams(playlist, ['id', 'name'])
      
      const result = await playlistManager.collectOnlinePlaylist(playlist)
      return result  // playlistManager 已经返回标准格式，直接返回
    } catch (error) {
      return createResponse(false, null, error)
    }
  })

  ipcMain.handle('uncollect-online-playlist', async (event, playlistId) => {
    try {
      validateParams({ playlistId }, ['playlistId'])
      
      const result = await playlistManager.uncollectOnlinePlaylist(playlistId)
      return result  // playlistManager 已经返回标准格式，直接返回
    } catch (error) {
      return createResponse(false, null, error)
    }
  })

  ipcMain.handle('get-collected-playlists', async () => {
    try {
      const result = await playlistManager.getCollectedPlaylists()
      return result  // playlistManager 已经返回标准格式，直接返回
    } catch (error) {
      return createResponse(false, null, error)
    }
  })

  // ==================== 已下载歌单 ====================
  ipcMain.handle('get-downloads', async () => {
    try {
      const result = await playlistManager.getDownloads()
      return result  // playlistManager 已经返回标准格式，直接返回
    } catch (error) {
      return createResponse(false, null, error)
    }
  })

  ipcMain.handle('remove-from-downloads', async (event, songId) => {
    try {
      validateParams({ songId }, ['songId'])
      
      const result = await playlistManager.removeFromDownloads(songId)
      return createResponse(true, result)
    } catch (error) {
      return createResponse(false, null, error)
    }
  })

  // ==================== 下载功能 ====================
  ipcMain.handle('download-song', async (event, params) => {
    try {
      const { songId, songUrl, metadata } = params
      
      validateParams({ songId, songUrl, metadata }, ['songId', 'songUrl', 'metadata'])
      
      const result = await downloadManager.downloadSong(songId, songUrl, metadata)
      
      // 注意：不要在这里重复调用 addToDownloads
      // DownloadManager 的 _executeDownload 方法已经在下载完成后调用了
      
      return createResponse(true, result)
    } catch (error) {
      return createResponse(false, null, error)
    }
  })

  ipcMain.handle('download-playlist', async (event, songs) => {
    try {
      validateParams({ songs }, ['songs'])
      
      if (!Array.isArray(songs)) {
        throw new Error('songs 必须是数组')
      }
      
      const result = await downloadManager.downloadPlaylist(songs, (progress) => {
        // 发送进度更新到渲染进程
        if (mainWindow) {
          mainWindow.webContents.send('download-progress', progress)
        }
      })
      
      return createResponse(true, result)
    } catch (error) {
      return createResponse(false, null, error)
    }
  })

  ipcMain.handle('cancel-download', async (event, taskId) => {
    try {
      validateParams({ taskId }, ['taskId'])
      
      const result = await downloadManager.cancelDownload(taskId)
      return createResponse(true, result)
    } catch (error) {
      return createResponse(false, null, error)
    }
  })

  ipcMain.handle('pause-download', async (event, taskId) => {
    try {
      validateParams({ taskId }, ['taskId'])
      
      const result = await downloadManager.pauseDownload(taskId)
      return createResponse(true, result)
    } catch (error) {
      return createResponse(false, null, error)
    }
  })

  ipcMain.handle('resume-download', async (event, taskId) => {
    try {
      validateParams({ taskId }, ['taskId'])
      
      const result = await downloadManager.resumeDownload(taskId)
      return createResponse(true, result)
    } catch (error) {
      return createResponse(false, null, error)
    }
  })

  // ==================== 获取本地歌曲路径 ====================
  ipcMain.handle('get-local-song-path', async (event, songId) => {
    try {
      validateParams({ songId }, ['songId'])
      
      const result = await playlistManager.getLocalSongPath(songId)
      
      if (!result.success) {
        return result
      }
      
      return createResponse(true, result.data)
    } catch (error) {
      return createResponse(false, null, error)
    }
  })

  // ==================== 读取本地音频文件 ====================
  ipcMain.handle('read-local-audio', async (event, filePath) => {
    try {
      validateParams({ filePath }, ['filePath'])
      
      // 检查文件是否存在
      if (!fs.existsSync(filePath)) {
        return createResponse(false, null, { message: '文件不存在' })
      }
      
      // 读取文件为 Buffer
      const buffer = fs.readFileSync(filePath)
      
      // 返回 Buffer（会自动转换为 Uint8Array）
      return createResponse(true, {
        buffer: buffer,
        size: buffer.length
      })
    } catch (error) {
      return createResponse(false, null, error)
    }
  })

  // ==================== 磁盘空间检查 ====================
  ipcMain.handle('check-disk-space', async () => {
    try {
      const userDataPath = app.getPath('userData')
      const result = await fileManager.getDiskSpace(userDataPath)
      
      if (result.success) {
        return createResponse(true, result.data)
      } else {
        return createResponse(false, null, result.error)
      }
    } catch (error) {
      return createResponse(false, null, error)
    }
  })

  // ==================== 获取下载目录大小 ====================
  ipcMain.handle('get-downloads-size', async () => {
    try {
      const downloadsDir = path.join(app.getPath('userData'), 'downloads')
      const result = await fileManager.getDirectorySize(downloadsDir)
      
      if (result.success) {
        return createResponse(true, result.data)
      } else {
        return createResponse(false, null, result.error)
      }
    } catch (error) {
      return createResponse(false, null, error)
    }
  })
}

app.on('ready', async () => {
  // 注册自定义协议用于加载本地音频文件
  protocol.registerStreamProtocol('local-audio', (request, callback) => {
    const url = request.url.replace('local-audio://', '')
    try {
      // 解码 URL 并规范化路径
      const decodedPath = decodeURIComponent(url)
      const normalizedPath = path.normalize(decodedPath)
      
      // 检查文件是否存在
      if (fs.existsSync(normalizedPath)) {
        // 使用流式传输
        const stream = fs.createReadStream(normalizedPath)
        callback({
          statusCode: 200,
          headers: {
            'Content-Type': 'audio/mpeg',
            'Accept-Ranges': 'bytes'
          },
          data: stream
        })
      } else {
        callback({ statusCode: 404 })
      }
    } catch (error) {
      callback({ statusCode: 500 })
    }
  })
  
  await initializeManagers()
  registerIpcHandlers()
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

// 应用退出前保存所有未写入的数据
app.on('before-quit', async (event) => {
  if (fileManager) {
    event.preventDefault()
    
    try {
      await fileManager.shutdown()
    } catch (error) {
      // 保存数据失败
    }
    
    // 允许应用退出
    app.exit(0)
  }
})

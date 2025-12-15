const { app, BrowserWindow, Menu, ipcMain, protocol, Tray, nativeImage, globalShortcut } = require('electron')
const path = require('path')
const fs = require('fs')
const isDev = require('electron-is-dev')
const { spawn } = require('child_process')
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
let desktopLyricWindow = null
let tray = null
let fileManager
let playlistManager
let downloadManager
let apiServerProcess = null
let registeredShortcuts = new Map() // 存储已注册的快捷键
let trayMenuState = {
  isPlaying: false,
  desktopLyricVisible: false
} // 托盘菜单状态

// 单实例锁定
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  // 如果没有获取到锁，说明已经有实例在运行，直接退出
  app.quit()
} else {
  // 当第二个实例尝试启动时，触发此事件
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // 如果主窗口存在，显示并聚焦
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore()
      }
      if (!mainWindow.isVisible()) {
        mainWindow.show()
      }
      mainWindow.focus()
    }
  })
}

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
    : `file://${path.join(__dirname, 'dist/index.html')}`

  mainWindow.loadURL(startUrl)

  // 开发模式下自动打开开发者工具
  if (isDev) {
    mainWindow.webContents.openDevTools()
  }

  // 创建菜单
  createMenu()

  // 监听窗口最大化事件
  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('window-state-change', { isMaximized: true })
  })

  // 监听窗口还原事件
  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('window-state-change', { isMaximized: false })
  })

  // 监听窗口关闭事件
  mainWindow.on('close', (event) => {
    // 如果是强制退出，直接关闭
    if (app.isQuitting) {
      return
    }
    
    // 先阻止默认关闭行为
    event.preventDefault()
    
    // 读取用户设置的关闭行为
    mainWindow.webContents.executeJavaScript(
      'localStorage.getItem("close-action")'
    ).then(closeAction => {
      if (closeAction === 'minimize-to-tray') {
        // 最小化到托盘
        mainWindow.hide()
        
        // 如果托盘还没创建，创建托盘
        if (!tray) {
          createTray()
        }
      } else {
        // 正常关闭应用
        app.isQuitting = true
        mainWindow.close()
      }
    }).catch(err => {
      console.error('读取关闭行为设置失败:', err)
      // 出错时默认关闭应用
      app.isQuitting = true
      mainWindow.close()
    })
  })

  mainWindow.on('closed', () => {
    mainWindow = null
    
    // 关闭桌面歌词窗口
    if (desktopLyricWindow) {
      desktopLyricWindow.close()
      desktopLyricWindow = null
    }
    
    // 销毁托盘图标
    if (tray) {
      tray.destroy()
      tray = null
    }
  })
}

// 创建系统托盘
function createTray() {
  if (tray) return
  
  // 创建托盘图标
  const iconPath = path.join(__dirname, 'assets/icon.png')
  const icon = nativeImage.createFromPath(iconPath)
  tray = new Tray(icon.resize({ width: 16, height: 16 }))
  
  // 设置托盘提示
  tray.setToolTip('Smusic')
  
  // 创建托盘菜单
  updateTrayMenu()
  
  // 单击托盘图标显示窗口（Windows）
  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide()
      } else {
        mainWindow.show()
        mainWindow.focus()
      }
    }
  })
  
  // 双击托盘图标显示窗口（macOS/Linux）
  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show()
      mainWindow.focus()
    }
  })
}

// 更新托盘菜单
function updateTrayMenu() {
  if (!tray) return
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示主窗口',
      click: () => {
        if (mainWindow) {
          mainWindow.show()
          mainWindow.focus()
        }
      }
    },
    {
      type: 'separator'
    },
    {
      label: trayMenuState.isPlaying ? '暂停' : '播放',
      click: () => {
        if (mainWindow) {
          mainWindow.webContents.send('tray-control', 'toggle-play')
        }
      }
    },
    {
      label: '上一首',
      click: () => {
        if (mainWindow) {
          mainWindow.webContents.send('tray-control', 'previous')
        }
      }
    },
    {
      label: '下一首',
      click: () => {
        if (mainWindow) {
          mainWindow.webContents.send('tray-control', 'next')
        }
      }
    },
    {
      type: 'separator'
    },
    {
      label: trayMenuState.desktopLyricVisible ? '隐藏桌面歌词' : '显示桌面歌词',
      click: () => {
        if (trayMenuState.desktopLyricVisible) {
          if (desktopLyricWindow) {
            desktopLyricWindow.close()
            desktopLyricWindow = null
          }
        } else {
          createDesktopLyricWindow()
        }
      }
    },
    {
      type: 'separator'
    },
    {
      label: '退出',
      click: () => {
        app.isQuitting = true
        app.quit()
      }
    }
  ])
  
  tray.setContextMenu(contextMenu)
}

// 创建桌面歌词窗口
async function createDesktopLyricWindow() {
  if (desktopLyricWindow) {
    desktopLyricWindow.focus()
    return
  }

  // 从主窗口的 localStorage 读取大小设置
  let lyricSize = 1.0
  if (mainWindow && mainWindow.webContents) {
    try {
      const sizeStr = await mainWindow.webContents.executeJavaScript(
        'localStorage.getItem("desktop-lyric-size")'
      )
      if (sizeStr) {
        lyricSize = parseFloat(sizeStr)
      }
    } catch (err) {
      console.error('读取歌词大小设置失败:', err)
    }
  }

  const baseWidth = 1000
  const baseHeight = 220

  desktopLyricWindow = new BrowserWindow({
    width: Math.round(baseWidth * lyricSize),
    height: Math.round(baseHeight * lyricSize),
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  const lyricUrl = isDev
    ? 'http://localhost:5173/desktop-lyric.html'
    : `file://${path.join(__dirname, 'dist/desktop-lyric.html')}`

  desktopLyricWindow.loadURL(lyricUrl)

  desktopLyricWindow.on('closed', () => {
    if (lyricHoverCheckInterval) {
      clearInterval(lyricHoverCheckInterval)
      lyricHoverCheckInterval = null
    }
    desktopLyricWindow = null
    trayMenuState.desktopLyricVisible = false
    updateTrayMenu()
  })
  
  // 启动鼠标悬停检测
  startLyricHoverCheck()
  
  // 通知主窗口同步当前播放状态和歌词到桌面歌词窗口
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('request-sync-to-desktop-lyric')
  }
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

// 打开外部链接
ipcMain.handle('open-external', async (event, url) => {
  try {
    const { shell } = require('electron')
    await shell.openExternal(url)
    return { success: true }
  } catch (error) {
    console.error('打开外部链接失败:', error)
    return { success: false, error: error.message }
  }
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

// 桌面歌词窗口控制
ipcMain.on('open-desktop-lyric', () => {
  createDesktopLyricWindow()
  trayMenuState.desktopLyricVisible = true
  updateTrayMenu()
})

ipcMain.on('close-desktop-lyric', () => {
  if (desktopLyricWindow) {
    desktopLyricWindow.close()
    desktopLyricWindow = null
  }
  trayMenuState.desktopLyricVisible = false
  updateTrayMenu()
})

ipcMain.on('set-desktop-lyric-lock', (event, locked) => {
  if (desktopLyricWindow) {
    desktopLyricWindow.setIgnoreMouseEvents(locked, { forward: true })
  }
})

// 桌面歌词窗口鼠标悬停检测
let lyricHoverCheckInterval = null

function startLyricHoverCheck() {
  if (lyricHoverCheckInterval) return
  
  lyricHoverCheckInterval = setInterval(() => {
    if (!desktopLyricWindow) {
      clearInterval(lyricHoverCheckInterval)
      lyricHoverCheckInterval = null
      return
    }
    
    const { screen } = require('electron')
    const point = screen.getCursorScreenPoint()
    const bounds = desktopLyricWindow.getBounds()
    
    const isInside = point.x >= bounds.x && 
                     point.x <= bounds.x + bounds.width &&
                     point.y >= bounds.y && 
                     point.y <= bounds.y + bounds.height
    
    if (desktopLyricWindow) {
      desktopLyricWindow.webContents.send('mouse-hover-state', isInside)
    }
  }, 100)
}

// 桌面歌词控制播放（从歌词窗口发送到主窗口）
ipcMain.on('desktop-lyric-control', (event, action) => {
  if (mainWindow) {
    mainWindow.webContents.send('desktop-lyric-control', action)
  }
})

// 主窗口同步播放状态到桌面歌词窗口
ipcMain.on('sync-player-state', (event, state) => {
  if (desktopLyricWindow) {
    desktopLyricWindow.webContents.send('player-state-update', state)
  }
})

// 同步歌词到桌面歌词窗口
ipcMain.on('sync-lyric', (event, lyricData) => {
  if (desktopLyricWindow) {
    desktopLyricWindow.webContents.send('lyric-update', lyricData)
  }
})

// 初始化管理器
async function initializeManagers() {
  const userDataPath = app.getPath('userData')
  
  fileManager = new FileManager(userDataPath)
  await fileManager.initDataDirectory()
  
  playlistManager = new PlaylistManager(fileManager)
  // 不传递 downloadPath，使用默认的 fileManager.songsDir
  downloadManager = new DownloadManager(fileManager, playlistManager)
  
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

// ==================== 全局快捷键管理 ====================
/**
 * 注册全局快捷键
 * @param {Object} shortcuts - 快捷键配置对象
 */
function registerGlobalShortcuts(shortcuts) {
  // 先注销所有已注册的快捷键
  unregisterAllShortcuts()
  
  if (!shortcuts || typeof shortcuts !== 'object') {
    return
  }

  // 遍历快捷键配置并注册
  for (const [action, config] of Object.entries(shortcuts)) {
    if (!config.enabled || !config.key) continue
    
    try {
      const success = globalShortcut.register(config.key, () => {
        // 发送到渲染进程
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('shortcut-triggered', action)
        }
      })
      
      if (success) {
        registeredShortcuts.set(action, config.key)
      } else {
        console.warn(`快捷键注册失败: ${action} -> ${config.key}`)
      }
    } catch (error) {
      console.error(`注册快捷键失败 ${action}:`, error)
    }
  }
}

/**
 * 注销所有快捷键
 */
function unregisterAllShortcuts() {
  globalShortcut.unregisterAll()
  registeredShortcuts.clear()
  console.log('已注销所有快捷键')
}

/**
 * 注销单个快捷键
 * @param {string} accelerator - 快捷键字符串
 */
function unregisterShortcut(accelerator) {
  if (accelerator) {
    globalShortcut.unregister(accelerator)
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

  // ==================== 获取本地歌词 ====================
  ipcMain.handle('get-local-lyric', async (event, songId) => {
    try {
      validateParams({ songId }, ['songId'])
      
      let lyricPath = null
      
      // 先从下载列表中查找
      const downloadsResult = await playlistManager.getDownloads()
      if (downloadsResult.success) {
        const songIdStr = String(songId)
        const downloadedSong = downloadsResult.data.songs.find(s => String(s.id) === songIdStr)
        if (downloadedSong && downloadedSong.lyricPath) {
          lyricPath = downloadedSong.lyricPath
        }
      }
      
      // 如果下载列表没找到，从本地音乐列表查找
      if (!lyricPath) {
        const localSongsResult = await playlistManager.getLocalSongs()
        if (localSongsResult.success) {
          const localSong = localSongsResult.data.songs.find(s => s.id === songId)
          if (localSong && localSong.lyricPath) {
            lyricPath = localSong.lyricPath
          }
        }
      }
      
      // 如果没有歌词路径，返回 null
      if (!lyricPath) {
        return {
          success: true,
          data: null
        }
      }
      
      // 读取歌词文件
      try {
        const fsPromises = require('fs').promises
        const lyricContent = await fsPromises.readFile(lyricPath, 'utf-8')
        return {
          success: true,
          data: lyricContent
        }
      } catch (error) {
        return {
          success: true,
          data: null
        }
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'GET_LOCAL_LYRIC_ERROR',
          message: '获取本地歌词失败',
          details: error.message
        }
      }
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

  // ==================== 打开下载目录 ====================
  ipcMain.handle('open-downloads-folder', async () => {
    try {
      const { shell } = require('electron')
      const downloadsDir = path.join(app.getPath('userData'), 'downloads')
      
      // 确保目录存在
      if (!fs.existsSync(downloadsDir)) {
        fs.mkdirSync(downloadsDir, { recursive: true })
      }
      
      // 打开文件夹
      await shell.openPath(downloadsDir)
      return createResponse(true, { path: downloadsDir })
    } catch (error) {
      return createResponse(false, null, error)
    }
  })

  // ==================== 本地音乐导入 ====================
  
  // 选择本地音频文件
  ipcMain.handle('select-local-audio-files', async () => {
    try {
      const { dialog } = require('electron')
      const result = await dialog.showOpenDialog(mainWindow, {
        title: '选择音频文件',
        properties: ['openFile', 'multiSelections'],
        filters: [
          { name: '音频文件', extensions: ['mp3', 'flac', 'wav', 'm4a', 'aac', 'ogg', 'wma'] },
          { name: '所有文件', extensions: ['*'] }
        ]
      })
      
      if (result.canceled) {
        return createResponse(true, { canceled: true, filePaths: [] })
      }
      
      return createResponse(true, { canceled: false, filePaths: result.filePaths })
    } catch (error) {
      return createResponse(false, null, error)
    }
  })

  // 选择歌词文件
  ipcMain.handle('select-lyric-file', async () => {
    try {
      const { dialog } = require('electron')
      const result = await dialog.showOpenDialog(mainWindow, {
        title: '选择歌词文件',
        properties: ['openFile'],
        filters: [
          { name: '歌词文件', extensions: ['lrc', 'txt'] },
          { name: '所有文件', extensions: ['*'] }
        ]
      })
      
      if (result.canceled) {
        return createResponse(true, { canceled: true, filePath: null })
      }
      
      return createResponse(true, { canceled: false, filePath: result.filePaths[0] })
    } catch (error) {
      return createResponse(false, null, error)
    }
  })

  // 获取音频文件元数据
  ipcMain.handle('get-audio-metadata', async (event, filePath) => {
    try {
      validateParams({ filePath }, ['filePath'])
      
      // 检查文件是否存在
      if (!fs.existsSync(filePath)) {
        return createResponse(false, null, { message: '文件不存在' })
      }
      
      // 使用 node-id3 读取元数据
      const NodeID3 = require('node-id3')
      const tags = NodeID3.read(filePath)
      
      // 获取文件大小
      const stats = fs.statSync(filePath)
      
      // 计算音频时长（如果有 TLEN 标签）
      let duration = 0
      if (tags.length) {
        // TLEN 是毫秒
        duration = parseInt(tags.length)
      }
      
      // 提取需要的信息
      const artistName = tags.artist || '未知艺术家'
      
      const songData = {
        name: tags.title || path.basename(filePath, path.extname(filePath)),
        artists: [{ name: artistName }],
        album: {
          name: tags.album || '未知专辑',
          picUrl: ''
        },
        duration: duration,
        fileSize: stats.size,
        localPath: filePath
      }
      
      return createResponse(true, songData)
    } catch (error) {
      // 如果读取元数据失败，返回基本信息
      try {
        const stats = fs.statSync(filePath)
        const songData = {
          name: path.basename(filePath, path.extname(filePath)),
          artists: [{ name: '未知艺术家' }],
          album: { name: '未知专辑', picUrl: '' },
          duration: 0,
          fileSize: stats.size,
          localPath: filePath
        }
        return createResponse(true, songData)
      } catch (err) {
        return createResponse(false, null, error)
      }
    }
  })

  // 添加本地歌曲
  ipcMain.handle('add-local-song', async (event, songData) => {
    try {
      validateParams({ songData }, ['songData'])
      
      const result = await playlistManager.addLocalSong(songData)
      
      if (!result.success) {
        return result
      }
      
      return createResponse(true, result.data)
    } catch (error) {
      return createResponse(false, null, error)
    }
  })

  // 批量添加本地歌曲
  ipcMain.handle('add-local-songs', async (event, songsData) => {
    try {
      validateParams({ songsData }, ['songsData'])
      
      const result = await playlistManager.addLocalSongs(songsData)
      
      if (!result.success) {
        return result
      }
      
      return createResponse(true, result.data)
    } catch (error) {
      return createResponse(false, null, error)
    }
  })

  // 更新歌曲歌词路径
  ipcMain.handle('update-song-lyric', async (event, songId, lyricPath) => {
    try {
      validateParams({ songId, lyricPath }, ['songId', 'lyricPath'])
      
      const result = await playlistManager.updateLocalSongLyric(songId, lyricPath)
      
      if (!result.success) {
        return result
      }
      
      return createResponse(true, result.data)
    } catch (error) {
      return createResponse(false, null, error)
    }
  })

  // 获取本地音乐列表
  ipcMain.handle('get-local-songs', async () => {
    try {
      const result = await playlistManager.getLocalSongs()
      
      if (!result.success) {
        return result
      }
      
      return createResponse(true, result.data)
    } catch (error) {
      return createResponse(false, null, error)
    }
  })

  // 移除本地歌曲
  ipcMain.handle('remove-local-song', async (event, songId) => {
    try {
      validateParams({ songId }, ['songId'])
      
      const result = await playlistManager.removeLocalSong(songId)
      
      if (!result.success) {
        return result
      }
      
      return createResponse(true, result.data)
    } catch (error) {
      return createResponse(false, null, error)
    }
  })

  // ==================== 全局快捷键 ====================
  ipcMain.handle('register-shortcuts', async (event, shortcuts) => {
    try {
      registerGlobalShortcuts(shortcuts)
      return createResponse(true, { registered: registeredShortcuts.size })
    } catch (error) {
      return createResponse(false, null, error)
    }
  })

  ipcMain.handle('unregister-shortcuts', async () => {
    try {
      unregisterAllShortcuts()
      return createResponse(true)
    } catch (error) {
      return createResponse(false, null, error)
    }
  })

  // ==================== 托盘菜单状态更新 ====================
  ipcMain.on('update-tray-state', (event, state) => {
    if (state.isPlaying !== undefined) {
      trayMenuState.isPlaying = state.isPlaying
    }
    if (state.desktopLyricVisible !== undefined) {
      trayMenuState.desktopLyricVisible = state.desktopLyricVisible
    }
    updateTrayMenu()
  })
}

// 启动 API 服务
function startApiServer() {
  // 开发环境和生产环境的路径不同
  const apiPath = isDev
    ? path.join(__dirname, 'services', 'api-enhanced', 'app.js')
    : path.join(process.resourcesPath, 'services', 'api-enhanced', 'app.js')
  
  const apiCwd = isDev
    ? path.join(__dirname, 'services', 'api-enhanced')
    : path.join(process.resourcesPath, 'services', 'api-enhanced')
  
  if (!fs.existsSync(apiPath)) {
    console.error('API 服务文件不存在:', apiPath)
    console.error('当前 __dirname:', __dirname)
    console.error('当前 resourcesPath:', process.resourcesPath)
    return
  }
  
  console.log('正在启动 API 服务...')
  console.log('API 路径:', apiPath)
  console.log('工作目录:', apiCwd)
  
  apiServerProcess = spawn('node', [apiPath], {
    cwd: apiCwd,
    stdio: 'pipe',
    windowsHide: true
  })
  
  // 捕获输出日志
  apiServerProcess.stdout.on('data', (data) => {
    console.log('[API服务]', data.toString())
  })
  
  apiServerProcess.stderr.on('data', (data) => {
    console.error('[API服务错误]', data.toString())
  })
  
  apiServerProcess.on('error', (err) => {
    console.error('API 服务启动失败:', err)
  })
  
  apiServerProcess.on('exit', (code) => {
    console.log('API 服务已退出，退出码:', code)
    apiServerProcess = null
  })
}

// 停止 API 服务
function stopApiServer() {
  if (apiServerProcess) {
    console.log('正在停止 API 服务...')
    apiServerProcess.kill()
    apiServerProcess = null
  }
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
  
  // 启动 API 服务
  startApiServer()
  
  await initializeManagers()
  registerIpcHandlers()
  createWindow()
})

app.on('window-all-closed', () => {
  // 如果有托盘且不是强制退出，不退出应用
  if (tray && !app.isQuitting) {
    return
  }
  
  // 注销所有快捷键
  unregisterAllShortcuts()
  
  stopApiServer()
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
  // 如果是强制退出，跳过
  if (app.isQuitting) {
    unregisterAllShortcuts()
    stopApiServer()
    return
  }
  
  unregisterAllShortcuts()
  stopApiServer()
  
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

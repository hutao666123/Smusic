const { contextBridge, ipcRenderer } = require('electron')

/**
 * 验证路径安全性，防止路径遍历攻击
 * @param {string} filePath - 要验证的文件路径
 * @returns {boolean} - 路径是否安全
 */
function isPathSafe(filePath) {
  if (!filePath || typeof filePath !== 'string') {
    return false
  }
  
  // 检查是否包含路径遍历字符
  const dangerousPatterns = [
    '../',
    '..\\',
    '..',
    '%2e%2e',
    '%252e%252e',
    '..%2f',
    '..%5c'
  ]
  
  const lowerPath = filePath.toLowerCase()
  return !dangerousPatterns.some(pattern => lowerPath.includes(pattern))
}

// 暴露安全的 API 到渲染进程
contextBridge.exposeInMainWorld('electron', {
  // 应用信息
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getAppPath: () => ipcRenderer.invoke('get-app-path'),
  getUserDataPath: () => ipcRenderer.invoke('get-user-data-path'),

  // 窗口控制
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  
  // 监听窗口状态变化
  onWindowStateChange: (callback) => {
    ipcRenderer.on('window-state-change', (event, state) => callback(state))
  },

  // 桌面歌词窗口控制
  openDesktopLyric: () => ipcRenderer.send('open-desktop-lyric'),
  closeDesktopLyric: () => ipcRenderer.send('close-desktop-lyric'),
  setDesktopLyricLock: (locked) => ipcRenderer.send('set-desktop-lyric-lock', locked),
  
  // 桌面歌词控制播放
  desktopLyricControl: (action) => ipcRenderer.send('desktop-lyric-control', action),
  
  // 同步播放状态到桌面歌词
  syncPlayerState: (state) => ipcRenderer.send('sync-player-state', state),
  
  // 同步歌词到桌面歌词
  syncLyric: (lyricData) => ipcRenderer.send('sync-lyric', lyricData),
  
  // 监听播放状态更新（桌面歌词窗口用）
  onPlayerStateUpdate: (callback) => {
    ipcRenderer.on('player-state-update', (event, state) => callback(state))
  },
  
  // 监听歌词更新（桌面歌词窗口用）
  onLyricUpdate: (callback) => {
    const listener = (event, data) => callback(data)
    ipcRenderer.on('lyric-update', listener)
    return () => ipcRenderer.removeListener('lyric-update', listener)
  },
  
  // 监听桌面歌词控制（主窗口用）
  onDesktopLyricControl: (callback) => {
    ipcRenderer.on('desktop-lyric-control', (event, action) => callback(action))
  },
  
  // 监听鼠标悬停状态（桌面歌词窗口用）
  onMouseHoverState: (callback) => {
    ipcRenderer.on('mouse-hover-state', (event, isInside) => callback(isInside))
  },

  // 开发者工具
  openDevTools: () => ipcRenderer.send('open-dev-tools'),

  // 打开外部链接
  openExternal: (url) => ipcRenderer.invoke('open-external', url),

  // 日志
  log: (message) => console.log('[Smusic]', message),
  error: (message) => console.error('[Smusic]', message),
  warn: (message) => console.warn('[Smusic]', message),

  // ==================== 我喜欢的音乐 ====================
  /**
   * 添加歌曲到"我喜欢的音乐"
   * @param {Object} song - 歌曲对象
   * @returns {Promise<Object>} - 操作结果
   */
  addToFavorites: (song) => ipcRenderer.invoke('add-to-favorites', song),

  /**
   * 从"我喜欢的音乐"移除歌曲
   * @param {string} songId - 歌曲 ID
   * @returns {Promise<Object>} - 操作结果
   */
  removeFromFavorites: (songId) => ipcRenderer.invoke('remove-from-favorites', songId),

  /**
   * 获取"我喜欢的音乐"歌单
   * @returns {Promise<Object>} - 歌单数据
   */
  getFavorites: () => ipcRenderer.invoke('get-favorites'),

  /**
   * 检查歌曲是否在"我喜欢的音乐"中
   * @param {string} songId - 歌曲 ID
   * @returns {Promise<boolean>} - 是否喜欢
   */
  isFavorite: (songId) => ipcRenderer.invoke('is-favorite', songId),

  // ==================== 自定义歌单 ====================
  /**
   * 创建新歌单
   * @param {string} name - 歌单名称
   * @param {string} description - 歌单描述
   * @returns {Promise<Object>} - 操作结果
   */
  createPlaylist: (name, description) => 
    ipcRenderer.invoke('create-playlist', { name, description }),

  /**
   * 更新歌单信息
   * @param {string} playlistId - 歌单 ID
   * @param {Object} data - 更新数据（name, description 等）
   * @returns {Promise<Object>} - 操作结果
   */
  updatePlaylist: (playlistId, data) => 
    ipcRenderer.invoke('update-playlist', { playlistId, ...data }),

  /**
   * 删除歌单
   * @param {string} playlistId - 歌单 ID
   * @returns {Promise<Object>} - 操作结果
   */
  deletePlaylist: (playlistId) => 
    ipcRenderer.invoke('delete-playlist', playlistId),

  /**
   * 获取所有自定义歌单
   * @returns {Promise<Object>} - 歌单列表
   */
  getCustomPlaylists: () => ipcRenderer.invoke('get-custom-playlists'),

  // ==================== 歌曲操作 ====================
  /**
   * 添加歌曲到歌单
   * @param {string} playlistId - 歌单 ID
   * @param {Object} song - 歌曲对象
   * @returns {Promise<Object>} - 操作结果
   */
  addSongToPlaylist: (playlistId, song) => 
    ipcRenderer.invoke('add-song-to-playlist', { playlistId, song }),

  /**
   * 从歌单移除歌曲
   * @param {string} playlistId - 歌单 ID
   * @param {string} songId - 歌曲 ID
   * @returns {Promise<Object>} - 操作结果
   */
  removeSongFromPlaylist: (playlistId, songId) => 
    ipcRenderer.invoke('remove-song-from-playlist', { playlistId, songId }),

  /**
   * 批量添加歌曲到歌单
   * @param {string} playlistId - 歌单 ID
   * @param {Array} songs - 歌曲数组
   * @returns {Promise<Object>} - 操作结果
   */
  addSongsToPlaylist: (playlistId, songs) => 
    ipcRenderer.invoke('add-songs-to-playlist', { playlistId, songs }),

  // ==================== 歌单合并 ====================
  /**
   * 合并歌单
   * @param {string} targetId - 目标歌单 ID
   * @param {string} sourceId - 源歌单 ID
   * @param {Array} sourceSongs - 源歌单的歌曲列表
   * @returns {Promise<Object>} - 操作结果
   */
  mergePlaylist: (targetId, sourceId, sourceSongs) => 
    ipcRenderer.invoke('merge-playlist', { targetId, sourceId, sourceSongs }),

  // ==================== 在线歌单收藏 ====================
  /**
   * 收藏在线歌单
   * @param {Object} playlist - 歌单对象
   * @returns {Promise<Object>} - 操作结果
   */
  collectOnlinePlaylist: (playlist) => 
    ipcRenderer.invoke('collect-online-playlist', playlist),

  /**
   * 取消收藏在线歌单
   * @param {string} playlistId - 歌单 ID
   * @returns {Promise<Object>} - 操作结果
   */
  uncollectOnlinePlaylist: (playlistId) => 
    ipcRenderer.invoke('uncollect-online-playlist', playlistId),

  /**
   * 获取收藏的在线歌单列表
   * @returns {Promise<Object>} - 歌单列表
   */
  getCollectedPlaylists: () => ipcRenderer.invoke('get-collected-playlists'),

  // ==================== 已下载歌单 ====================
  /**
   * 获取已下载歌单
   * @returns {Promise<Object>} - 歌单数据
   */
  getDownloads: () => ipcRenderer.invoke('get-downloads'),

  /**
   * 从已下载歌单移除歌曲（同时删除本地文件）
   * @param {string} songId - 歌曲 ID
   * @returns {Promise<Object>} - 操作结果
   */
  removeFromDownloads: (songId) => 
    ipcRenderer.invoke('remove-from-downloads', songId),

  /**
   * 获取本地歌曲文件路径
   * @param {string} songId - 歌曲 ID
   * @returns {Promise<Object>} - 包含路径的结果对象
   */
  getLocalSongPath: (songId) => {
    // songId 是数字，不需要路径安全检查
    return ipcRenderer.invoke('get-local-song-path', songId)
  },

  /**
   * 获取本地歌词
   * @param {string} songId - 歌曲 ID
   * @returns {Promise<Object>} - 包含歌词内容的结果对象
   */
  getLocalLyric: (songId) => {
    return ipcRenderer.invoke('get-local-lyric', songId)
  },

  /**
   * 读取本地音频文件
   * @param {string} filePath - 文件路径
   * @returns {Promise<Object>} - 包含文件 buffer 的结果对象
   */
  readLocalAudio: (filePath) => {
    return ipcRenderer.invoke('read-local-audio', filePath)
  },

  // ==================== 下载功能 ====================
  /**
   * 下载单曲
   * @param {string} songId - 歌曲 ID
   * @param {string} songUrl - 歌曲下载链接
   * @param {Object} metadata - 歌曲元数据
   * @returns {Promise<Object>} - 操作结果
   */
  downloadSong: (songId, songUrl, metadata) => 
    ipcRenderer.invoke('download-song', { songId, songUrl, metadata }),

  /**
   * 批量下载歌单
   * @param {Array} songs - 歌曲数组
   * @returns {Promise<Object>} - 操作结果
   */
  downloadPlaylist: (songs) => 
    ipcRenderer.invoke('download-playlist', songs),

  /**
   * 取消下载任务
   * @param {string} taskId - 任务 ID
   * @returns {Promise<Object>} - 操作结果
   */
  cancelDownload: (taskId) => 
    ipcRenderer.invoke('cancel-download', taskId),

  /**
   * 暂停下载任务
   * @param {string} taskId - 任务 ID
   * @returns {Promise<Object>} - 操作结果
   */
  pauseDownload: (taskId) => 
    ipcRenderer.invoke('pause-download', taskId),

  /**
   * 恢复下载任务
   * @param {string} taskId - 任务 ID
   * @returns {Promise<Object>} - 操作结果
   */
  resumeDownload: (taskId) => 
    ipcRenderer.invoke('resume-download', taskId),

  // ==================== 下载进度监听 ====================
  /**
   * 监听下载进度更新
   * @param {Function} callback - 回调函数
   * @returns {Function} - 取消监听的函数
   */
  onDownloadProgress: (callback) => {
    const listener = (event, data) => callback(data)
    ipcRenderer.on('download-progress', listener)
    // 返回取消监听的函数
    return () => ipcRenderer.removeListener('download-progress', listener)
  },

  /**
   * 取消下载进度监听
   * @param {Function} callback - 回调函数
   */
  offDownloadProgress: (callback) => {
    ipcRenderer.removeListener('download-progress', callback)
  },

  // ==================== 路径安全验证 ====================
  /**
   * 验证路径是否安全
   * @param {string} filePath - 文件路径
   * @returns {boolean} - 是否安全
   */
  isPathSafe: isPathSafe,

  // ==================== 磁盘空间管理 ====================
  /**
   * 检查磁盘可用空间
   * @returns {Promise<Object>} - 磁盘空间信息
   */
  checkDiskSpace: () => ipcRenderer.invoke('check-disk-space'),

  /**
   * 获取下载目录占用的磁盘空间
   * @returns {Promise<Object>} - 目录大小（字节）
   */
  getDownloadsSize: () => ipcRenderer.invoke('get-downloads-size'),

  /**
   * 打开下载目录
   * @returns {Promise<Object>} - 操作结果
   */
  openDownloadsFolder: () => ipcRenderer.invoke('open-downloads-folder'),

  // ==================== 全局快捷键 ====================
  /**
   * 注册全局快捷键
   * @param {Object} shortcuts - 快捷键配置
   * @returns {Promise<Object>} - 操作结果
   */
  registerShortcuts: (shortcuts) => ipcRenderer.invoke('register-shortcuts', shortcuts),

  /**
   * 注销所有快捷键
   * @returns {Promise<Object>} - 操作结果
   */
  unregisterShortcuts: () => ipcRenderer.invoke('unregister-shortcuts'),

  /**
   * 监听快捷键触发事件
   * @param {Function} callback - 回调函数
   * @returns {Function} - 取消监听的函数
   */
  onShortcutTriggered: (callback) => {
    const listener = (event, action) => callback(action)
    ipcRenderer.on('shortcut-triggered', listener)
    return () => ipcRenderer.removeListener('shortcut-triggered', listener)
  },

  // ==================== 系统托盘控制 ====================
  /**
   * 更新托盘菜单状态
   * @param {Object} state - 状态对象 { isPlaying, desktopLyricVisible }
   */
  updateTrayState: (state) => ipcRenderer.send('update-tray-state', state),

  /**
   * 监听托盘控制事件
   * @param {Function} callback - 回调函数
   * @returns {Function} - 取消监听的函数
   */
  onTrayControl: (callback) => {
    const listener = (event, action) => callback(action)
    ipcRenderer.on('tray-control', listener)
    return () => ipcRenderer.removeListener('tray-control', listener)
  },

  /**
   * 监听主进程请求同步状态到桌面歌词
   * @param {Function} callback - 回调函数
   * @returns {Function} - 取消监听的函数
   */
  onRequestSyncToDesktopLyric: (callback) => {
    const listener = () => callback()
    ipcRenderer.on('request-sync-to-desktop-lyric', listener)
    return () => ipcRenderer.removeListener('request-sync-to-desktop-lyric', listener)
  },

  // ==================== 本地音乐导入 ====================
  /**
   * 选择本地音频文件
   * @returns {Promise<Object>} - { canceled, filePaths }
   */
  selectLocalAudioFiles: () => ipcRenderer.invoke('select-local-audio-files'),

  /**
   * 选择歌词文件
   * @returns {Promise<Object>} - { canceled, filePath }
   */
  selectLyricFile: () => ipcRenderer.invoke('select-lyric-file'),

  /**
   * 获取音频文件元数据
   * @param {string} filePath - 文件路径
   * @returns {Promise<Object>} - 歌曲元数据
   */
  getAudioMetadata: (filePath) => ipcRenderer.invoke('get-audio-metadata', filePath),

  /**
   * 添加本地歌曲
   * @param {Object} songData - 歌曲数据
   * @returns {Promise<Object>} - 操作结果
   */
  addLocalSong: (songData) => ipcRenderer.invoke('add-local-song', songData),

  /**
   * 批量添加本地歌曲
   * @param {Array} songsData - 歌曲数据数组
   * @returns {Promise<Object>} - 操作结果
   */
  addLocalSongs: (songsData) => ipcRenderer.invoke('add-local-songs', songsData),

  /**
   * 更新歌曲歌词路径
   * @param {string} songId - 歌曲 ID
   * @param {string} lyricPath - 歌词文件路径
   * @returns {Promise<Object>} - 操作结果
   */
  updateSongLyric: (songId, lyricPath) => ipcRenderer.invoke('update-song-lyric', songId, lyricPath),

  /**
   * 获取本地音乐列表
   * @returns {Promise<Object>} - 本地音乐列表
   */
  getLocalSongs: () => ipcRenderer.invoke('get-local-songs'),

  /**
   * 移除本地歌曲
   * @param {string} songId - 歌曲 ID
   * @returns {Promise<Object>} - 操作结果
   */
  removeLocalSong: (songId) => ipcRenderer.invoke('remove-local-song', songId),

  // 暴露ipcRenderer用于调试和备选方案
  ipcRenderer: ipcRenderer
})

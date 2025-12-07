const { contextBridge, ipcRenderer } = require('electron')

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

  // 开发者工具
  openDevTools: () => ipcRenderer.send('open-dev-tools'),

  // 日志
  log: (message) => console.log('[Smusic]', message),
  error: (message) => console.error('[Smusic]', message),
  warn: (message) => console.warn('[Smusic]', message)
})

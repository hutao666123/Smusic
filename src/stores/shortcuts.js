import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useShortcutsStore = defineStore('shortcuts', () => {
  // 快捷键模式：'global' | 'local'，默认为应用内模式
  const shortcutMode = ref('local')
  
  // 默认快捷键配置
  const defaultShortcuts = {
    // 基础快捷键（默认启用）
    playPause: { key: 'Space', enabled: true, label: '播放/暂停' },
    nextTrack: { key: 'CommandOrControl+Right', enabled: true, label: '下一首' },
    prevTrack: { key: 'CommandOrControl+Left', enabled: true, label: '上一首' },
    volumeUp: { key: 'CommandOrControl+Up', enabled: true, label: '音量增大' },
    volumeDown: { key: 'CommandOrControl+Down', enabled: true, label: '音量减小' },
    
    // 用户自定义快捷键
    toggleLike: { key: 'CommandOrControl+L', enabled: true, label: '喜欢/取消喜欢' },
    downloadCurrent: { key: 'CommandOrControl+D', enabled: true, label: '下载当前歌曲' },
    addToPlaylist: { key: 'CommandOrControl+P', enabled: true, label: '添加到歌单' }
  }

  // 当前快捷键配置
  const shortcuts = ref({ ...defaultShortcuts })

  // 初始化快捷键配置
  const initShortcuts = () => {
    // 清理旧的独立存储的 shortcut-mode
    const oldMode = localStorage.getItem('shortcut-mode')
    if (oldMode) {
      localStorage.removeItem('shortcut-mode')
    }
    
    const saved = localStorage.getItem('shortcuts-config')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        shortcuts.value = { ...defaultShortcuts, ...parsed }
      } catch (e) {
        console.error('加载快捷键配置失败:', e)
      }
    }
    
    // 如果没有保存的模式，确保使用默认值 'local'
    if (!shortcutMode.value || shortcutMode.value === 'global') {
      shortcutMode.value = 'local'
      localStorage.setItem('shortcuts-config', JSON.stringify({
        shortcuts: shortcuts.value,
        shortcutMode: 'local'
      }))
    }
    
    console.log('快捷键模式初始化为:', shortcutMode.value)
  }
  
  // 设置快捷键模式
  const setShortcutMode = (mode) => {
    shortcutMode.value = mode
    localStorage.setItem('shortcut-mode', mode)
  }

  // 保存快捷键配置
  const saveShortcuts = () => {
    localStorage.setItem('shortcuts-config', JSON.stringify(shortcuts.value))
  }

  // 更新单个快捷键
  const updateShortcut = (action, config) => {
    shortcuts.value[action] = { ...shortcuts.value[action], ...config }
    saveShortcuts()
  }

  // 重置所有快捷键
  const resetShortcuts = () => {
    shortcuts.value = { ...defaultShortcuts }
    saveShortcuts()
  }

  // 检查快捷键是否冲突
  const checkConflict = (key, excludeAction) => {
    if (!key) return null
    
    for (const [action, config] of Object.entries(shortcuts.value)) {
      if (action !== excludeAction && config.enabled && config.key === key) {
        return action
      }
    }
    return null
  }

  return {
    shortcuts,
    shortcutMode,
    initShortcuts,
    updateShortcut,
    resetShortcuts,
    checkConflict,
    saveShortcuts,
    setShortcutMode
  }
}, {
  persist: {
    key: 'shortcuts-config',
    storage: localStorage,
    paths: ['shortcuts', 'shortcutMode']
  }
})

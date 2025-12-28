import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const usePlayerStore = defineStore('player', () => {
  const playlist = ref([])
  const currentIndex = ref(0)
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const volume = ref(0.3)
  const isLocalPlayback = ref(false) // 标记当前是否为本地播放
  const forceLocalMode = ref(false) // 标记是否强制使用本地播放模式（已下载歌单）
  const currentPlaylistId = ref(null) // 当前播放列表的ID
  const currentPlaylistType = ref(null) // 当前播放列表类型：'online' 或 'local'

  const currentSong = computed(() => playlist.value[currentIndex.value])

  /**
   * 检查歌曲是否已下载到本地
   * @param {string} songId - 歌曲 ID
   * @returns {Promise<Object|null>} - 返回本地路径信息或 null
   */
  const checkLocalSong = async (songId) => {
    try {
      console.log('checkLocalSong - 查询歌曲 ID:', songId)
      const result = await window.electron.getLocalSongPath(songId)
      console.log('checkLocalSong - electron 返回:', result)
      if (result.success && result.data) {
        console.log('checkLocalSong - 找到本地路径:', result.data)
        return { localPath: result.data }
      }
      console.log('checkLocalSong - 未找到本地文件')
      return null
    } catch (error) {
      console.error('检查本地歌曲失败:', error)
      return null
    }
  }

  /**
   * 获取歌曲播放 URL
   * 根据 forceLocalMode 决定播放策略：
   * - forceLocalMode = true: 只使用本地文件（已下载歌单）
   * - forceLocalMode = false: 默认在线播放（其他歌单）
   * @param {Object} song - 歌曲对象
   * @returns {Promise<Object>} - 返回 { url, isLocal, error }
   */
  const getSongPlayUrl = async (song) => {
    if (!song || !song.id) {
      return { url: null, isLocal: false, error: '无效的歌曲信息' }
    }

    // 默认模式：直接使用在线播放，不输出日志
    if (!forceLocalMode.value) {
      
      return { url: null, isLocal: false, error: null }
    }

    // 以下是强制本地模式的逻辑
    console.log('💾 本地播放模式 - 歌曲:', song.name)
    console.log('getSongPlayUrl - localPath:', song.localPath)

    // 如果是强制本地模式（已下载歌单），只使用本地文件
    if (forceLocalMode.value) {
      // 优先使用歌曲对象中的 localPath（如果有）
      if (song.localPath) {
        try {
          
          
          const result = await window.electron.readLocalAudio(song.localPath)

          
          if (result.success && result.data) {
            // 将 buffer 转换为 Blob URL
            console.log('🔄 开始转换为 Blob URL，buffer 大小:', result.data.buffer.length)
            const blob = new Blob([result.data.buffer], { type: 'audio/mpeg' })
            const blobUrl = URL.createObjectURL(blob)
            console.log('✅ 本地文件转换为 Blob URL 成功:', blobUrl)
            return { url: blobUrl, isLocal: true, error: null }
          } else {
            console.warn('❌ 读取本地文件失败:', result.error)
          }
        } catch (error) {
          console.warn('❌ 本地文件访问失败，尝试查询:', error.message)
        }
      }

      // 如果歌曲对象没有 localPath，查询下载列表
      const localInfo = await checkLocalSong(song.id)
      
      if (localInfo && localInfo.localPath) {
        try {
          const result = await window.electron.readLocalAudio(localInfo.localPath)
          
          if (result.success && result.data) {
            // 将 buffer 转换为 Blob URL
            const blob = new Blob([result.data.buffer], { type: 'audio/mpeg' })
            const blobUrl = URL.createObjectURL(blob)
            return { url: blobUrl, isLocal: true, error: null }
          } else {
            console.warn('读取本地文件失败:', result.error)
          }
        } catch (error) {
          console.warn('本地文件访问失败:', error)
        }
      }

      // 强制本地模式下，如果本地文件不存在，返回错误
      console.error('❌ 本地文件不存在或不可用')
      return { url: null, isLocal: false, error: '本地文件不存在' }
    }
  }

  const play = () => {
    isPlaying.value = true
  }

  const pause = () => {
    isPlaying.value = false
  }

  const togglePlay = () => {
    isPlaying.value = !isPlaying.value
  }

  const next = () => {
    if (currentIndex.value < playlist.value.length - 1) {
      currentIndex.value++
    } else {
      // 如果是最后一首，跳回第一首
      currentIndex.value = 0
    }
  }

  const prev = () => {
    if (currentIndex.value > 0) {
      currentIndex.value--
    }
  }

  const addToPlaylist = (song) => {
    playlist.value.push(song)
  }

  const clearPlaylist = () => {
    playlist.value = []
    currentIndex.value = 0
    isPlaying.value = false
  }

  const setCurrentPlaylist = (playlistId, playlistType = 'online') => {
    currentPlaylistId.value = playlistId
    currentPlaylistType.value = playlistType
  }

  const setCurrentTime = (time) => {
    currentTime.value = time
  }

  const setDuration = (dur) => {
    duration.value = dur
  }

  const setVolume = (vol) => {
    volume.value = vol
  }

  /**
   * 处理蓝牙媒体按键事件
   * @param {string} action - 按键动作
   */
  const handleMediaKeyPress = (action) => {
    console.log('🎵 处理媒体按键:', action)
    switch (action) {
      case 'play':
        play()
        break
      case 'pause':
        pause()
        break
      case 'nexttrack':
        next()
        break
      case 'previoustrack':
        prev()
        break
      default:
        console.warn('未知的媒体按键动作:', action)
    }
  }

  return {
    playlist,
    currentIndex,
    isPlaying,
    currentTime,
    duration,
    volume,
    isLocalPlayback,
    forceLocalMode,
    currentPlaylistId,
    currentPlaylistType,
    currentSong,
    play,
    pause,
    togglePlay,
    next,
    prev,
    addToPlaylist,
    clearPlaylist,
    setCurrentPlaylist,
    setCurrentTime,
    setDuration,
    setVolume,
    getSongPlayUrl,
    checkLocalSong,
    handleMediaKeyPress
  }
}, {
  persist: {
    key: 'player-state',
    storage: localStorage,
    paths: ['playlist', 'currentIndex', 'volume', 'isLocalPlayback', 'forceLocalMode', 'currentTime', 'currentPlaylistId', 'currentPlaylistType']
  }
})

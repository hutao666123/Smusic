import { getMusicUrl } from '@/api/music'

class AudioPlayer {
  constructor() {
    this.audio = new Audio()
    this.playerStore = null
    this.currentSongId = null
    this.isLoading = false
    this.getPlayMode = null // 播放模式获取函数
    this.setupEventListeners()
  }

  setupEventListeners() {
    // 播放时间更新
    this.audio.addEventListener('timeupdate', () => {
      if (this.playerStore) {
        this.playerStore.setCurrentTime(this.audio.currentTime)
      }
    })

    // 音乐加载完成
    this.audio.addEventListener('loadedmetadata', () => {
      if (this.playerStore) {
        this.playerStore.setDuration(this.audio.duration)
      }
    })

    // 播放结束
    this.audio.addEventListener('ended', () => {
      if (this.playerStore) {
        const mode = this.getPlayMode ? this.getPlayMode() : 'order'
        
        if (mode === 'loop') {
          // 循环播放：重新播放当前歌曲
          this.audio.currentTime = 0
          this.audio.play()
        } else {
          // 顺序或随机：切换到下一首
          this.playerStore.next()
          this.playCurrentSong()
        }
      }
    })



    // 错误处理
    this.audio.addEventListener('error', (e) => {
      console.error('音频播放错误:', e)
      alert('播放出错，请检查网络或后端服务是否启动')
    })

    // 音量变化
    this.audio.addEventListener('volumechange', () => {
      if (this.playerStore) {
        this.playerStore.setVolume(this.audio.volume)
      }
    })
  }

  setPlayerStore(store) {
    this.playerStore = store
  }

  async playCurrentSong() {
    if (!this.playerStore || !this.playerStore.currentSong) {
      console.warn('没有选择歌曲')
      return
    }

    const song = this.playerStore.currentSong
    const songId = song.id
    
    // 如果正在加载，取消之前的加载
    if (this.isLoading) {
      this.isLoading = false
    }

    // 如果正在播放同一首歌，跳过
    if (this.currentSongId === songId && !this.audio.paused) {
      return
    }

    // 立即停止当前播放
    this.audio.pause()
    this.audio.currentTime = 0
    
    this.isLoading = true
    const loadingId = songId // 保存当前加载的歌曲ID
    
    try {
      
      // 首先尝试获取本地播放路径
      const playUrlInfo = await this.playerStore.getSongPlayUrl(song)
      
      // 检查是否已经切换到其他歌曲
      if (!this.isLoading || this.playerStore.currentSong?.id !== loadingId) {
        return
      }

      let url = playUrlInfo.url
      const isLocal = playUrlInfo.isLocal


      // 如果没有本地文件，尝试获取在线 URL
      if (!isLocal) {
        url = await getMusicUrl(songId)
    
        
        // 再次检查是否已经切换到其他歌曲
        if (!this.isLoading || this.playerStore.currentSong?.id !== loadingId) {
          return
        }
      }
      
      if (!url) {
        console.error('❌ 无法获取播放 URL')
        this.isLoading = false
        const errorMsg = `无法播放《${song.name}》\n\n可能原因：\n1. 版权限制（该歌曲暂无可用音源）\n2. api-enhanced 服务未启动\n3. 网络连接问题\n4. 本地文件不存在或已损坏\n\n请确保 api-enhanced 服务已启动（端口 3000）`
        alert(errorMsg)
        
        // 自动跳到下一首
        if (this.playerStore.playlist.length > 1) {
          this.playerStore.next()
          setTimeout(() => this.playCurrentSong(), 1000)
        }
        return
      }

      // 再次检查是否已经切换到其他歌曲
      if (!this.isLoading || this.playerStore.currentSong?.id !== loadingId) {
        return
      }

      // 设置新的音频源
      this.audio.src = url
      this.currentSongId = songId
      this.playerStore.isLocalPlayback = isLocal
      
      try {
        await this.audio.play()
        this.playerStore.play()
        this.isLoading = false
        
        // 同步蓝牙媒体会话状态
        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'playing'
          if (navigator.mediaSession.setPositionState) {
            navigator.mediaSession.setPositionState({
              duration: this.audio.duration || 0,
              playbackRate: 1,
              position: this.audio.currentTime || 0
            })
          }
        }
      } catch (playError) {
        // 处理 play() 被中断的情况
        if (playError.name === 'AbortError') {
        } else {
          throw playError
        }
        this.isLoading = false
      }
    } catch (error) {
      this.isLoading = false
      console.error('❌ 播放失败:', error)
      
      // 只在非中断错误时显示提示
      if (error.name !== 'AbortError') {
        const errorMsg = `播放失败: ${error.message}\n\n${
          this.playerStore.isLocalPlayback 
            ? '本地文件可能已损坏或被移动，请尝试重新下载' 
            : '请检查后端服务是否正常运行'
        }`
        alert(errorMsg)
        
        // 如果是本地播放失败，尝试跳到下一首
        if (this.playerStore.isLocalPlayback && this.playerStore.playlist.length > 1) {
          this.playerStore.next()
          setTimeout(() => this.playCurrentSong(), 1000)
        }
      }
    }
  }

  play() {
    if (this.audio.src) {
      this.audio.play()
      if (this.playerStore) {
        this.playerStore.play()
      }
    } else {
      this.playCurrentSong()
    }
  }

  pause() {
    this.audio.pause()
    if (this.playerStore) {
      this.playerStore.pause()
    }
  }

  togglePlay() {
    if (this.audio.paused) {
      this.play()
    } else {
      this.pause()
    }
  }

  setCurrentTime(time) {
    this.audio.currentTime = time
  }

  setVolume(volume) {
    this.audio.volume = Math.max(0, Math.min(1, volume))
  }

  stop() {
    this.audio.pause()
    this.audio.currentTime = 0
    if (this.playerStore) {
      this.playerStore.pause()
      this.playerStore.setCurrentTime(0)
    }
  }
}

export default new AudioPlayer()

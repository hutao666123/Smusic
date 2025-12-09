import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { showSuccess, showError, showWarning, showInfo, showDiskSpaceWarning, showNotification } from '../utils/notification'

export const useDownloadStore = defineStore('download', () => {
  // 状态
  const downloadTasks = ref(new Map()) // 下载任务映射表 taskId -> task
  const downloadQueue = ref([]) // 下载队列
  const isDownloading = ref(false) // 是否正在下载
  const loading = ref(false)
  const error = ref(null)

  // 计算属性
  const activeTasks = computed(() => {
    return Array.from(downloadTasks.value.values()).filter(
      task => task.status === 'downloading' || task.status === 'pending'
    )
  })

  const completedTasks = computed(() => {
    return Array.from(downloadTasks.value.values()).filter(
      task => task.status === 'completed'
    )
  })

  const failedTasks = computed(() => {
    return Array.from(downloadTasks.value.values()).filter(
      task => task.status === 'failed'
    )
  })

  const totalProgress = computed(() => {
    const tasks = Array.from(downloadTasks.value.values())
    if (tasks.length === 0) return 0
    
    const totalProgress = tasks.reduce((sum, task) => sum + (task.progress || 0), 0)
    return Math.round(totalProgress / tasks.length)
  })

  // 下载进度监听器
  let progressUnsubscribe = null

  // 设置下载进度监听器
  const setupProgressListener = () => {
    if (progressUnsubscribe) {
      // 如果已经有监听器，先取消
      progressUnsubscribe()
    }

    progressUnsubscribe = window.electron.onDownloadProgress((data) => {
      const { taskId, status, progress, downloadedSize, totalSize, speed, error: taskError } = data

      // 更新任务状态
      const task = downloadTasks.value.get(taskId)
      if (task) {
        task.status = status
        task.progress = progress || 0
        task.downloadedSize = downloadedSize || 0
        task.totalSize = totalSize || 0
        task.speed = speed || 0
        
        if (taskError) {
          task.error = taskError
        }

        if (status === 'completed') {
          task.endTime = Date.now()
        }

        // 触发响应式更新
        downloadTasks.value = new Map(downloadTasks.value)
      }
    })
  }

  // 检查磁盘空间
  const checkDiskSpace = async (requiredSpace = 10 * 1024 * 1024) => {
    try {
      const result = await window.electron.checkDiskSpace()
      if (result.success) {
        const available = result.data.available
        if (available < requiredSpace) {
          showDiskSpaceWarning(requiredSpace, available)
          return false
        }
        return true
      }
      return true // 如果检查失败，允许继续
    } catch (err) {
      console.error('检查磁盘空间失败:', err)
      return true // 如果检查失败，允许继续
    }
  }

  // 下载单曲
  const downloadSong = async (song) => {
    loading.value = true
    error.value = null

    try {
      // 检查磁盘空间（假设每首歌需要 10MB）
      const hasSpace = await checkDiskSpace(10 * 1024 * 1024)
      if (!hasSpace) {
        loading.value = false
        return { success: false, error: '磁盘空间不足' }
      }

      // 创建任务对象
      const taskId = `download-${song.id}-${Date.now()}`
      const task = {
        id: taskId,
        songId: song.id,
        songName: song.name || '未知歌曲',
        artists: song.artists || [],
        album: song.album || {},
        status: 'pending',
        progress: 0,
        downloadedSize: 0,
        totalSize: 0,
        speed: 0,
        error: null,
        startTime: Date.now(),
        endTime: null
      }

      // 添加到任务列表
      downloadTasks.value.set(taskId, task)
      downloadTasks.value = new Map(downloadTasks.value)

      showInfo(`开始下载：${song.name}`)

      // 获取歌曲播放 URL
      let songUrl = song.url
      if (!songUrl) {
        console.log('获取歌曲播放 URL...')
        try {
          const { getMusicUrl } = await import('../api/music')
          songUrl = await getMusicUrl(song.id)
          console.log('获取到的 URL:', songUrl)
        } catch (err) {
          console.error('获取 URL 失败:', err)
        }
      }
      
      if (!songUrl) {
        error.value = '无法获取歌曲播放链接，请检查网络或后端服务'
        showError(error.value)
        loading.value = false
        return { success: false, error: error.value }
      }

      // 调用主进程下载
      // 将 Proxy 对象转换为纯对象，避免序列化错误
      const songData = {
        id: song.id,
        name: song.name,
        artists: song.artists ? JSON.parse(JSON.stringify(song.artists)) : [],
        album: song.album ? JSON.parse(JSON.stringify(song.album)) : {},
        duration: song.duration
      }
      
      console.log('调用主进程下载，参数:', { songId: song.id, songUrl, songData })
      
      const result = await window.electron.downloadSong(
        song.id,
        songUrl,
        songData
      )
      
      console.log('下载结果:', result)

      if (result.success) {
        // 检查是否跳过（已下载）
        if (result.message && result.message.includes('已下载')) {
          showWarning(result.message)
          // 移除任务
          downloadTasks.value.delete(taskId)
          downloadTasks.value = new Map(downloadTasks.value)
          return { success: true, skipped: true }
        }

        // 下载成功
        const updatedTask = downloadTasks.value.get(taskId)
        if (updatedTask) {
          updatedTask.status = 'completed'
          updatedTask.progress = 100
          updatedTask.endTime = Date.now()
          downloadTasks.value = new Map(downloadTasks.value)
        }
        
        showNotification({
          type: 'success',
          title: '下载完成',
          content: `${song.name} 已下载完成`
        })
        
        return { success: true, taskId }
      } else {
        // 下载失败
        const updatedTask = downloadTasks.value.get(taskId)
        if (updatedTask) {
          updatedTask.status = 'failed'
          updatedTask.error = result.error?.message || '下载失败'
          downloadTasks.value = new Map(downloadTasks.value)
        }
        error.value = result.error?.message || '下载失败'
        showError(`下载失败：${error.value}`)
        return { success: false, error: error.value }
      }
    } catch (err) {
      error.value = err.message || '下载歌曲失败'
      console.error('下载歌曲失败:', err)
      showError(error.value)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // 批量下载歌单
  const downloadPlaylist = async (songs) => {
    loading.value = true
    error.value = null
    isDownloading.value = true

    try {
      // 检查磁盘空间（假设每首歌需要 10MB）
      const requiredSpace = songs.length * 10 * 1024 * 1024
      const hasSpace = await checkDiskSpace(requiredSpace)
      if (!hasSpace) {
        loading.value = false
        isDownloading.value = false
        return { success: false, error: '磁盘空间不足' }
      }

      // 添加所有歌曲到队列
      downloadQueue.value = [...songs]

      // 为每首歌创建任务
      const tasks = songs.map(song => {
        const taskId = `download-${song.id}-${Date.now()}`
        return {
          id: taskId,
          songId: song.id,
          songName: song.name || '未知歌曲',
          artists: song.artists || [],
          album: song.album || {},
          status: 'pending',
          progress: 0,
          downloadedSize: 0,
          totalSize: 0,
          speed: 0,
          error: null,
          startTime: Date.now(),
          endTime: null
        }
      })

      // 添加到任务列表
      tasks.forEach(task => {
        downloadTasks.value.set(task.id, task)
      })
      downloadTasks.value = new Map(downloadTasks.value)

      showInfo(`开始批量下载 ${songs.length} 首歌曲`)

      // 调用主进程批量下载
      const result = await window.electron.downloadPlaylist(songs)

      if (result.success) {
        const completed = result.data?.completed || 0
        const failed = result.data?.failed || 0
        const skipped = result.data?.skipped || 0
        
        showNotification({
          type: completed > 0 ? 'success' : 'warning',
          title: '批量下载完成',
          content: `成功：${completed} 首，失败：${failed} 首${skipped > 0 ? `，跳过：${skipped} 首` : ''}`
        })
        
        return {
          success: true,
          total: songs.length,
          completed,
          failed,
          skipped
        }
      } else {
        error.value = result.error?.message || '批量下载失败'
        showError(error.value)
        return {
          success: false,
          error: error.value
        }
      }
    } catch (err) {
      error.value = err.message || '批量下载失败'
      console.error('批量下载失败:', err)
      showError(error.value)
      return {
        success: false,
        error: error.value
      }
    } finally {
      loading.value = false
      isDownloading.value = false
      downloadQueue.value = []
    }
  }

  // 取消下载
  const cancelDownload = async (taskId) => {
    try {
      const result = await window.electron.cancelDownload(taskId)
      
      if (result.success) {
        const task = downloadTasks.value.get(taskId)
        if (task) {
          task.status = 'cancelled'
          task.endTime = Date.now()
          downloadTasks.value = new Map(downloadTasks.value)
        }
        showSuccess('已取消下载')
        return true
      } else {
        error.value = result.error?.message || '取消下载失败'
        showError(error.value)
        return false
      }
    } catch (err) {
      error.value = err.message || '取消下载失败'
      console.error('取消下载失败:', err)
      showError(error.value)
      return false
    }
  }

  // 暂停下载
  const pauseDownload = async (taskId) => {
    try {
      const result = await window.electron.pauseDownload(taskId)
      
      if (result.success) {
        const task = downloadTasks.value.get(taskId)
        if (task) {
          task.status = 'paused'
          downloadTasks.value = new Map(downloadTasks.value)
        }
        return true
      } else {
        error.value = result.error?.message || '暂停下载失败'
        return false
      }
    } catch (err) {
      error.value = err.message || '暂停下载失败'
      console.error('暂停下载失败:', err)
      return false
    }
  }

  // 恢复下载
  const resumeDownload = async (taskId) => {
    try {
      const result = await window.electron.resumeDownload(taskId)
      
      if (result.success) {
        const task = downloadTasks.value.get(taskId)
        if (task) {
          task.status = 'downloading'
          downloadTasks.value = new Map(downloadTasks.value)
        }
        return true
      } else {
        error.value = result.error?.message || '恢复下载失败'
        return false
      }
    } catch (err) {
      error.value = err.message || '恢复下载失败'
      console.error('恢复下载失败:', err)
      return false
    }
  }

  // 获取任务进度
  const getTaskProgress = (taskId) => {
    const task = downloadTasks.value.get(taskId)
    return task ? task.progress : 0
  }

  // 获取任务状态
  const getTaskStatus = (taskId) => {
    const task = downloadTasks.value.get(taskId)
    return task ? task.status : null
  }

  // 清除已完成的任务
  const clearCompletedTasks = () => {
    const newTasks = new Map()
    downloadTasks.value.forEach((task, taskId) => {
      if (task.status !== 'completed') {
        newTasks.set(taskId, task)
      }
    })
    downloadTasks.value = newTasks
  }

  // 清除失败的任务
  const clearFailedTasks = () => {
    const newTasks = new Map()
    downloadTasks.value.forEach((task, taskId) => {
      if (task.status !== 'failed') {
        newTasks.set(taskId, task)
      }
    })
    downloadTasks.value = newTasks
  }

  // 清除所有任务
  const clearAllTasks = () => {
    downloadTasks.value = new Map()
  }

  // 重试失败的任务
  const retryFailedTask = async (taskId) => {
    const task = downloadTasks.value.get(taskId)
    if (!task || task.status !== 'failed') {
      return false
    }

    // 重置任务状态
    task.status = 'pending'
    task.progress = 0
    task.downloadedSize = 0
    task.error = null
    task.startTime = Date.now()
    task.endTime = null
    downloadTasks.value = new Map(downloadTasks.value)

    // 重新下载
    const song = {
      id: task.songId,
      name: task.songName,
      artists: task.artists,
      album: task.album
    }

    return await downloadSong(song)
  }

  // 清除错误
  const clearError = () => {
    error.value = null
  }

  // 初始化时设置监听器
  setupProgressListener()

  return {
    // 状态
    downloadTasks,
    downloadQueue,
    isDownloading,
    loading,
    error,
    // 计算属性
    activeTasks,
    completedTasks,
    failedTasks,
    totalProgress,
    // 方法
    setupProgressListener,
    checkDiskSpace,
    downloadSong,
    downloadPlaylist,
    cancelDownload,
    pauseDownload,
    resumeDownload,
    getTaskProgress,
    getTaskStatus,
    clearCompletedTasks,
    clearFailedTasks,
    clearAllTasks,
    retryFailedTask,
    clearError
  }
})

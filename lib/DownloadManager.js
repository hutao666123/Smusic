const fs = require('fs').promises
const path = require('path')
const https = require('https')
const http = require('http')

/**
 * DownloadManager 类处理歌曲下载任务
 */
class DownloadManager {
  constructor(fileManager, playlistManager, downloadPath) {
    this.fileManager = fileManager
    this.playlistManager = playlistManager
    this.downloadPath = downloadPath || fileManager.songsDir
    
    // 下载任务映射表 taskId -> DownloadTask
    this.tasks = new Map()
    
    // 下载队列
    this.queue = []
    
    // 并发控制
    this.maxConcurrent = 3
    this.activeDownloads = 0
    
    // 任务 ID 计数器
    this.taskIdCounter = 0
    
    // 初始化标志
    this.initialized = false
    
    // 初始化下载目录（异步）
    this._initDownloadDir().then(() => {
      this.initialized = true
      console.log('DownloadManager 初始化完成')
    }).catch(err => {
      console.error('DownloadManager 初始化失败:', err)
    })
  }
  
  /**
   * 初始化下载目录
   */
  async _initDownloadDir() {
    try {
      await fs.mkdir(this.downloadPath, { recursive: true })
      console.log('下载目录已创建:', this.downloadPath)
    } catch (error) {
      console.error('创建下载目录失败:', error)
    }
  }

  /**
   * 生成唯一的任务 ID
   */
  _generateTaskId() {
    return `download-${Date.now()}-${++this.taskIdCounter}`
  }

  /**
   * 创建下载任务对象
   */
  _createTask(songId, songName, songUrl, metadata) {
    return {
      id: this._generateTaskId(),
      songId,
      songName,
      songUrl,
      metadata,
      status: 'pending',
      progress: 0,
      downloadedSize: 0,
      totalSize: 0,
      speed: 0,
      error: null,
      startTime: Date.now(),
      endTime: null,
      localPath: null,
      fileSize: null,
      quality: metadata.quality || 'standard'
    }
  }

  /**
   * 检查歌曲是否已下载
   * @param {string} songId - 歌曲 ID
   */
  async isDownloaded(songId) {
    try {
      const result = await this.playlistManager.getDownloads()
      if (!result.success) {
        return { success: true, data: false }
      }
      
      // 处理嵌套结构
      const songs = result.data?.data?.songs || result.data?.songs || []
      const downloaded = songs.some(s => s.id === songId)
      return { success: true, data: downloaded }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CHECK_DOWNLOADED_ERROR',
          message: '检查下载状态失败',
          details: error.message
        }
      }
    }
  }

  /**
   * 下载单曲
   * @param {string} songId - 歌曲 ID
   * @param {string} songUrl - 歌曲播放链接
   * @param {Object} metadata - 歌曲元数据
   */
  async downloadSong(songId, songUrl, metadata) {
    try {
      console.log('=== downloadSong 开始 ===')
      console.log('参数:', { songId, songUrl, metadata })
      
      // 等待初始化完成
      if (!this.initialized) {
        console.log('等待 DownloadManager 初始化...')
        await this._initDownloadDir()
        this.initialized = true
      }
      
      console.log('下载目录:', this.downloadPath)
      
      // 检查是否已下载
      const checkResult = await this.isDownloaded(songId)
      console.log('检查是否已下载:', checkResult)
      
      if (checkResult.success && checkResult.data) {
        console.log('歌曲已下载，跳过')
        return {
          success: true,
          data: null,
          message: '歌曲已下载，跳过'
        }
      }
      
      console.log('创建下载任务...')
      // 创建下载任务
      const task = this._createTask(songId, metadata.name, songUrl, metadata)
      this.tasks.set(task.id, task)
      
      console.log('任务已创建:', task.id, '状态:', task.status)
      
      // 添加到队列
      this.queue.push(task.id)
      console.log('任务已加入队列，队列长度:', this.queue.length)
      console.log('当前活跃下载数:', this.activeDownloads, '最大并发:', this.maxConcurrent)
      
      // 开始处理队列
      console.log('开始处理队列...')
      this._processQueue()
      
      return {
        success: true,
        data: {
          taskId: task.id,
          status: task.status
        }
      }
    } catch (error) {
      console.error('downloadSong 错误:', error)
      return {
        success: false,
        error: {
          code: 'DOWNLOAD_SONG_ERROR',
          message: '创建下载任务失败',
          details: error.message
        }
      }
    }
  }

  /**
   * 处理下载队列
   */
  async _processQueue() {
    console.log('_processQueue 被调用')
    console.log('当前活跃下载:', this.activeDownloads, '队列长度:', this.queue.length)
    
    // 如果已达到最大并发数，不处理
    if (this.activeDownloads >= this.maxConcurrent) {
      console.log('已达到最大并发数，等待...')
      return
    }
    
    // 如果队列为空，不处理
    if (this.queue.length === 0) {
      console.log('队列为空')
      return
    }
    
    // 从队列中取出任务
    const taskId = this.queue.shift()
    console.log('从队列取出任务:', taskId)
    
    const task = this.tasks.get(taskId)
    
    if (!task || task.status !== 'pending') {
      console.log('任务不存在或状态不是 pending:', task?.status)
      // 继续处理下一个
      this._processQueue()
      return
    }
    
    // 增加活跃下载数
    this.activeDownloads++
    console.log('开始执行下载，活跃下载数:', this.activeDownloads)
    
    // 执行下载
    try {
      await this._executeDownload(task)
      console.log('下载执行完成:', taskId)
    } catch (error) {
      console.error('下载执行失败:', error)
      task.status = 'failed'
      task.error = error.message
      task.endTime = Date.now()
    } finally {
      // 减少活跃下载数
      this.activeDownloads--
      console.log('下载完成，活跃下载数:', this.activeDownloads)
      
      // 继续处理队列
      this._processQueue()
    }
  }

  /**
   * 清理文件名中的非法字符
   */
  _sanitizeFileName(fileName) {
    // 移除或替换文件名中的非法字符
    return fileName.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_').trim()
  }

  /**
   * 执行实际的下载操作
   */
  async _executeDownload(task) {
    return new Promise((resolve, reject) => {
      console.log('=== _executeDownload 开始 ===')
      console.log('任务:', task.id, '歌曲:', task.songName)
      console.log('URL:', task.songUrl)
      
      // 更新任务状态
      task.status = 'downloading'
      task.startTime = Date.now()
      
      // 确定文件扩展名
      const ext = '.mp3' // 默认使用 mp3
      const sanitizedId = this._sanitizeFileName(String(task.songId))
      const fileName = `${sanitizedId}${ext}`
      const filePath = path.join(this.downloadPath, fileName)
      
      console.log('文件路径:', filePath)
      
      // 选择 http 或 https
      const protocol = task.songUrl.startsWith('https') ? https : http
      console.log('使用协议:', task.songUrl.startsWith('https') ? 'https' : 'http')
      
      // 发起下载请求
      console.log('发起下载请求...')
      const request = protocol.get(task.songUrl, (response) => {
        console.log('收到响应，状态码:', response.statusCode)
        // 检查响应状态
        if (response.statusCode !== 200) {
          console.error('HTTP 错误:', response.statusCode)
          task.status = 'failed'
          task.error = `HTTP ${response.statusCode}`
          task.endTime = Date.now()
          reject(new Error(`HTTP ${response.statusCode}`))
          return
        }
        
        // 获取文件总大小
        task.totalSize = parseInt(response.headers['content-length'] || '0', 10)
        console.log('文件大小:', task.totalSize, '字节')
        
        // 创建写入流
        console.log('创建文件写入流...')
        const fileStream = require('fs').createWriteStream(filePath)
        
        // 记录下载开始时间（用于计算速度）
        let lastTime = Date.now()
        let lastSize = 0
        
        // 监听数据接收
        response.on('data', (chunk) => {
          task.downloadedSize += chunk.length
          
          // 计算进度
          if (task.totalSize > 0) {
            task.progress = Math.floor((task.downloadedSize / task.totalSize) * 100)
          }
          
          // 计算速度（每秒更新一次）
          const now = Date.now()
          const timeDiff = now - lastTime
          if (timeDiff >= 1000) {
            const sizeDiff = task.downloadedSize - lastSize
            task.speed = Math.floor(sizeDiff / (timeDiff / 1000))
            lastTime = now
            lastSize = task.downloadedSize
          }
        })
        
        // 管道到文件
        response.pipe(fileStream)
        
        // 下载完成
        fileStream.on('finish', async () => {
          console.log('文件写入完成')
          fileStream.close()
          
          // 更新任务状态
          task.status = 'completed'
          task.progress = 100
          task.endTime = Date.now()
          task.localPath = filePath
          task.fileSize = task.downloadedSize
          
          console.log('下载完成！')
          console.log('- 任务ID:', task.id)
          console.log('- 歌曲:', task.songName)
          console.log('- 文件路径:', filePath)
          console.log('- 文件大小:', task.fileSize, '字节')
          
          // 添加到"已下载"歌单
          try {
            console.log('准备添加到已下载歌单...')
            console.log('metadata:', JSON.stringify(task.metadata, null, 2))
            
            const addResult = await this.playlistManager.addToDownloads(
              task.metadata,
              filePath,
              task.fileSize,
              task.quality
            )
            
            console.log('添加到已下载歌单结果:', addResult)
            
            if (addResult.success) {
              console.log('✅ 成功添加到已下载歌单')
            } else {
              console.error('❌ 添加到已下载歌单失败:', addResult.error)
            }
          } catch (error) {
            // 记录错误但不影响下载状态
            console.error('❌ 添加到已下载歌单异常:', error)
          }
          
          resolve()
        })
        
        // 处理错误
        fileStream.on('error', async (error) => {
          task.status = 'failed'
          task.error = error.message
          task.endTime = Date.now()
          
          // 删除未完成的文件
          try {
            await fs.unlink(filePath)
          } catch (e) {
            // 忽略删除错误
          }
          
          reject(error)
        })
      })
      
      // 处理请求错误
      request.on('error', async (error) => {
        task.status = 'failed'
        task.error = error.message
        task.endTime = Date.now()
        
        // 删除未完成的文件
        try {
          await fs.unlink(filePath)
        } catch (e) {
          // 忽略删除错误
        }
        
        reject(error)
      })
      
      // 保存请求对象以便取消
      task.request = request
    })
  }

  /**
   * 取消下载
   * @param {string} taskId - 任务 ID
   */
  async cancelDownload(taskId) {
    try {
      const task = this.tasks.get(taskId)
      
      if (!task) {
        return {
          success: false,
          error: {
            code: 'TASK_NOT_FOUND',
            message: '任务不存在'
          }
        }
      }
      
      // 如果任务正在下载，中止请求
      if (task.status === 'downloading' && task.request) {
        task.request.destroy()
      }
      
      // 更新任务状态
      task.status = 'cancelled'
      task.endTime = Date.now()
      
      // 删除未完成的文件
      if (task.localPath) {
        try {
          await fs.unlink(task.localPath)
        } catch (error) {
          // 忽略删除错误
        }
      }
      
      // 从队列中移除
      const queueIndex = this.queue.indexOf(taskId)
      if (queueIndex !== -1) {
        this.queue.splice(queueIndex, 1)
      }
      
      return {
        success: true,
        data: task
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CANCEL_DOWNLOAD_ERROR',
          message: '取消下载失败',
          details: error.message
        }
      }
    }
  }

  /**
   * 暂停下载
   * @param {string} taskId - 任务 ID
   */
  async pauseDownload(taskId) {
    try {
      const task = this.tasks.get(taskId)
      
      if (!task) {
        return {
          success: false,
          error: {
            code: 'TASK_NOT_FOUND',
            message: '任务不存在'
          }
        }
      }
      
      if (task.status !== 'downloading') {
        return {
          success: false,
          error: {
            code: 'INVALID_STATUS',
            message: '任务不在下载中'
          }
        }
      }
      
      // 中止请求
      if (task.request) {
        task.request.destroy()
      }
      
      // 更新状态为暂停
      task.status = 'paused'
      
      return {
        success: true,
        data: task
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'PAUSE_DOWNLOAD_ERROR',
          message: '暂停下载失败',
          details: error.message
        }
      }
    }
  }

  /**
   * 恢复下载
   * @param {string} taskId - 任务 ID
   */
  async resumeDownload(taskId) {
    try {
      const task = this.tasks.get(taskId)
      
      if (!task) {
        return {
          success: false,
          error: {
            code: 'TASK_NOT_FOUND',
            message: '任务不存在'
          }
        }
      }
      
      if (task.status !== 'paused') {
        return {
          success: false,
          error: {
            code: 'INVALID_STATUS',
            message: '任务不在暂停状态'
          }
        }
      }
      
      // 重置状态为待处理
      task.status = 'pending'
      
      // 重新添加到队列
      this.queue.push(taskId)
      
      // 处理队列
      this._processQueue()
      
      return {
        success: true,
        data: task
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'RESUME_DOWNLOAD_ERROR',
          message: '恢复下载失败',
          details: error.message
        }
      }
    }
  }

  /**
   * 获取下载进度
   * @param {string} taskId - 任务 ID
   */
  getDownloadProgress(taskId) {
    try {
      const task = this.tasks.get(taskId)
      
      if (!task) {
        return {
          success: false,
          error: {
            code: 'TASK_NOT_FOUND',
            message: '任务不存在'
          }
        }
      }
      
      return {
        success: true,
        data: {
          id: task.id,
          songId: task.songId,
          songName: task.songName,
          status: task.status,
          progress: task.progress,
          downloadedSize: task.downloadedSize,
          totalSize: task.totalSize,
          speed: task.speed,
          error: task.error
        }
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'GET_PROGRESS_ERROR',
          message: '获取进度失败',
          details: error.message
        }
      }
    }
  }

  /**
   * 获取所有下载任务
   */
  getAllTasks() {
    try {
      const tasks = Array.from(this.tasks.values()).map(task => ({
        id: task.id,
        songId: task.songId,
        songName: task.songName,
        status: task.status,
        progress: task.progress,
        downloadedSize: task.downloadedSize,
        totalSize: task.totalSize,
        speed: task.speed,
        error: task.error,
        startTime: task.startTime,
        endTime: task.endTime
      }))
      
      return {
        success: true,
        data: tasks
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'GET_ALL_TASKS_ERROR',
          message: '获取任务列表失败',
          details: error.message
        }
      }
    }
  }

  /**
   * 清理失败的下载
   * @param {string} taskId - 任务 ID
   */
  async cleanupFailedDownload(taskId) {
    try {
      const task = this.tasks.get(taskId)
      
      if (!task) {
        return {
          success: false,
          error: {
            code: 'TASK_NOT_FOUND',
            message: '任务不存在'
          }
        }
      }
      
      // 删除未完成的文件
      if (task.localPath) {
        try {
          await fs.unlink(task.localPath)
        } catch (error) {
          // 文件可能已经不存在
        }
      }
      
      // 从任务列表中移除
      this.tasks.delete(taskId)
      
      return {
        success: true,
        data: { cleaned: true }
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CLEANUP_ERROR',
          message: '清理失败',
          details: error.message
        }
      }
    }
  }

  /**
   * 批量下载歌单
   * @param {Array} songs - 歌曲列表
   * @param {Function} onProgress - 进度回调函数
   * @returns {Promise} 返回批量下载结果，包含统计信息
   */
  async downloadPlaylist(songs, onProgress) {
    try {
      const results = {
        total: songs.length,
        success: 0,
        failed: 0,
        skipped: 0,
        tasks: [],
        batchId: `batch-${Date.now()}`
      }
      
      // 为每首歌曲创建下载任务
      for (const song of songs) {
        try {
          // 检查是否已下载
          const checkResult = await this.isDownloaded(song.id)
          if (checkResult.success && checkResult.data) {
            results.skipped++
            if (onProgress) {
              onProgress({
                current: results.success + results.failed + results.skipped,
                total: results.total,
                status: 'skipped',
                song: song
              })
            }
            continue
          }
          
          // 创建下载任务（需要 songUrl，这里假设从 song 对象获取）
          const downloadResult = await this.downloadSong(
            song.id,
            song.url || song.songUrl,
            song
          )
          
          if (downloadResult.success && downloadResult.data) {
            results.tasks.push(downloadResult.data.taskId)
          }
        } catch (error) {
          // 错误隔离：单个歌曲失败不影响其他歌曲
          results.failed++
          if (onProgress) {
            onProgress({
              current: results.success + results.failed + results.skipped,
              total: results.total,
              status: 'failed',
              song: song,
              error: error.message
            })
          }
        }
      }
      
      // 等待所有任务完成或失败
      await this._waitForBatchCompletion(results.tasks, (taskId, status) => {
        if (status === 'completed') {
          results.success++
        } else if (status === 'failed') {
          results.failed++
        }
        
        if (onProgress) {
          onProgress({
            current: results.success + results.failed + results.skipped,
            total: results.total,
            status: status,
            taskId: taskId
          })
        }
      })
      
      return {
        success: true,
        data: results
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'DOWNLOAD_PLAYLIST_ERROR',
          message: '批量下载失败',
          details: error.message
        }
      }
    }
  }

  /**
   * 等待批量下载完成
   * @param {Array} taskIds - 任务 ID 列表
   * @param {Function} onTaskComplete - 任务完成回调
   */
  async _waitForBatchCompletion(taskIds, onTaskComplete) {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        let allCompleted = true
        
        for (const taskId of taskIds) {
          const task = this.tasks.get(taskId)
          if (!task) continue
          
          if (task.status === 'pending' || task.status === 'downloading') {
            allCompleted = false
          } else if (task.status === 'completed' || task.status === 'failed') {
            // 通知任务完成
            if (onTaskComplete && !task._notified) {
              onTaskComplete(taskId, task.status)
              task._notified = true
            }
          }
        }
        
        if (allCompleted) {
          clearInterval(checkInterval)
          resolve()
        }
      }, 100)
    })
  }

  /**
   * 暂停批量下载
   * @param {string} batchId - 批次 ID
   */
  async pauseBatch(batchId) {
    try {
      // 暂停所有待处理和下载中的任务
      const pausedTasks = []
      
      for (const [taskId, task] of this.tasks.entries()) {
        if (task.status === 'downloading' || task.status === 'pending') {
          const pauseResult = await this.pauseDownload(taskId)
          if (pauseResult.success) {
            pausedTasks.push(taskId)
          }
        }
      }
      
      return {
        success: true,
        data: {
          batchId,
          pausedTasks
        }
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'PAUSE_BATCH_ERROR',
          message: '暂停批量下载失败',
          details: error.message
        }
      }
    }
  }

  /**
   * 恢复批量下载
   * @param {string} batchId - 批次 ID
   */
  async resumeBatch(batchId) {
    try {
      // 恢复所有暂停的任务
      const resumedTasks = []
      
      for (const [taskId, task] of this.tasks.entries()) {
        if (task.status === 'paused') {
          const resumeResult = await this.resumeDownload(taskId)
          if (resumeResult.success) {
            resumedTasks.push(taskId)
          }
        }
      }
      
      return {
        success: true,
        data: {
          batchId,
          resumedTasks
        }
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'RESUME_BATCH_ERROR',
          message: '恢复批量下载失败',
          details: error.message
        }
      }
    }
  }
}

module.exports = DownloadManager

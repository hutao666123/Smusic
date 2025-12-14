const fs = require('fs').promises
const path = require('path')

/**
 * FileManager 类处理所有文件系统操作
 */
class FileManager {
  constructor(userDataPath, options = {}) {
    this.userDataPath = userDataPath
    this.dataDir = path.join(userDataPath, 'data')
    this.downloadsDir = path.join(userDataPath, 'downloads')
    this.songsDir = path.join(this.downloadsDir, 'songs')
    this.coversDir = path.join(this.downloadsDir, 'covers')
    this.lyricsDir = path.join(this.downloadsDir, 'lyrics')
    
    // 防抖相关
    this.pendingWrites = new Map() // 存储待写入的数据 { filePath: { data, timer } }
    // 在测试环境中默认禁用防抖，在生产环境中使用 500ms 延迟
    const defaultDelay = process.env.NODE_ENV === 'test' ? 0 : 500
    this.debounceDelay = options.debounceDelay !== undefined ? options.debounceDelay : defaultDelay
    this.isShuttingDown = false // 标记是否正在关闭
  }

  /**
   * 初始化数据目录
   */
  async initDataDirectory() {
    try {
      // 创建主数据目录
      await fs.mkdir(this.dataDir, { recursive: true })
      
      // 创建下载相关目录
      await fs.mkdir(this.downloadsDir, { recursive: true })
      await fs.mkdir(this.songsDir, { recursive: true })
      await fs.mkdir(this.coversDir, { recursive: true })
      await fs.mkdir(this.lyricsDir, { recursive: true })
      
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'INIT_DIR_ERROR',
          message: '初始化数据目录失败',
          details: error.message
        }
      }
    }
  }

  /**
   * 读取 JSON 文件
   * @param {string} filePath - 文件路径（相对于 dataDir）
   * @returns {Promise<Object>} 解析后的 JSON 对象
   */
  async readJSON(filePath) {
    try {
      const fullPath = path.join(this.dataDir, filePath)
      const data = await fs.readFile(fullPath, 'utf-8')
      return {
        success: true,
        data: JSON.parse(data)
      }
    } catch (error) {
      if (error.code === 'ENOENT') {
        return {
          success: false,
          error: {
            code: 'FILE_NOT_FOUND',
            message: '文件不存在',
            details: error.message
          }
        }
      }
      
      if (error instanceof SyntaxError) {
        return {
          success: false,
          error: {
            code: 'JSON_PARSE_ERROR',
            message: 'JSON 解析失败',
            details: error.message
          }
        }
      }
      
      return {
        success: false,
        error: {
          code: 'READ_ERROR',
          message: '读取文件失败',
          details: error.message
        }
      }
    }
  }

  /**
   * 写入 JSON 文件（带防抖）
   * @param {string} filePath - 文件路径（相对于 dataDir）
   * @param {Object} data - 要写入的数据对象
   * @param {boolean} immediate - 是否立即写入（跳过防抖）
   */
  async writeJSON(filePath, data, immediate = false) {
    // 如果正在关闭或要求立即写入，直接执行写入
    if (this.isShuttingDown || immediate) {
      return await this._performWrite(filePath, data)
    }
    
    // 取消该文件的现有定时器
    if (this.pendingWrites.has(filePath)) {
      clearTimeout(this.pendingWrites.get(filePath).timer)
    }
    
    // 创建新的防抖定时器
    return new Promise((resolve) => {
      const timer = setTimeout(async () => {
        const result = await this._performWrite(filePath, data)
        this.pendingWrites.delete(filePath)
        resolve(result)
      }, this.debounceDelay)
      
      // 存储待写入的数据和定时器
      this.pendingWrites.set(filePath, { data, timer, resolve })
    })
  }

  /**
   * 执行实际的文件写入操作
   * @private
   * @param {string} filePath - 文件路径（相对于 dataDir）
   * @param {Object} data - 要写入的数据对象
   */
  async _performWrite(filePath, data) {
    try {
      const fullPath = path.join(this.dataDir, filePath)
      
      // 确保目录存在
      const dir = path.dirname(fullPath)
      await fs.mkdir(dir, { recursive: true })
      
      // 写入 JSON 文件（格式化输出）
      await fs.writeFile(fullPath, JSON.stringify(data, null, 2), 'utf-8')
      
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'WRITE_ERROR',
          message: '写入文件失败',
          details: error.message
        }
      }
    }
  }

  /**
   * 检查文件是否存在
   * @param {string} filePath - 文件路径（相对于 dataDir）
   * @returns {Promise<boolean>}
   */
  async fileExists(filePath) {
    try {
      const fullPath = path.join(this.dataDir, filePath)
      await fs.access(fullPath)
      return { success: true, data: true }
    } catch (error) {
      if (error.code === 'ENOENT') {
        return { success: true, data: false }
      }
      return {
        success: false,
        error: {
          code: 'ACCESS_ERROR',
          message: '检查文件存在性失败',
          details: error.message
        }
      }
    }
  }

  /**
   * 删除文件
   * @param {string} filePath - 文件路径（相对于 dataDir）
   */
  async deleteFile(filePath) {
    try {
      const fullPath = path.join(this.dataDir, filePath)
      await fs.unlink(fullPath)
      return { success: true }
    } catch (error) {
      if (error.code === 'ENOENT') {
        return {
          success: false,
          error: {
            code: 'FILE_NOT_FOUND',
            message: '文件不存在',
            details: error.message
          }
        }
      }
      return {
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: '删除文件失败',
          details: error.message
        }
      }
    }
  }

  /**
   * 获取文件大小
   * @param {string} filePath - 文件路径（可以是相对于 dataDir 或绝对路径）
   * @returns {Promise<number>} 文件大小（字节）
   */
  async getFileSize(filePath) {
    try {
      // 如果是绝对路径，直接使用；否则相对于 dataDir
      const fullPath = path.isAbsolute(filePath) 
        ? filePath 
        : path.join(this.dataDir, filePath)
      
      const stats = await fs.stat(fullPath)
      return { success: true, data: stats.size }
    } catch (error) {
      if (error.code === 'ENOENT') {
        return {
          success: false,
          error: {
            code: 'FILE_NOT_FOUND',
            message: '文件不存在',
            details: error.message
          }
        }
      }
      return {
        success: false,
        error: {
          code: 'STAT_ERROR',
          message: '获取文件信息失败',
          details: error.message
        }
      }
    }
  }

  /**
   * 获取目录大小（递归计算所有文件）
   * @param {string} dirPath - 目录路径（绝对路径）
   * @returns {Promise<number>} 目录总大小（字节）
   */
  async getDirectorySize(dirPath) {
    try {
      let totalSize = 0
      
      const files = await fs.readdir(dirPath, { withFileTypes: true })
      
      for (const file of files) {
        const filePath = path.join(dirPath, file.name)
        
        if (file.isDirectory()) {
          const result = await this.getDirectorySize(filePath)
          if (result.success) {
            totalSize += result.data
          }
        } else {
          const result = await this.getFileSize(filePath)
          if (result.success) {
            totalSize += result.data
          }
        }
      }
      
      return { success: true, data: totalSize }
    } catch (error) {
      if (error.code === 'ENOENT') {
        return {
          success: false,
          error: {
            code: 'DIR_NOT_FOUND',
            message: '目录不存在',
            details: error.message
          }
        }
      }
      return {
        success: false,
        error: {
          code: 'DIR_SIZE_ERROR',
          message: '获取目录大小失败',
          details: error.message
        }
      }
    }
  }

  /**
   * 获取磁盘可用空间
   * @param {string} dirPath - 目录路径
   * @returns {Promise<Object>} 磁盘空间信息
   */
  async getDiskSpace(dirPath) {
    try {
      // 使用 Node.js 的 fs.statfs (需要 Node.js 18+)
      // 如果不支持，返回一个大的默认值
      if (typeof fs.statfs === 'function') {
        const stats = await fs.statfs(dirPath)
        return {
          success: true,
          data: {
            available: stats.bavail * stats.bsize,
            free: stats.bfree * stats.bsize,
            total: stats.blocks * stats.bsize
          }
        }
      } else {
        // 降级方案：返回一个大的默认值（10GB）
        return {
          success: true,
          data: {
            available: 10 * 1024 * 1024 * 1024,
            free: 10 * 1024 * 1024 * 1024,
            total: 100 * 1024 * 1024 * 1024
          }
        }
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'DISK_SPACE_ERROR',
          message: '获取磁盘空间失败',
          details: error.message
        }
      }
    }
  }

  /**
   * 立即写入所有待处理的数据
   * @returns {Promise<Object>} 写入结果
   */
  async flush() {
    const results = []
    const pendingEntries = Array.from(this.pendingWrites.entries())
    
    // 清除所有定时器
    for (const [filePath, { timer }] of pendingEntries) {
      clearTimeout(timer)
    }
    
    // 立即写入所有待处理的数据
    for (const [filePath, { data, resolve }] of pendingEntries) {
      const result = await this._performWrite(filePath, data)
      results.push({ filePath, result })
      
      // 解析原始的 Promise
      if (resolve) {
        resolve(result)
      }
    }
    
    // 清空待写入队列
    this.pendingWrites.clear()
    
    return {
      success: true,
      data: {
        flushedCount: results.length,
        results
      }
    }
  }

  /**
   * 准备关闭：写入所有待处理的数据
   * 应该在应用关闭前调用
   * @returns {Promise<Object>}
   */
  async shutdown() {
    this.isShuttingDown = true
    return await this.flush()
  }

  /**
   * 获取待写入的文件数量
   * @returns {number}
   */
  getPendingWriteCount() {
    return this.pendingWrites.size
  }
}

module.exports = FileManager

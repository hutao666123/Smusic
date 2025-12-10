const path = require('path')

/**
 * PlaylistManager 类管理所有歌单相关的业务逻辑
 */
class PlaylistManager {
  constructor(fileManager) {
    this.fileManager = fileManager
    
    // 文件路径常量
    this.FAVORITES_FILE = 'favorites.json'
    this.DOWNLOADS_FILE = 'downloads.json'
    this.CUSTOM_PLAYLISTS_FILE = 'custom-playlists.json'
    this.COLLECTED_PLAYLISTS_FILE = 'collected-playlists.json'
    
    // 系统歌单 ID
    this.SYSTEM_PLAYLIST_IDS = ['local-favorites', 'local-downloads']
    
    // 添加下载歌单的操作锁
    this.downloadsLock = Promise.resolve()
  }

  /**
   * 初始化默认数据结构
   */
  _createDefaultFavorites() {
    return {
      version: '1.0',
      id: 'local-favorites',
      name: '我喜欢的音乐',
      createTime: Date.now(),
      updateTime: Date.now(),
      songs: []
    }
  }

  _createDefaultDownloads() {
    return {
      version: '1.0',
      id: 'local-downloads',
      name: '已下载',
      createTime: Date.now(),
      updateTime: Date.now(),
      songs: []
    }
  }

  _createDefaultCustomPlaylists() {
    return {
      version: '1.0',
      playlists: []
    }
  }

  _createDefaultCollectedPlaylists() {
    return {
      version: '1.0',
      playlists: []
    }
  }

  /**
   * 我喜欢的音乐 - 添加歌曲
   * @param {Object} song - 歌曲对象
   */
  async addToFavorites(song) {
    try {
      // 读取现有数据
      let result = await this.fileManager.readJSON(this.FAVORITES_FILE)
      let favorites
      
      if (!result.success) {
        // 文件不存在，创建默认数据
        favorites = this._createDefaultFavorites()
      } else {
        favorites = result.data
      }
      
      // 检查是否已存在
      const exists = favorites.songs.some(s => s.id === song.id)
      if (exists) {
        return {
          success: true,
          data: favorites,
          message: '歌曲已在喜欢列表中'
        }
      }
      
      // 添加歌曲（包含添加时间戳）
      const songWithTime = {
        ...song,
        addTime: Date.now()
      }
      favorites.songs.push(songWithTime)
      favorites.updateTime = Date.now()
      
      // 保存到文件
      const writeResult = await this.fileManager.writeJSON(this.FAVORITES_FILE, favorites)
      if (!writeResult.success) {
        return writeResult
      }
      
      return {
        success: true,
        data: favorites
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'ADD_TO_FAVORITES_ERROR',
          message: '添加到喜欢失败',
          details: error.message
        }
      }
    }
  }

  /**
   * 我喜欢的音乐 - 移除歌曲
   * @param {string} songId - 歌曲 ID
   */
  async removeFromFavorites(songId) {
    try {
      const result = await this.fileManager.readJSON(this.FAVORITES_FILE)
      
      if (!result.success) {
        return {
          success: false,
          error: {
            code: 'FAVORITES_NOT_FOUND',
            message: '喜欢列表不存在'
          }
        }
      }
      
      const favorites = result.data
      const originalLength = favorites.songs.length
      
      // 移除歌曲
      favorites.songs = favorites.songs.filter(s => s.id !== songId)
      favorites.updateTime = Date.now()
      
      // 如果没有变化，直接返回
      if (favorites.songs.length === originalLength) {
        return {
          success: true,
          data: favorites,
          message: '歌曲不在喜欢列表中'
        }
      }
      
      // 保存到文件
      const writeResult = await this.fileManager.writeJSON(this.FAVORITES_FILE, favorites)
      if (!writeResult.success) {
        return writeResult
      }
      
      return {
        success: true,
        data: favorites
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'REMOVE_FROM_FAVORITES_ERROR',
          message: '从喜欢移除失败',
          details: error.message
        }
      }
    }
  }

  /**
   * 我喜欢的音乐 - 获取列表
   */
  async getFavorites() {
    try {
      const result = await this.fileManager.readJSON(this.FAVORITES_FILE)
      
      if (!result.success) {
        // 文件不存在或损坏
        const favorites = this._createDefaultFavorites()
        
        // 如果是 JSON 解析错误，记录错误并创建新文件
        if (result.error && result.error.code === 'JSON_PARSE_ERROR') {
          await this.fileManager.writeJSON(this.FAVORITES_FILE, favorites)
        }
        
        return {
          success: true,
          data: favorites
        }
      }
      
      return {
        success: true,
        data: result.data
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'GET_FAVORITES_ERROR',
          message: '获取喜欢列表失败',
          details: error.message
        }
      }
    }
  }

  /**
   * 我喜欢的音乐 - 检查是否喜欢
   * @param {string} songId - 歌曲 ID
   */
  async isFavorite(songId) {
    try {
      const result = await this.getFavorites()
      
      if (!result.success) {
        return result
      }
      
      const isFav = result.data.songs.some(s => s.id === songId)
      
      return {
        success: true,
        data: isFav
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'IS_FAVORITE_ERROR',
          message: '检查喜欢状态失败',
          details: error.message
        }
      }
    }
  }

  /**
   * 生成唯一的歌单 ID（使用时间戳 + 随机数）
   */
  _generatePlaylistId() {
    return `custom-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  }

  /**
   * 自定义歌单 - 创建歌单
   * @param {string} name - 歌单名称
   * @param {string} description - 歌单描述
   */
  async createPlaylist(name, description = '') {
    try {
      // 读取现有数据
      let result = await this.fileManager.readJSON(this.CUSTOM_PLAYLISTS_FILE)
      
      let data
      
      if (!result.success) {
        data = this._createDefaultCustomPlaylists()
      } else {
        data = result.data
      }
      
      // 创建新歌单
      const newPlaylist = {
        id: this._generatePlaylistId(),
        name,
        description,
        coverUrl: '',
        createTime: Date.now(),
        updateTime: Date.now(),
        songs: [],
        type: 'custom'
      }
      
      data.playlists.push(newPlaylist)
      
      // 保存到文件
      const writeResult = await this.fileManager.writeJSON(this.CUSTOM_PLAYLISTS_FILE, data)
      if (!writeResult.success) {
        return writeResult
      }
      
      return {
        success: true,
        data: data.playlists  // 返回完整的歌单列表
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CREATE_PLAYLIST_ERROR',
          message: '创建歌单失败',
          details: error.message
        }
      }
    }
  }

  /**
   * 自定义歌单 - 更新歌单信息
   * @param {string} playlistId - 歌单 ID
   * @param {Object} updates - 更新的数据 {name, description, coverUrl}
   */
  async updatePlaylist(playlistId, updates) {
    try {
      const result = await this.fileManager.readJSON(this.CUSTOM_PLAYLISTS_FILE)
      
      if (!result.success) {
        return {
          success: false,
          error: {
            code: 'PLAYLISTS_NOT_FOUND',
            message: '歌单列表不存在'
          }
        }
      }
      
      const data = result.data
      const playlist = data.playlists.find(p => p.id === playlistId)
      
      if (!playlist) {
        return {
          success: false,
          error: {
            code: 'PLAYLIST_NOT_FOUND',
            message: '歌单不存在'
          }
        }
      }
      
      // 更新字段
      if (updates.name !== undefined) playlist.name = updates.name
      if (updates.description !== undefined) playlist.description = updates.description
      if (updates.coverUrl !== undefined) playlist.coverUrl = updates.coverUrl
      playlist.updateTime = Date.now()
      
      // 保存到文件
      const writeResult = await this.fileManager.writeJSON(this.CUSTOM_PLAYLISTS_FILE, data)
      if (!writeResult.success) {
        return writeResult
      }
      
      return {
        success: true,
        data: data.playlists  // 返回完整的歌单列表
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UPDATE_PLAYLIST_ERROR',
          message: '更新歌单失败',
          details: error.message
        }
      }
    }
  }

  /**
   * 自定义歌单 - 删除歌单
   * @param {string} playlistId - 歌单 ID
   */
  async deletePlaylist(playlistId) {
    try {
      // 检查是否为系统歌单
      if (this.SYSTEM_PLAYLIST_IDS.includes(playlistId)) {
        return {
          success: false,
          error: {
            code: 'SYSTEM_PLAYLIST_PROTECTED',
            message: '系统歌单不能删除'
          }
        }
      }
      
      const result = await this.fileManager.readJSON(this.CUSTOM_PLAYLISTS_FILE)
      
      if (!result.success) {
        return {
          success: false,
          error: {
            code: 'PLAYLISTS_NOT_FOUND',
            message: '歌单列表不存在'
          }
        }
      }
      
      const data = result.data
      const originalLength = data.playlists.length
      
      // 删除歌单
      data.playlists = data.playlists.filter(p => p.id !== playlistId)
      
      if (data.playlists.length === originalLength) {
        return {
          success: false,
          error: {
            code: 'PLAYLIST_NOT_FOUND',
            message: '歌单不存在'
          }
        }
      }
      
      // 保存到文件
      const writeResult = await this.fileManager.writeJSON(this.CUSTOM_PLAYLISTS_FILE, data)
      if (!writeResult.success) {
        return writeResult
      }
      
      return {
        success: true,
        data: data.playlists  // 返回完整的歌单列表
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'DELETE_PLAYLIST_ERROR',
          message: '删除歌单失败',
          details: error.message
        }
      }
    }
  }

  /**
   * 自定义歌单 - 获取所有自定义歌单
   */
  async getCustomPlaylists() {
    try {
      const result = await this.fileManager.readJSON(this.CUSTOM_PLAYLISTS_FILE)
      
      if (!result.success) {
        // 文件不存在或损坏
        const data = this._createDefaultCustomPlaylists()
        
        // 如果是 JSON 解析错误，记录错误并创建新文件
        if (result.error && result.error.code === 'JSON_PARSE_ERROR') {
          await this.fileManager.writeJSON(this.CUSTOM_PLAYLISTS_FILE, data)
        }
        
        return {
          success: true,
          data: data.playlists
        }
      }
      
      return {
        success: true,
        data: result.data.playlists
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'GET_CUSTOM_PLAYLISTS_ERROR',
          message: '获取自定义歌单失败',
          details: error.message
        }
      }
    }
  }

  /**
   * 歌曲操作 - 添加歌曲到歌单
   * @param {string} playlistId - 歌单 ID
   * @param {Object} song - 歌曲对象
   */
  async addSongToPlaylist(playlistId, song) {
    try {
      // 根据歌单类型选择文件
      let filePath
      if (playlistId === 'local-favorites') {
        filePath = this.FAVORITES_FILE
      } else if (playlistId === 'local-downloads') {
        filePath = this.DOWNLOADS_FILE
      } else {
        filePath = this.CUSTOM_PLAYLISTS_FILE
      }
      
      const result = await this.fileManager.readJSON(filePath)
      
      if (!result.success) {
        return {
          success: false,
          error: {
            code: 'PLAYLIST_NOT_FOUND',
            message: '歌单不存在'
          }
        }
      }
      
      let playlist
      let data = result.data
      
      if (playlistId === 'local-favorites' || playlistId === 'local-downloads') {
        playlist = data
      } else {
        playlist = data.playlists.find(p => p.id === playlistId)
        if (!playlist) {
          return {
            success: false,
            error: {
              code: 'PLAYLIST_NOT_FOUND',
              message: '歌单不存在'
            }
          }
        }
      }
      
      // 检查是否已存在
      const exists = playlist.songs.some(s => s.id === song.id)
      if (exists) {
        return {
          success: true,
          data: playlist,
          message: '歌曲已在歌单中'
        }
      }
      
      // 添加歌曲（包含添加时间戳）
      const songWithTime = {
        ...song,
        addTime: Date.now()
      }
      playlist.songs.push(songWithTime)
      playlist.updateTime = Date.now()
      
      // 保存到文件
      const writeResult = await this.fileManager.writeJSON(filePath, data)
      if (!writeResult.success) {
        return writeResult
      }
      
      return {
        success: true,
        data: playlist
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'ADD_SONG_ERROR',
          message: '添加歌曲失败',
          details: error.message
        }
      }
    }
  }

  /**
   * 歌曲操作 - 从歌单移除歌曲
   * @param {string} playlistId - 歌单 ID
   * @param {string} songId - 歌曲 ID
   */
  async removeSongFromPlaylist(playlistId, songId) {
    try {
      // 根据歌单类型选择文件
      let filePath
      if (playlistId === 'local-favorites') {
        filePath = this.FAVORITES_FILE
      } else if (playlistId === 'local-downloads') {
        filePath = this.DOWNLOADS_FILE
      } else {
        filePath = this.CUSTOM_PLAYLISTS_FILE
      }
      
      const result = await this.fileManager.readJSON(filePath)
      
      if (!result.success) {
        return {
          success: false,
          error: {
            code: 'PLAYLIST_NOT_FOUND',
            message: '歌单不存在'
          }
        }
      }
      
      let playlist
      let data = result.data
      
      if (playlistId === 'local-favorites' || playlistId === 'local-downloads') {
        playlist = data
      } else {
        playlist = data.playlists.find(p => p.id === playlistId)
        if (!playlist) {
          return {
            success: false,
            error: {
              code: 'PLAYLIST_NOT_FOUND',
              message: '歌单不存在'
            }
          }
        }
      }
      
      const originalLength = playlist.songs.length
      
      // 移除歌曲（转换为字符串比较，避免类型不匹配）
      const songIdStr = String(songId)
      playlist.songs = playlist.songs.filter(s => String(s.id) !== songIdStr)
      playlist.updateTime = Date.now()
      
      if (playlist.songs.length === originalLength) {
        return {
          success: true,
          data: playlist,
          message: '歌曲不在歌单中'
        }
      }
      
      // 保存到文件
      const writeResult = await this.fileManager.writeJSON(filePath, data)
      if (!writeResult.success) {
        return writeResult
      }
      
      return {
        success: true,
        data: playlist
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'REMOVE_SONG_ERROR',
          message: '移除歌曲失败',
          details: error.message
        }
      }
    }
  }

  /**
   * 歌曲操作 - 批量添加歌曲到歌单
   * @param {string} playlistId - 歌单 ID
   * @param {Array} songs - 歌曲数组
   */
  async addSongsToPlaylist(playlistId, songs) {
    try {
      // 根据歌单类型选择文件
      let filePath
      if (playlistId === 'local-favorites') {
        filePath = this.FAVORITES_FILE
      } else if (playlistId === 'local-downloads') {
        filePath = this.DOWNLOADS_FILE
      } else {
        filePath = this.CUSTOM_PLAYLISTS_FILE
      }
      
      const result = await this.fileManager.readJSON(filePath)
      
      if (!result.success) {
        return {
          success: false,
          error: {
            code: 'PLAYLIST_NOT_FOUND',
            message: '歌单不存在'
          }
        }
      }
      
      let playlist
      let data = result.data
      
      if (playlistId === 'local-favorites' || playlistId === 'local-downloads') {
        playlist = data
      } else {
        playlist = data.playlists.find(p => p.id === playlistId)
        if (!playlist) {
          return {
            success: false,
            error: {
              code: 'PLAYLIST_NOT_FOUND',
              message: '歌单不存在'
            }
          }
        }
      }
      
      // 获取现有歌曲 ID 集合
      const existingIds = new Set(playlist.songs.map(s => s.id))
      
      let addedCount = 0
      let skippedCount = 0
      
      // 批量添加（去重）
      for (const song of songs) {
        if (!existingIds.has(song.id)) {
          const songWithTime = {
            ...song,
            addTime: Date.now()
          }
          playlist.songs.push(songWithTime)
          existingIds.add(song.id)
          addedCount++
        } else {
          skippedCount++
        }
      }
      
      playlist.updateTime = Date.now()
      
      // 保存到文件
      const writeResult = await this.fileManager.writeJSON(filePath, data)
      if (!writeResult.success) {
        return writeResult
      }
      
      return {
        success: true,
        data: {
          playlist,
          addedCount,
          skippedCount
        }
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'ADD_SONGS_ERROR',
          message: '批量添加歌曲失败',
          details: error.message
        }
      }
    }
  }

  /**
   * 歌单合并 - 将源歌单的歌曲添加到目标歌单
   * @param {string} targetId - 目标歌单 ID
   * @param {string} sourceId - 源歌单 ID（可选，用于日志）
   * @param {Array} sourceSongs - 源歌单的歌曲列表
   */
  async mergePlaylist(targetId, sourceId, sourceSongs) {
    try {
      return await this.addSongsToPlaylist(targetId, sourceSongs)
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'MERGE_PLAYLIST_ERROR',
          message: '合并歌单失败',
          details: error.message
        }
      }
    }
  }

  /**
   * 在线歌单收藏 - 收藏在线歌单
   * @param {Object} playlist - 在线歌单对象
   */
  async collectOnlinePlaylist(playlist) {
    try {
      let result = await this.fileManager.readJSON(this.COLLECTED_PLAYLISTS_FILE)
      let data
      
      if (!result.success) {
        data = this._createDefaultCollectedPlaylists()
      } else {
        data = result.data
      }
      
      // 确保 playlists 是数组
      if (!Array.isArray(data.playlists)) {
        data.playlists = []
      }
      
      // 检查是否已收藏（转换为字符串比较，避免类型不匹配）
      const playlistIdStr = String(playlist.id)
      const exists = data.playlists.some(p => String(p.id) === playlistIdStr)
      if (exists) {
        return {
          success: true,
          data: data.playlists,
          message: '歌单已收藏'
        }
      }
      
      // 添加收藏（包含收藏时间戳）
      const collectedPlaylist = {
        ...playlist,
        addTime: Date.now()
      }
      data.playlists.push(collectedPlaylist)
      
      // 保存到文件（立即保存，不使用防抖）
      const writeResult = await this.fileManager.writeJSON(this.COLLECTED_PLAYLISTS_FILE, data, true)
      if (!writeResult.success) {
        return writeResult
      }
      
      return {
        success: true,
        data: data.playlists
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'COLLECT_PLAYLIST_ERROR',
          message: '收藏歌单失败',
          details: error.message
        }
      }
    }
  }

  /**
   * 在线歌单收藏 - 取消收藏
   * @param {string} playlistId - 歌单 ID
   */
  async uncollectOnlinePlaylist(playlistId) {
    try {
      const result = await this.fileManager.readJSON(this.COLLECTED_PLAYLISTS_FILE)
      
      if (!result.success) {
        return {
          success: false,
          error: {
            code: 'COLLECTED_PLAYLISTS_NOT_FOUND',
            message: '收藏列表不存在'
          }
        }
      }
      
      const data = result.data
      
      // 确保 playlists 是数组
      if (!Array.isArray(data.playlists)) {
        data.playlists = []
      }
      
      const originalLength = data.playlists.length
      
      // 移除收藏（转换为字符串比较，避免类型不匹配）
      const playlistIdStr = String(playlistId)
      data.playlists = data.playlists.filter(p => {
        const currentIdStr = String(p.id)
        return currentIdStr !== playlistIdStr
      })
      
      if (data.playlists.length === originalLength) {
        return {
          success: true,
          data: data.playlists,
          message: '歌单未收藏'
        }
      }
      
      // 保存到文件（立即保存，不使用防抖）
      const writeResult = await this.fileManager.writeJSON(this.COLLECTED_PLAYLISTS_FILE, data, true)
      if (!writeResult.success) {
        return writeResult
      }
      
      return {
        success: true,
        data: data.playlists
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNCOLLECT_PLAYLIST_ERROR',
          message: '取消收藏失败',
          details: error.message
        }
      }
    }
  }

  /**
   * 在线歌单收藏 - 获取收藏列表
   */
  async getCollectedPlaylists() {
    try {
      const result = await this.fileManager.readJSON(this.COLLECTED_PLAYLISTS_FILE)
      
      if (!result.success) {
        // 文件不存在或损坏
        const data = this._createDefaultCollectedPlaylists()
        
        // 如果是 JSON 解析错误，记录错误并创建新文件
        if (result.error && result.error.code === 'JSON_PARSE_ERROR') {
          await this.fileManager.writeJSON(this.COLLECTED_PLAYLISTS_FILE, data)
        }
        
        return {
          success: true,
          data: data.playlists
        }
      }
      
      return {
        success: true,
        data: result.data.playlists
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'GET_COLLECTED_PLAYLISTS_ERROR',
          message: '获取收藏列表失败',
          details: error.message
        }
      }
    }
  }

  /**
   * 已下载歌单 - 添加到已下载
   * @param {Object} song - 歌曲对象
   * @param {string} localPath - 本地文件路径
   * @param {number} fileSize - 文件大小
   * @param {string} quality - 音质
   */
  async addToDownloads(song, localPath, fileSize, quality) {
    // 使用锁机制，确保并发添加时不会冲突
    this.downloadsLock = this.downloadsLock.then(async () => {
      try {
        let result = await this.fileManager.readJSON(this.DOWNLOADS_FILE)
        let downloads
        
        if (!result.success) {
          downloads = this._createDefaultDownloads()
        } else {
          downloads = result.data
        }
        
        // 检查是否已存在
        const exists = downloads.songs.some(s => s.id === song.id)
        if (exists) {
          return {
            success: true,
            data: downloads,
            message: '歌曲已在下载列表中'
          }
        }
        
        // 添加歌曲（包含下载信息）
        const downloadedSong = {
          ...song,
          downloadTime: Date.now(),
          localPath,
          fileSize,
          quality
        }
        downloads.songs.push(downloadedSong)
        downloads.updateTime = Date.now()
        
        // 保存到文件
        const writeResult = await this.fileManager.writeJSON(this.DOWNLOADS_FILE, downloads)
        if (!writeResult.success) {
          return writeResult
        }
        
        return {
          success: true,
          data: downloads
        }
      } catch (error) {
        return {
          success: false,
          error: {
            code: 'ADD_TO_DOWNLOADS_ERROR',
            message: '添加到下载列表失败',
            details: error.message
          }
        }
      }
    })
    
    return this.downloadsLock
  }

  /**
   * 已下载歌单 - 从已下载移除（同时删除本地文件）
   * @param {string} songId - 歌曲 ID
   */
  async removeFromDownloads(songId) {
    try {
      const result = await this.fileManager.readJSON(this.DOWNLOADS_FILE)
      
      if (!result.success) {
        return {
          success: false,
          error: {
            code: 'DOWNLOADS_NOT_FOUND',
            message: '下载列表不存在'
          }
        }
      }
      
      const downloads = result.data
      const originalLength = downloads.songs.length
      
      // 找到要删除的歌曲
      const songToRemove = downloads.songs.find(s => s.id === songId)
      
      // 移除歌曲
      downloads.songs = downloads.songs.filter(s => s.id !== songId)
      downloads.updateTime = Date.now()
      
      if (downloads.songs.length === originalLength) {
        return {
          success: true,
          data: downloads,
          message: '歌曲不在下载列表中'
        }
      }
      
      // 删除本地文件
      if (songToRemove && songToRemove.localPath) {
        const fs = require('fs').promises
        const fullPath = path.join(this.fileManager.userDataPath, songToRemove.localPath)
        try {
          await fs.unlink(fullPath)
        } catch (error) {
          // 文件可能已经不存在，继续执行
        }
      }
      
      // 保存到文件
      const writeResult = await this.fileManager.writeJSON(this.DOWNLOADS_FILE, downloads)
      if (!writeResult.success) {
        return writeResult
      }
      
      return {
        success: true,
        data: downloads
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'REMOVE_FROM_DOWNLOADS_ERROR',
          message: '从下载列表移除失败',
          details: error.message
        }
      }
    }
  }

  /**
   * 已下载歌单 - 获取下载列表
   */
  async getDownloads() {
    try {
      const result = await this.fileManager.readJSON(this.DOWNLOADS_FILE)
      
      if (!result.success) {
        // 文件不存在或损坏
        const downloads = this._createDefaultDownloads()
        
        // 如果是 JSON 解析错误，记录错误并创建新文件
        if (result.error && result.error.code === 'JSON_PARSE_ERROR') {
          await this.fileManager.writeJSON(this.DOWNLOADS_FILE, downloads)
        }
        
        return {
          success: true,
          data: downloads
        }
      }
      
      return {
        success: true,
        data: result.data
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'GET_DOWNLOADS_ERROR',
          message: '获取下载列表失败',
          details: error.message
        }
      }
    }
  }

  /**
   * 已下载歌单 - 获取本地歌曲路径
   * @param {string} songId - 歌曲 ID
   * @returns {Promise<string|null>} 本地文件路径
   */
  async getLocalSongPath(songId) {
    try {
      const result = await this.getDownloads()
      
      if (!result.success) {
        return {
          success: false,
          error: result.error
        }
      }
      
      // 转换为字符串进行比较，避免类型不匹配
      const songIdStr = String(songId)
      const song = result.data.songs.find(s => String(s.id) === songIdStr)
      
      if (!song || !song.localPath) {
        return {
          success: true,
          data: null
        }
      }
      
      // localPath 已经是完整路径，直接返回
      return {
        success: true,
        data: song.localPath
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'GET_LOCAL_PATH_ERROR',
          message: '获取本地路径失败',
          details: error.message
        }
      }
    }
  }

  /**
   * 已下载歌单 - 计算总磁盘占用
   * @returns {Promise<number>} 总占用空间（字节）
   */
  async getTotalDiskUsage() {
    try {
      const result = await this.getDownloads()
      
      if (!result.success) {
        return {
          success: false,
          error: result.error
        }
      }
      
      let totalSize = 0
      
      // 累加所有歌曲的文件大小
      for (const song of result.data.songs) {
        if (song.fileSize) {
          totalSize += song.fileSize
        }
      }
      
      return {
        success: true,
        data: totalSize
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'GET_DISK_USAGE_ERROR',
          message: '计算磁盘占用失败',
          details: error.message
        }
      }
    }
  }
}

module.exports = PlaylistManager

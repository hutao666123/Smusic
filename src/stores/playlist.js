import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { showSuccess, showError, showDeleteConfirm } from '../utils/notification'

export const usePlaylistStore = defineStore('playlist', () => {
  // 状态
  const favorites = ref([])
  const customPlaylists = ref([])
  const collectedPlaylists = ref([])
  const downloads = ref([])
  const loading = ref(false)
  const error = ref(null)

  // 计算属性：所有本地歌单
  const allLocalPlaylists = computed(() => [
    {
      id: 'local-favorites',
      name: '我喜欢的音乐',
      songs: favorites.value,
      type: 'system',
      createTime: Date.now(),
      updateTime: Date.now()
    },
    {
      id: 'local-downloads',
      name: '已下载',
      songs: downloads.value,
      type: 'system',
      createTime: Date.now(),
      updateTime: Date.now()
    },
    ...(Array.isArray(customPlaylists.value) ? customPlaylists.value : [])
  ])

  // 加载所有歌单数据
  const loadAllPlaylists = async () => {
    loading.value = true
    error.value = null
    try {
      // 加载我喜欢的音乐
      const favoritesResult = await window.electron.getFavorites()
      if (favoritesResult.success) {
        favorites.value = favoritesResult.data?.data?.songs || favoritesResult.data?.songs || []
      }

      // 加载自定义歌单
      const customResult = await window.electron.getCustomPlaylists()
      if (customResult.success) {
        const playlists = customResult.data?.data?.playlists || customResult.data?.playlists || []
        customPlaylists.value = Array.isArray(playlists) ? playlists : []
      }

      // 加载收藏的在线歌单
      const collectedResult = await window.electron.getCollectedPlaylists()
      if (collectedResult.success) {
        const playlists = collectedResult.data?.data?.playlists || collectedResult.data?.playlists || []
        collectedPlaylists.value = Array.isArray(playlists) ? playlists : []
      }

      // 加载已下载歌单
      const downloadsResult = await window.electron.getDownloads()
      if (downloadsResult.success) {
        // 处理三层嵌套：result.data.data.data.songs
        const songs = downloadsResult.data?.data?.data?.songs || 
                     downloadsResult.data?.data?.songs || 
                     downloadsResult.data?.songs || []
        downloads.value = songs
      }

      return true
    } catch (err) {
      error.value = err.message || '加载歌单数据失败'
      console.error('加载歌单数据失败:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  // ========== 我喜欢的音乐 ==========

  // 添加到我喜欢的音乐
  const addToFavorites = async (song) => {
    loading.value = true
    error.value = null
    try {
      const result = await window.electron.addToFavorites(song)
      if (result.success) {
        // result.data 可能是嵌套结构，尝试多种路径
        const songs = result.data?.songs || result.data?.data?.songs || []
        favorites.value = songs
        showSuccess('已添加到我喜欢的音乐')
        return true
      } else {
        error.value = result.error?.message || '添加失败'
        showError(error.value)
        return false
      }
    } catch (err) {
      error.value = err.message || '添加到喜欢失败'
      console.error('添加到喜欢失败:', err)
      showError(error.value)
      return false
    } finally {
      loading.value = false
    }
  }

  // 从我喜欢的音乐中移除
  const removeFromFavorites = async (songId) => {
    loading.value = true
    error.value = null
    try {
      const result = await window.electron.removeFromFavorites(songId)
      if (result.success) {
        favorites.value = result.data.songs || []
        showSuccess('已从我喜欢的音乐中移除')
        return true
      } else {
        error.value = result.error?.message || '移除失败'
        showError(error.value)
        return false
      }
    } catch (err) {
      error.value = err.message || '移除喜欢失败'
      console.error('移除喜欢失败:', err)
      showError(error.value)
      return false
    } finally {
      loading.value = false
    }
  }

  // 检查是否喜欢
  const isFavorite = (songId) => {
    return favorites.value.some(song => song.id === songId)
  }

  // ========== 自定义歌单 ==========

  // 创建歌单
  const createPlaylist = async (name, description = '') => {
    loading.value = true
    error.value = null
    try {
      const result = await window.electron.createPlaylist(name, description)
      if (result.success) {
        customPlaylists.value = result.data || []
        showSuccess(`歌单"${name}"创建成功`)
        return result.data[result.data.length - 1] // 返回新创建的歌单
      } else {
        error.value = result.error?.message || '创建歌单失败'
        showError(error.value)
        return null
      }
    } catch (err) {
      error.value = err.message || '创建歌单失败'
      console.error('创建歌单失败:', err)
      showError(error.value)
      return null
    } finally {
      loading.value = false
    }
  }

  // 更新歌单信息
  const updatePlaylist = async (playlistId, data) => {
    loading.value = true
    error.value = null
    try {
      const result = await window.electron.updatePlaylist(playlistId, data)
      if (result.success) {
        customPlaylists.value = result.data || []
        showSuccess('歌单信息已更新')
        return true
      } else {
        error.value = result.error?.message || '更新歌单失败'
        showError(error.value)
        return false
      }
    } catch (err) {
      error.value = err.message || '更新歌单失败'
      console.error('更新歌单失败:', err)
      showError(error.value)
      return false
    } finally {
      loading.value = false
    }
  }

  // 删除歌单（带确认对话框）
  const deletePlaylist = async (playlistId) => {
    // 获取歌单信息
    const playlist = getPlaylistById(playlistId)
    if (!playlist) {
      showError('歌单不存在')
      return false
    }

    // 显示确认对话框
    const confirmed = await showDeleteConfirm(playlist.name, '歌单')
    if (!confirmed) {
      return false
    }

    loading.value = true
    error.value = null
    try {
      const result = await window.electron.deletePlaylist(playlistId)
      if (result.success) {
        customPlaylists.value = result.data || []
        showSuccess(`歌单"${playlist.name}"已删除`)
        return true
      } else {
        error.value = result.error?.message || '删除歌单失败'
        showError(error.value)
        return false
      }
    } catch (err) {
      error.value = err.message || '删除歌单失败'
      console.error('删除歌单失败:', err)
      showError(error.value)
      return false
    } finally {
      loading.value = false
    }
  }

  // 根据 ID 获取歌单
  const getPlaylistById = (playlistId) => {
    if (playlistId === 'local-favorites') {
      return allLocalPlaylists.value[0]
    }
    if (playlistId === 'local-downloads') {
      return allLocalPlaylists.value[1]
    }
    if (!Array.isArray(customPlaylists.value)) {
      return null
    }
    return customPlaylists.value.find(p => p.id === playlistId)
  }

  // ========== 歌曲操作 ==========

  // 添加歌曲到歌单
  const addSongToPlaylist = async (playlistId, song) => {
    loading.value = true
    error.value = null
    try {
      const result = await window.electron.addSongToPlaylist(playlistId, song)
      if (result.success) {
        // 更新对应的歌单
        if (playlistId === 'local-favorites') {
          favorites.value = result.data.songs || []
        } else {
          const playlist = customPlaylists.value.find(p => p.id === playlistId)
          if (playlist) {
            playlist.songs = result.data.songs || []
            playlist.updateTime = result.data.updateTime
          }
        }
        showSuccess('已添加到歌单')
        return true
      } else {
        error.value = result.error?.message || '添加歌曲失败'
        showError(error.value)
        return false
      }
    } catch (err) {
      error.value = err.message || '添加歌曲失败'
      console.error('添加歌曲失败:', err)
      showError(error.value)
      return false
    } finally {
      loading.value = false
    }
  }

  // 从歌单移除歌曲
  const removeSongFromPlaylist = async (playlistId, songId) => {
    loading.value = true
    error.value = null
    try {
      const result = await window.electron.removeSongFromPlaylist(playlistId, songId)
      if (result.success) {
        // 更新对应的歌单
        if (playlistId === 'local-favorites') {
          favorites.value = result.data.songs || []
        } else if (playlistId === 'local-downloads') {
          downloads.value = result.data.songs || []
        } else {
          const playlist = customPlaylists.value.find(p => p.id === playlistId)
          if (playlist) {
            playlist.songs = result.data.songs || []
            playlist.updateTime = result.data.updateTime
          }
        }
        showSuccess('已从歌单中移除')
        return true
      } else {
        error.value = result.error?.message || '移除歌曲失败'
        showError(error.value)
        return false
      }
    } catch (err) {
      error.value = err.message || '移除歌曲失败'
      console.error('移除歌曲失败:', err)
      showError(error.value)
      return false
    } finally {
      loading.value = false
    }
  }

  // 批量添加歌曲到歌单
  const addSongsToPlaylist = async (playlistId, songs) => {
    loading.value = true
    error.value = null
    try {
      const result = await window.electron.addSongsToPlaylist(playlistId, songs)
      if (result.success) {
        // 更新对应的歌单
        if (playlistId === 'local-favorites') {
          favorites.value = result.data.songs || []
        } else {
          const playlist = customPlaylists.value.find(p => p.id === playlistId)
          if (playlist) {
            playlist.songs = result.data.songs || []
            playlist.updateTime = result.data.updateTime
          }
        }
        const added = result.data.added || 0
        const skipped = result.data.skipped || 0
        showSuccess(`成功添加 ${added} 首歌曲${skipped > 0 ? `，跳过 ${skipped} 首重复歌曲` : ''}`)
        return {
          success: true,
          added,
          skipped
        }
      } else {
        error.value = result.error?.message || '批量添加失败'
        showError(error.value)
        return { success: false, added: 0, skipped: 0 }
      }
    } catch (err) {
      error.value = err.message || '批量添加失败'
      console.error('批量添加失败:', err)
      showError(error.value)
      return { success: false, added: 0, skipped: 0 }
    } finally {
      loading.value = false
    }
  }

  // 合并歌单
  const mergePlaylist = async (targetId, sourceId, sourceSongs) => {
    loading.value = true
    error.value = null
    try {
      const result = await window.electron.mergePlaylist(targetId, sourceId, sourceSongs)
      if (result.success) {
        // 更新目标歌单
        if (targetId === 'local-favorites') {
          favorites.value = result.data.songs || []
        } else {
          const playlist = customPlaylists.value.find(p => p.id === targetId)
          if (playlist) {
            playlist.songs = result.data.songs || []
            playlist.updateTime = result.data.updateTime
          }
        }
        return {
          success: true,
          added: result.data.added || 0,
          skipped: result.data.skipped || 0
        }
      } else {
        error.value = result.error?.message || '合并歌单失败'
        return { success: false, added: 0, skipped: 0 }
      }
    } catch (err) {
      error.value = err.message || '合并歌单失败'
      console.error('合并歌单失败:', err)
      return { success: false, added: 0, skipped: 0 }
    } finally {
      loading.value = false
    }
  }

  // ========== 在线歌单收藏 ==========

  // 收藏在线歌单
  const collectOnlinePlaylist = async (playlist) => {
    loading.value = true
    error.value = null
    try {
      const result = await window.electron.collectOnlinePlaylist(playlist)
      if (result.success) {
        collectedPlaylists.value = result.data || []
        showSuccess(`已收藏歌单"${playlist.name}"`)
        return true
      } else {
        error.value = result.error?.message || '收藏歌单失败'
        showError(error.value)
        return false
      }
    } catch (err) {
      error.value = err.message || '收藏歌单失败'
      console.error('收藏歌单失败:', err)
      showError(error.value)
      return false
    } finally {
      loading.value = false
    }
  }

  // 取消收藏在线歌单
  const uncollectOnlinePlaylist = async (playlistId) => {
    loading.value = true
    error.value = null
    try {
      const result = await window.electron.uncollectOnlinePlaylist(playlistId)
      if (result.success) {
        collectedPlaylists.value = result.data || []
        showSuccess('已取消收藏')
        return true
      } else {
        error.value = result.error?.message || '取消收藏失败'
        showError(error.value)
        return false
      }
    } catch (err) {
      error.value = err.message || '取消收藏失败'
      console.error('取消收藏失败:', err)
      showError(error.value)
      return false
    } finally {
      loading.value = false
    }
  }

  // 检查是否已收藏
  const isCollected = (playlistId) => {
    return collectedPlaylists.value.some(p => p.id === playlistId)
  }

  // 清除错误
  const clearError = () => {
    error.value = null
  }

  return {
    // 状态
    favorites,
    customPlaylists,
    collectedPlaylists,
    downloads,
    loading,
    error,
    // 计算属性
    allLocalPlaylists,
    // 方法
    loadAllPlaylists,
    // 我喜欢的音乐
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    // 自定义歌单
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    getPlaylistById,
    // 歌曲操作
    addSongToPlaylist,
    removeSongFromPlaylist,
    addSongsToPlaylist,
    mergePlaylist,
    // 在线歌单收藏
    collectOnlinePlaylist,
    uncollectOnlinePlaylist,
    isCollected,
    // 工具方法
    clearError
  }
})

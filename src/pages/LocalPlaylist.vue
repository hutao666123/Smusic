<template>
  <!--本地歌单-->
  <div class="local-playlist">
    <div v-if="loading" class="loading">加载中...</div>

    <div v-else-if="playlist" class="playlist-content">
      <!-- 歌单头部 -->
      <div class="playlist-header">
        <div class="playlist-cover">
          <div v-if="isSystemPlaylist" class="system-cover" :class="coverClass">
            <div class="cover-icon">{{ coverIcon }}</div>
          </div>
          <div v-else class="custom-cover">
            <img
              v-if="playlist.coverUrl"
              :src="playlist.coverUrl"
              :alt="playlist.name"
            />
            <div v-else class="cover-placeholder">
              <div class="placeholder-icon">🎵</div>
            </div>
          </div>
        </div>
        <div class="playlist-info">
          <h1>{{ playlist.name }}</h1>
          <p v-if="playlist.description" class="playlist-desc">
            {{ playlist.description }}
          </p>
          <div class="playlist-meta">
            <span class="meta-item">
              <span class="meta-icon">🎵</span>
              <span class="meta-label">{{ songs.length }} 首歌曲</span>
            </span>
            <span v-if="isDownloadsPlaylist" class="meta-item">
              <span class="meta-icon">💾</span>
              <span class="meta-label">{{ formatSize(totalSize) }}</span>
            </span>
            <span class="meta-item">
              <span class="meta-icon">📅</span>
              <span class="meta-label">{{ formatDate(playlist.updateTime) }}</span>
            </span>
          </div>
          <div class="action-buttons">
            <button @click="playAll" class="play-all-btn" :disabled="songs.length === 0">
              <span class="play-icon">▶</span>
              播放全部
            </button>
            <button
              v-if="!isDownloadsPlaylist && !isLocalImportedPlaylist"
              @click="downloadAll"
              class="download-all-btn"
              :disabled="songs.length === 0"
            >
              <span class="download-icon">⬇</span>
              下载全部
            </button>
            <button
              v-if="isLocalImportedPlaylist"
              @click="importLocalSongs"
              class="import-btn"
              title="从本地文件夹导入音乐文件"
            >
              <span class="import-icon">➕</span>
              导入歌曲
            </button>
            <button
              v-if="isDownloadsPlaylist"
              @click="openDownloadsFolder"
              class="open-folder-btn"
            >
              <span class="folder-icon">📁</span>
              打开下载目录
            </button>
          </div>
        </div>
      </div>

      <!-- 歌曲列表 -->
      <div class="playlist-songs">
        <div v-if="songs.length === 0" class="empty-state">
          <div class="empty-icon">🎵</div>
          <p class="empty-text">歌单中还没有歌曲</p>
        </div>

        <div v-else class="songs-list">
          <div
            v-for="(song, index) in displayedSongs"
            :key="song.id"
            class="song-item"
            :class="{ 'is-playing': isCurrentSong(song.id) }"
            @click="playSong(song, index)"
          >
            <span class="song-index">
              <span v-if="isCurrentSong(song.id)" class="playing-indicator">♪</span>
              <span v-else>{{ index + 1 }}</span>
            </span>
            
            <div class="song-cover">
              <img v-if="song.album?.picUrl" :src="song.album.picUrl" :alt="song.name" />
              <div v-else class="no-cover">🎵</div>
            </div>
            
            <div class="song-details">
              <div class="song-name">
                {{ song.name }}
                <span v-if="isDownloaded(song.id)" class="downloaded-badge" title="已下载">
                  💾
                </span>
              </div>
              <div class="song-artist">
                {{ formatArtists(song.artists) }}
              </div>
            </div>

            <span class="song-duration">{{ formatTime(song.duration) }}</span>

            <div class="song-actions">
              <!-- 喜欢按钮 -->
              <button
                @click.stop="toggleFavorite(song, $event)"
                class="action-btn favorite-btn-list"
                :class="{ 'is-favorite': isFavorite(song.id) }"
                :title="isFavorite(song.id) ? '取消喜欢' : '喜欢'"
              >
                {{ isFavorite(song.id) ? '❤️' : '🤍' }}
              </button>

              <!-- 添加到歌单按钮 -->
              <button
                @click.stop="openAddToPlaylistDialog(song)"
                class="action-btn add-btn"
                title="添加到歌单"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>

              <!-- 设置歌词按钮（仅本地音乐） -->
              <button
                v-if="isLocalImportedPlaylist"
                @click.stop="setLyric(song)"
                class="action-btn lyric-btn"
                :title="song.lyricPath ? '更改歌词' : '设置歌词(支持LRC，TXT文件)'"
              >
                <span class="lyric-icon">{{ song.lyricPath ? '📝' : '📄' }}</span>
              </button>

              <!-- 下载按钮 -->
              <button
                v-if="!isDownloadsPlaylist && !isLocalImportedPlaylist && !isDownloaded(song.id)"
                @click.stop="downloadSong(song)"
                class="action-btn download-btn"
                title="下载"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </button>

              <!-- 删除按钮 -->
              <button
                @click.stop="confirmRemoveSong(song)"
                class="action-btn delete-btn"
                :title="isDownloadsPlaylist ? '删除（不会删除本地文件）' : '从歌单移除'"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
          </div>

          <!-- 加载更多提示 -->
          <div v-if="hasMoreSongs" class="load-more-container">
            <div v-if="isLoadingMore" class="loading-more">
              <div class="loading-spinner"></div>
              <p>加载中...</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="error">
      加载歌单失败
    </div>

    <!-- 删除确认对话框 -->
    <div v-if="showDeleteDialog" class="dialog-overlay" @click="showDeleteDialog = false">
      <div class="dialog delete-dialog" @click.stop>
        <div class="dialog-header">
          <h3>确认{{ isDownloadsPlaylist ? '删除' : '移除' }}</h3>
        </div>
        <div class="dialog-body">
          <p>确定要{{ isDownloadsPlaylist ? '删除' : '从歌单移除' }}「{{ deleteTarget?.name }}」吗？</p>
          <p v-if="isDownloadsPlaylist" class="warning-text">
            此操作将同时删除本地文件，不可恢复
          </p>
        </div>
        <div class="dialog-footer">
          <button class="btn-cancel" @click="showDeleteDialog = false">取消</button>
          <button class="btn-danger" @click="handleRemoveSong">
            {{ isDownloadsPlaylist ? '删除' : '移除' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Toast 提示 -->
    <div v-if="toast.show" class="toast" :class="toast.type">
      {{ toast.message }}
    </div>

    <!-- 添加到歌单对话框 -->
    <AddToPlaylistDialog
      v-model:visible="showAddToPlaylistDialog"
      :song="selectedSong"
      @success="handleAddToPlaylistSuccess"
      @cancel="handleAddToPlaylistCancel"
    />

    <!-- 下载进度对话框 -->
    <DownloadProgressDialog
      v-model:visible="showDownloadProgress"
      :total="downloadProgress.total"
      :completed="downloadProgress.completed"
      :failed="downloadProgress.failed"
      :skipped="downloadProgress.skipped"
      :isDownloading="downloadProgress.isDownloading"
      @close="handleDownloadProgressClose"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePlaylistStore } from '../stores/playlist'
import { useDownloadStore } from '../stores/download'
import { usePlayerStore } from '../stores/player'
import AddToPlaylistDialog from '../components/AddToPlaylistDialog.vue'
import DownloadProgressDialog from '../components/DownloadProgressDialog.vue'

const route = useRoute()
const router = useRouter()
const playlistStore = usePlaylistStore()
const downloadStore = useDownloadStore()
const playerStore = usePlayerStore()

// 状态
const playlist = ref(null)
const loading = ref(true)
const showDeleteDialog = ref(false)
const deleteTarget = ref(null)
const showAddToPlaylistDialog = ref(false)
const selectedSong = ref(null)
const showDownloadProgress = ref(false)
const downloadProgress = ref({
  total: 0,
  completed: 0,
  failed: 0,
  skipped: 0,
  isDownloading: false
})
const toast = ref({
  show: false,
  message: '',
  type: 'success'
})

// 分页状态
const PAGE_SIZE = 10
const currentPage = ref(1)
const isLoadingMore = ref(false)

// 计算属性
const songs = computed(() => playlist.value?.songs || [])

// 显示的歌曲列表（分页）
const displayedSongs = computed(() => {
  return songs.value.slice(0, currentPage.value * PAGE_SIZE)
})

// 是否还有更多歌曲
const hasMoreSongs = computed(() => {
  return songs.value.length > currentPage.value * PAGE_SIZE
})

const isSystemPlaylist = computed(() => {
  return playlist.value?.type === 'system'
})

const isFavoritesPlaylist = computed(() => {
  return route.params.id === 'local-favorites'
})

const isDownloadsPlaylist = computed(() => {
  return route.params.id === 'local-downloads'
})

const isLocalImportedPlaylist = computed(() => {
  return route.params.id === 'local-imported'
})

const coverClass = computed(() => {
  if (isFavoritesPlaylist.value) return 'favorites-cover'
  if (isDownloadsPlaylist.value) return 'downloads-cover'
  return ''
})

const coverIcon = computed(() => {
  if (isFavoritesPlaylist.value) return '❤️'
  if (isDownloadsPlaylist.value) return '💾'
  return '🎵'
})

const totalSize = computed(() => {
  if (!isDownloadsPlaylist.value) return 0
  return songs.value.reduce((sum, song) => sum + (song.fileSize || 0), 0)
})

// 滚动监听
const handleScroll = (event) => {
  if (isLoadingMore.value || !hasMoreSongs.value) return
  
  const target = event.target
  const scrollTop = target.scrollTop
  const scrollHeight = target.scrollHeight
  const clientHeight = target.clientHeight
  
  // 计算还剩多少内容未显示（距离底部的距离）
  const distanceToBottom = scrollHeight - (scrollTop + clientHeight)
  
  // 估算每首歌的高度约为 70px，当还剩 2-3 首歌的高度时加载
  const triggerDistance = 200
  
  // 距离底部 200px 时开始加载（大约还剩 2-3 首歌的位置）
  if (distanceToBottom <= triggerDistance) {
    loadMoreSongs()
  }
}

// 加载更多歌曲
const loadMoreSongs = () => {
  if (isLoadingMore.value || !hasMoreSongs.value) return
  
  isLoadingMore.value = true
  
  // 模拟加载延迟
  setTimeout(() => {
    currentPage.value++
    isLoadingMore.value = false
  }, 300)
}

// 生命周期
onMounted(async () => {
  await loadPlaylist()
  
  // 查找滚动容器（.app-main）
  const scrollContainer = document.querySelector('.app-main')
  if (scrollContainer) {
    scrollContainer.addEventListener('scroll', handleScroll)
  } else {
    window.addEventListener('scroll', handleScroll)
  }
})

onUnmounted(() => {
  // 移除滚动监听
  const scrollContainer = document.querySelector('.app-main')
  if (scrollContainer) {
    scrollContainer.removeEventListener('scroll', handleScroll)
  } else {
    window.removeEventListener('scroll', handleScroll)
  }
})

// 监听路由变化
watch(() => route.params.id, async () => {
  // 重置分页
  currentPage.value = 1
  await loadPlaylist()
})

// 加载歌单
const loadPlaylist = async () => {
  loading.value = true
  try {
    const playlistId = route.params.id
    
    // 始终重新加载数据，确保数据最新
    await playlistStore.loadAllPlaylists()
    const loadedPlaylist = playlistStore.getPlaylistById(playlistId)
    
    if (loadedPlaylist) {
      playlist.value = loadedPlaylist
    } else {
      showToast('歌单不存在', 'error')
      router.push('/my-playlists')
    }
  } catch (error) {
    console.error('加载歌单失败:', error)
    showToast('加载歌单失败', 'error')
  } finally {
    loading.value = false
  }
}

// 播放全部
const playAll = () => {
  if (songs.value.length === 0) return

  // 设置播放模式：如果是已下载歌单或本地音乐，强制本地播放
  playerStore.forceLocalMode = isDownloadsPlaylist.value || isLocalImportedPlaylist.value

  playerStore.clearPlaylist()
  songs.value.forEach(song => {
    playerStore.addToPlaylist({
      id: song.id,
      name: song.name,
      artist: formatArtists(song.artists),
      duration: song.duration / 1000,
      localPath: song.localPath, // 如果有本地路径，传递给播放器
      cover: song.album?.picUrl || ''
    })
  })
  playerStore.play()
  showToast('开始播放', 'success')
}

// 播放单曲
const playSong = (song, displayIndex) => {

  // 找到歌曲在完整列表中的真实索引
  const realIndex = songs.value.findIndex(s => s.id === song.id)
  
  // 设置播放模式：如果是已下载歌单或本地音乐，强制本地播放
  playerStore.forceLocalMode = isDownloadsPlaylist.value || isLocalImportedPlaylist.value
  
  playerStore.clearPlaylist()
  
  // 从点击的歌曲开始添加（使用完整列表）
  for (let i = realIndex; i < songs.value.length; i++) {
    const s = songs.value[i]
    const songToAdd = {
      id: s.id,
      name: s.name,
      artist: formatArtists(s.artists),
      duration: s.duration / 1000,
      localPath: s.localPath,
      cover: s.album?.picUrl || ''
    }
    console.log('添加到播放器的歌曲:', songToAdd)
    playerStore.addToPlaylist(songToAdd)
  }
  
  playerStore.play()
}

// 下载单曲
const downloadSong = async (song) => {
  const result = await downloadStore.downloadSong(song)
  if (result.success && !result.skipped) {
    showToast('下载完成', 'success')
    // 重新加载歌单数据（无论在哪个页面）
    await playlistStore.loadAllPlaylists()
    // 如果当前在下载歌单页面，刷新显示
    if (isDownloadsPlaylist.value) {
      await loadPlaylist()
    }
  } else if (result.skipped) {
    showToast('歌曲已下载', 'warning')
  } else {
    showToast(result.error || '下载失败', 'error')
  }
}

// 下载全部
const downloadAll = async () => {
  if (songs.value.length === 0) return
  if (downloadProgress.value.isDownloading) {
    showToast('正在下载中，请稍候', 'warning')
    return
  }

  // 重置进度
  downloadProgress.value = {
    total: songs.value.length,
    completed: 0,
    failed: 0,
    skipped: 0,
    isDownloading: true
  }
  
  // 显示进度对话框
  showDownloadProgress.value = true
  
  const result = await downloadStore.downloadPlaylist(songs.value, (progress) => {
    // 更新进度
    downloadProgress.value.completed = progress.completed || 0
    downloadProgress.value.failed = progress.failed || 0
    downloadProgress.value.skipped = progress.skipped || 0
  })
  
  downloadProgress.value.isDownloading = false
  
  if (result.success) {
    downloadProgress.value.completed = result.completed || 0
    downloadProgress.value.failed = result.failed || 0
    downloadProgress.value.skipped = result.skipped || 0
    
    showToast(
      `下载完成：成功 ${result.completed} 首，失败 ${result.failed} 首${result.skipped > 0 ? `，跳过 ${result.skipped} 首` : ''}`,
      result.failed > 0 ? 'warning' : 'success'
    )
    
    // 重新加载歌单数据
    await playlistStore.loadAllPlaylists()
    if (isDownloadsPlaylist.value) {
      await loadPlaylist()
    }
  } else {
    showToast(result.error || '批量下载失败', 'error')
  }
}

// 打开下载目录
const openDownloadsFolder = async () => {
  try {
    let result
    
    // 优先使用openDownloadsFolder方法
    if (typeof window.electron?.openDownloadsFolder === 'function') {
      result = await window.electron.openDownloadsFolder()
    } else if (window.electron?.ipcRenderer) {
      // 备选方案：直接使用ipcRenderer
      result = await window.electron.ipcRenderer.invoke('open-downloads-folder')
    } else {
      throw new Error('无法访问electron API')
    }
    
    if (result?.success) {
      showToast('已打开下载目录', 'success')
    } else {
      showToast('打开下载目录失败', 'error')
    }
  } catch (error) {
    showToast('打开下载目录失败', 'error')
    console.error('打开下载目录错误:', error)
  }
}

// 关闭下载进度对话框
const handleDownloadProgressClose = async () => {
  showDownloadProgress.value = false
  // 重新加载歌单数据
  await playlistStore.loadAllPlaylists()
  if (isDownloadsPlaylist.value) {
    await loadPlaylist()
  }
}

// 确认移除歌曲
const confirmRemoveSong = (song) => {
  deleteTarget.value = song
  showDeleteDialog.value = true
}

// 执行移除歌曲
const handleRemoveSong = async () => {
  if (!deleteTarget.value) return

  const success = await playlistStore.removeSongFromPlaylist(
    route.params.id,
    deleteTarget.value.id
  )

  if (success) {
    showToast(
      isDownloadsPlaylist.value ? '已删除' : '已从歌单移除',
      'success'
    )
    showDeleteDialog.value = false
    deleteTarget.value = null
    
    // 重新加载歌单
    await loadPlaylist()
  } else {
    showToast(playlistStore.error || '操作失败', 'error')
  }
}

// 检查是否已下载
const isDownloaded = (songId) => {
  return playlistStore.downloads.some(song => song.id === songId)
}

// 检查是否是当前播放的歌曲
const isCurrentSong = (songId) => {
  return playerStore.currentSong?.id === songId && playerStore.isPlaying
}

// 格式化艺术家
const formatArtists = (artists) => {
  if (!artists || artists.length === 0) return '未知艺术家'
  return artists.map(a => a.name).join(' / ')
}

// 格式化时长
const formatTime = (duration) => {
  if (!duration || isNaN(duration)) return '0:00'
  const seconds = Math.floor(duration / 1000)
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// 格式化文件大小
const formatSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// 格式化日期
const formatDate = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 打开添加到歌单对话框
const openAddToPlaylistDialog = (song) => {
  selectedSong.value = song
  showAddToPlaylistDialog.value = true
}

// 添加到歌单成功
const handleAddToPlaylistSuccess = (result) => {
  showToast(`已添加到歌单`, 'success')
  showAddToPlaylistDialog.value = false
  selectedSong.value = null
}

// 取消添加到歌单
const handleAddToPlaylistCancel = () => {
  showAddToPlaylistDialog.value = false
  selectedSong.value = null
}

// 显示提示
const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

// 检查是否喜欢
const isFavorite = (songId) => {
  return playlistStore.isFavorite(songId)
}

// 切换喜欢状态
const toggleFavorite = async (song, event) => {
  const songData = {
    id: song.id,
    name: song.name,
    artists: song.artists || [],
    album: song.album || { name: '', picUrl: '' },
    duration: song.duration || 0
  }
  
  if (isFavorite(song.id)) {
    const success = await playlistStore.removeFromFavorites(song.id)
    if (success) {
      showToast('已取消喜欢', 'success')
    }
  } else {
    const success = await playlistStore.addToFavorites(songData)
    if (success) {
      showToast('已添加到我喜欢的音乐', 'success')
      // 添加喜欢动画
      createFavoriteAnimation(event)
    }
  }
}

// 创建喜欢动画
const createFavoriteAnimation = (event) => {
  const button = event.currentTarget
  const rect = button.getBoundingClientRect()
  
  // 创建多个心形元素
  for (let i = 0; i < 3; i++) {
    const heart = document.createElement('div')
    heart.className = 'flying-heart'
    heart.innerHTML = '❤️'
    
    // 设置起始位置
    const startX = rect.left + rect.width / 2
    const startY = rect.top + rect.height / 2
    heart.style.left = startX + 'px'
    heart.style.top = startY + 'px'
    
    document.body.appendChild(heart)
    
    // 随机方向
    const angle = (Math.random() * 120 - 60) * Math.PI / 180
    const distance = 40 + Math.random() * 40
    const deltaX = Math.cos(angle) * distance
    const deltaY = -Math.abs(Math.sin(angle)) * distance - 20
    
    // 延迟启动动画
    setTimeout(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          heart.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1.3) rotate(${Math.random() * 360}deg)`
          heart.style.opacity = '0'
        })
      })
    }, i * 40)
    
    // 动画结束后移除元素
    setTimeout(() => {
      heart.remove()
    }, 700 + i * 40)
  }
}

// 导入本地歌曲
const importLocalSongs = async () => {
  try {
    const result = await window.electron.selectLocalAudioFiles()
    
    if (result.success && !result.data.canceled && result.data.filePaths.length > 0) {
      showToast('正在导入歌曲...', 'info')
      
      const importResult = await playlistStore.importLocalSongs(result.data.filePaths)
      
      if (importResult.success) {
        // 重新加载歌单
        await loadPlaylist()
      }
    }
  } catch (error) {
    console.error('导入本地歌曲失败:', error)
    showToast('导入失败', 'error')
  }
}

// 设置歌词
const setLyric = async (song) => {
  try {
    const result = await window.electron.selectLyricFile()
    
    if (result.success && !result.data.canceled && result.data.filePath) {
      const updateResult = await playlistStore.updateSongLyric(song.id, result.data.filePath)
      
      if (updateResult) {
        // 重新加载歌单
        await loadPlaylist()
      }
    }
  } catch (error) {
    console.error('设置歌词失败:', error)
    showToast('设置歌词失败', 'error')
  }
}
</script>

<style scoped>
.local-playlist {
  min-height: 100vh;
  background: var(--page-bg);
  color: var(--text-primary);
  padding: 20px;
  padding-bottom: 100px;
  max-width: 1400px;
  margin: 0 auto;
}

.loading,
.error {
  text-align: center;
  padding: 60px;
  font-size: 18px;
}

.playlist-content {
  animation: fadeIn 0.4s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 歌单头部 */
.playlist-header {
  display: flex;
  gap: 30px;
  margin-bottom: 20px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2));
  padding: 20px 30px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.playlist-cover {
  flex: 0 0 160px;
  width: 160px;
  height: 160px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  transition: transform 0.3s;
}

.playlist-cover:hover {
  transform: scale(1.02);
}

/* 系统歌单封面 */
.system-cover {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.favorites-cover {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.downloads-cover {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.cover-icon {
  font-size: 100px;
  opacity: 0.9;
}

/* 自定义歌单封面 */
.custom-cover {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.custom-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-icon {
  font-size: 80px;
  opacity: 0.7;
}

/* 歌单信息 */
.playlist-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 15px;
}

.playlist-info h1 {
  margin: 0;
  font-size: 28px;
  font-weight: bold;
  line-height: 1.2;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.playlist-desc {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.5;
  font-size: 13px;
  max-height: 50px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.playlist-meta {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--text-primary);
}

.meta-icon {
  font-size: 14px;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.play-all-btn,
.download-all-btn,
.open-folder-btn,
.import-btn {
  border: none;
  color: white;
  padding: 10px 28px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  position: relative;
  overflow: hidden;
}

.play-all-btn::before,
.download-all-btn::before,
.open-folder-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.2);
  transition: left 0.3s ease;
  z-index: 0;
}

.play-all-btn:hover::before:not(:disabled),
.download-all-btn:hover::before:not(:disabled),
.open-folder-btn:hover::before {
  left: 100%;
}

.play-all-btn,
.download-all-btn,
.open-folder-btn {
  z-index: 1;
}

.play-all-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.35);
}

.play-all-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
}

.play-all-btn:active:not(:disabled) {
  transform: translateY(0);
}

.download-all-btn {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  box-shadow: 0 4px 15px rgba(79, 172, 254, 0.35);
}

.download-all-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(79, 172, 254, 0.5);
}

.download-all-btn:active:not(:disabled) {
  transform: translateY(0);
}

.open-folder-btn {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.35);
}

.open-folder-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(245, 158, 11, 0.5);
}

.open-folder-btn:active {
  transform: translateY(0);
}

.import-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.35);
  min-width: 140px;
  justify-content: center;
}

.import-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.2);
  transition: left 0.3s ease;
  z-index: 0;
}

.import-btn:hover::before {
  left: 100%;
}

.import-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.5);
}

.import-btn:active {
  transform: translateY(0);
}

.import-icon {
  font-size: 16px;
}

.play-all-btn:disabled,
.download-all-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.play-icon,
.download-icon,
.folder-icon {
  font-size: 14px;
}

/* 歌曲列表 */
.playlist-songs {
  margin-top: 0;
}



/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: var(--button-bg);
  border-radius: 12px;
  border: 2px dashed var(--border-color);
}

.empty-icon {
  font-size: 60px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-text {
  font-size: 16px;
  color: var(--text-secondary);
  margin: 0;
}

/* 歌曲列表 */
.songs-list {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.song-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 14px 20px;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.2s;
}

.song-item:last-child {
  border-bottom: none;
}

.song-item:hover {
  background: rgba(102, 126, 234, 0.2);
  transform: translateX(4px);
}

.song-item.is-playing {
  background: rgba(102, 126, 234, 0.3);
}

.song-index {
  flex: 0 0 35px;
  text-align: center;
  font-weight: bold;
  color: var(--text-tertiary);
  font-size: 15px;
}

.song-item:hover .song-index,
.song-item.is-playing .song-index {
  color: var(--text-primary);
}

.playing-indicator {
  color: #667eea;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.song-cover {
  flex: 0 0 50px;
  width: 50px;
  height: 50px;
  border-radius: 6px;
  overflow: hidden;
  background: var(--button-bg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.song-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-cover {
  font-size: 20px;
  opacity: 0.5;
}

.song-details {
  flex: 1;
  min-width: 0;
}

.song-name {
  font-weight: 600;
  font-size: 15px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.downloaded-badge {
  font-size: 12px;
  opacity: 0.7;
}

.song-artist {
  font-size: 13px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-duration {
  flex: 0 0 50px;
  text-align: right;
  font-size: 13px;
  color: var(--text-tertiary);
}

/* 歌曲操作按钮 */
.song-actions {
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s;
}

.song-item:hover .song-actions {
  opacity: 1;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.action-btn svg {
  width: 16px;
  height: 16px;
}

.download-btn {
  background: rgba(79, 172, 254, 0.5);
}

.download-btn:hover {
  background: rgba(79, 172, 254, 0.8);
  transform: scale(1.1);
}

.delete-btn {
  background: rgba(239, 68, 68, 0.5);
}

.add-btn {
  background: rgba(102, 126, 234, 0.5);
}

.add-btn:hover {
  background: rgba(102, 126, 234, 0.8);
  transform: scale(1.1);
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.8);
  transform: scale(1.1);
}

.lyric-btn {
  background: rgba(245, 158, 11, 0.5);
}

.lyric-btn:hover {
  background: rgba(245, 158, 11, 0.8);
  transform: scale(1.1);
}

.lyric-icon {
  font-size: 14px;
}

.favorite-btn-list {
  background: rgba(102, 126, 234, 0.5);
  font-size: 16px;
}

.favorite-btn-list.is-favorite {
  opacity: 1 !important;
  background: rgba(234, 102, 126, 0.8);
  animation: heartbeat 0.6s ease-in-out;
}

.favorite-btn-list:hover {
  background: rgba(234, 102, 126, 0.9);
  transform: scale(1.15);
}

@keyframes heartbeat {
  0%, 100% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.2);
  }
  50% {
    transform: scale(1);
  }
  75% {
    transform: scale(1.15);
  }
}

/* 对话框 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.dialog {
  background: var(--card-bg);
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  border: 1px solid var(--border-color);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
}

.dialog-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.dialog-body {
  padding: 24px;
  text-align: center;
}

.dialog-body p {
  margin: 0 0 10px 0;
  font-size: 16px;
}

.warning-text {
  color: rgba(239, 68, 68, 0.8);
  font-size: 14px !important;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid var(--border-color);
}

.btn-cancel,
.btn-danger {
  padding: 10px 24px;
  border-radius: 8px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-cancel {
  background: var(--button-bg);
  color: var(--text-primary);
}

.btn-cancel:hover {
  background: var(--button-hover-bg);
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.btn-danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

/* Toast 提示 */
.toast {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  z-index: 2000;
  animation: slideUp 0.3s ease-out;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.toast.success {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.toast.error {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.toast.warning {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

/* 加载更多容器 */
.load-more-container {
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.loading-more {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.loading-more .loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid var(--border-color);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-more p {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
}

/* 响应式 */
@media (max-width: 768px) {
  .playlist-header {
    flex-direction: column;
    gap: 20px;
  }

  .playlist-cover {
    flex: 0 0 auto;
    width: 100%;
    max-width: 300px;
    height: auto;
    aspect-ratio: 1;
    margin: 0 auto;
  }

  .playlist-info h1 {
    font-size: 28px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .play-all-btn,
  .download-all-btn,
  .open-folder-btn {
    width: 100%;
    justify-content: center;
  }

  .song-item {
    padding: 12px 15px;
  }

  .song-actions {
    opacity: 1;
  }
}
</style>

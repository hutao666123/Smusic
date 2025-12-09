<template>
  <div class="album-page">
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="album" class="album-content">
      <div class="album-header">
        <img :src="album.picUrl" :alt="album.name" class="album-cover" />
        <div class="album-info">
          <h1>{{ album.name }}</h1>
          <p class="artist">{{ album.artist?.name }}</p>
          <p class="desc">{{ album.description }}</p>
          <div class="album-meta">
            <span>发行时间: {{ formatDate(album.publishTime) }}</span>
            <span>歌曲数: {{ songs.length }}</span>
          </div>
          <div class="action-buttons">
            <button @click="playAll" class="play-all-btn">▶ 播放全部</button>
            <button @click="downloadAll" class="download-all-btn" :disabled="songs.length === 0">⬇ 下载全部</button>
            <button @click="addAllToPlaylist" class="add-all-btn" :disabled="songs.length === 0">➕ 添加全部到歌单</button>
          </div>
        </div>
      </div>

      <div class="songs-list">
        <div
          v-for="(song, index) in songs"
          :key="song.id"
          class="song-item"
          @click="playSong(song, index)"
          @contextmenu.prevent="showContextMenu($event, song)"
        >
          <span class="song-index">{{ index + 1 }}</span>
          <div class="song-info">
            <div class="song-name">{{ song.name }}</div>
            <div class="song-artist">{{ song.ar?.map(a => a.name).join(' / ') }}</div>
          </div>
          <span class="song-duration">{{ formatTime(song.dt / 1000) }}</span>
          
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

            <!-- 添加到播放列表按钮 -->
            <button 
              @click.stop="addToPlaylist(song)" 
              class="action-btn add-btn"
              title="添加到播放列表"
            >
              ➕
            </button>

            <!-- 下载按钮 -->
            <button
              v-if="!isDownloaded(song.id)"
              @click.stop="downloadSong(song)"
              class="action-btn download-btn"
              :class="{ 'downloading': isDownloading(song.id) }"
              :disabled="isDownloading(song.id)"
              :title="isDownloading(song.id) ? '下载中...' : '下载'"
            >
              <span v-if="isDownloading(song.id)" class="download-progress">
                {{ getDownloadProgress(song.id) }}%
              </span>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </button>

            <!-- 已下载标记 -->
            <span v-else class="downloaded-badge" title="已下载">
              💾
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast 提示 -->
    <div v-if="toast.show" class="toast" :class="toast.type">
      {{ toast.message }}
    </div>

    <!-- 右键菜单 -->
    <div
      v-if="contextMenu.show"
      class="context-menu"
      :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
      @click="hideContextMenu"
    >
      <div class="context-menu-item" @click="contextMenuAddToPlaylist">
        <span class="menu-icon">➕</span>
        <span>添加到歌单</span>
      </div>
      <div class="context-menu-item" @click="contextMenuToggleFavorite">
        <span class="menu-icon">{{ isFavorite(contextMenu.song?.id) ? '💔' : '❤️' }}</span>
        <span>{{ isFavorite(contextMenu.song?.id) ? '取消喜欢' : '喜欢' }}</span>
      </div>
      <div class="context-menu-item" @click="contextMenuDownload">
        <span class="menu-icon">⬇</span>
        <span>下载</span>
      </div>
    </div>

    <!-- 添加到歌单对话框 -->
    <AddToPlaylistDialog
      v-model:visible="showAddDialog"
      :song="selectedSong"
      :songs="selectedSongs"
      @success="handleAddSuccess"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { usePlayerStore } from '../stores/player'
import { usePlaylistStore } from '../stores/playlist'
import { useDownloadStore } from '../stores/download'
import { getAlbumDetail } from '../api/music'
import AddToPlaylistDialog from '../components/AddToPlaylistDialog.vue'

const route = useRoute()
const playerStore = usePlayerStore()
const playlistStore = usePlaylistStore()
const downloadStore = useDownloadStore()

const album = ref(null)
const songs = ref([])
const loading = ref(true)
const toast = ref({
  show: false,
  message: '',
  type: 'success'
})

// 右键菜单状态
const contextMenu = ref({
  show: false,
  x: 0,
  y: 0,
  song: null
})

// 添加到歌单对话框
const showAddDialog = ref(false)
const selectedSong = ref(null)
const selectedSongs = ref([])

onMounted(async () => {
  const albumId = route.params.id
  try {
    const res = await getAlbumDetail(albumId)
    album.value = res.data.album
    songs.value = res.data.songs || []
  } catch (error) {
    console.error('获取专辑详情失败:', error)
  } finally {
    loading.value = false
  }
})

const playAll = () => {
  playerStore.clearPlaylist()
  songs.value.forEach(song => {
    playerStore.addToPlaylist({
      id: song.id,
      name: song.name,
      artist: song.ar?.map(a => a.name).join(' / '),
      duration: song.dt / 1000
    })
  })
  playerStore.play()
}

const playSong = (song, index) => {
  playerStore.clearPlaylist()
  songs.value.forEach((s, i) => {
    if (i >= index) {
      playerStore.addToPlaylist({
        id: s.id,
        name: s.name,
        artist: s.ar?.map(a => a.name).join(' / '),
        duration: s.dt / 1000
      })
    }
  })
  playerStore.play()
}

const addToPlaylist = (song) => {
  playerStore.addToPlaylist({
    id: song.id,
    name: song.name,
    artist: song.ar?.map(a => a.name).join(' / ') || '未知艺术家',
    duration: song.dt / 1000
  })
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
    artists: song.ar?.map(a => ({ id: a.id, name: a.name })) || [],
    album: {
      id: song.al?.id || album.value?.id || '',
      name: song.al?.name || album.value?.name || '',
      picUrl: song.al?.picUrl || album.value?.picUrl || ''
    },
    duration: song.dt || 0
  }
  
  if (isFavorite(song.id)) {
    await playlistStore.removeFromFavorites(song.id)
  } else {
    await playlistStore.addToFavorites(songData)
    // 添加喜欢动画
    createFavoriteAnimation(event)
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

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const formatDate = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleDateString('zh-CN')
}

// 下载单曲
const downloadSong = async (song) => {
  const songData = {
    id: song.id,
    name: song.name,
    artists: song.ar?.map(a => ({ id: a.id, name: a.name })) || [],
    album: {
      id: song.al?.id || album.value?.id || '',
      name: song.al?.name || album.value?.name || '',
      picUrl: song.al?.picUrl || album.value?.picUrl || ''
    },
    duration: song.dt || 0
  }

  const result = await downloadStore.downloadSong(songData)
  if (result.success) {
    showToast('开始下载', 'success')
  } else {
    showToast(result.error || '下载失败', 'error')
  }
}

// 下载全部
const downloadAll = async () => {
  if (songs.value.length === 0) return

  showToast(`开始下载 ${songs.value.length} 首歌曲`, 'success')
  
  const songsData = songs.value.map(song => ({
    id: song.id,
    name: song.name,
    artists: song.ar?.map(a => ({ id: a.id, name: a.name })) || [],
    album: {
      id: song.al?.id || album.value?.id || '',
      name: song.al?.name || album.value?.name || '',
      picUrl: song.al?.picUrl || album.value?.picUrl || ''
    },
    duration: song.dt || 0
  }))

  const result = await downloadStore.downloadPlaylist(songsData)
  
  if (result.success) {
    showToast(
      `下载完成：成功 ${result.completed} 首，失败 ${result.failed} 首`,
      result.failed > 0 ? 'warning' : 'success'
    )
  } else {
    showToast(result.error || '批量下载失败', 'error')
  }
}

// 检查是否已下载
const isDownloaded = (songId) => {
  return playlistStore.downloads.some(song => song.id === songId)
}

// 检查是否正在下载
const isDownloading = (songId) => {
  const tasks = Array.from(downloadStore.downloadTasks.values())
  return tasks.some(task => 
    task.songId === songId && 
    (task.status === 'downloading' || task.status === 'pending')
  )
}

// 获取下载进度
const getDownloadProgress = (songId) => {
  const tasks = Array.from(downloadStore.downloadTasks.values())
  const task = tasks.find(task => task.songId === songId)
  return task ? Math.round(task.progress || 0) : 0
}

// 显示提示
const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

// 显示右键菜单
const showContextMenu = (event, song) => {
  contextMenu.value = {
    show: true,
    x: event.clientX,
    y: event.clientY,
    song: song
  }
}

// 隐藏右键菜单
const hideContextMenu = () => {
  contextMenu.value.show = false
}

// 右键菜单：添加到歌单
const contextMenuAddToPlaylist = () => {
  if (contextMenu.value.song) {
    const song = contextMenu.value.song
    selectedSong.value = {
      id: song.id,
      name: song.name,
      artists: song.ar?.map(a => ({ id: a.id, name: a.name })) || [],
      album: {
        id: song.al?.id || album.value?.id || '',
        name: song.al?.name || album.value?.name || '',
        picUrl: song.al?.picUrl || album.value?.picUrl || ''
      },
      duration: song.dt || 0
    }
    selectedSongs.value = []
    showAddDialog.value = true
  }
}

// 右键菜单：切换喜欢
const contextMenuToggleFavorite = async () => {
  if (contextMenu.value.song) {
    const song = contextMenu.value.song
    const songData = {
      id: song.id,
      name: song.name,
      artists: song.ar?.map(a => ({ id: a.id, name: a.name })) || [],
      album: {
        id: song.al?.id || album.value?.id || '',
        name: song.al?.name || album.value?.name || '',
        picUrl: song.al?.picUrl || album.value?.picUrl || ''
      },
      duration: song.dt || 0
    }
    
    if (isFavorite(song.id)) {
      await playlistStore.removeFromFavorites(song.id)
      showToast('已取消喜欢', 'success')
    } else {
      await playlistStore.addToFavorites(songData)
      showToast('已添加到我喜欢的音乐', 'success')
    }
  }
}

// 右键菜单：下载
const contextMenuDownload = () => {
  if (contextMenu.value.song) {
    downloadSong(contextMenu.value.song)
  }
}

// 添加全部到歌单
const addAllToPlaylist = () => {
  if (songs.value.length === 0) return
  
  selectedSong.value = null
  selectedSongs.value = songs.value.map(song => ({
    id: song.id,
    name: song.name,
    artists: song.ar?.map(a => ({ id: a.id, name: a.name })) || [],
    album: {
      id: song.al?.id || album.value?.id || '',
      name: song.al?.name || album.value?.name || '',
      picUrl: song.al?.picUrl || album.value?.picUrl || ''
    },
    duration: song.dt || 0
  }))
  showAddDialog.value = true
}

// 添加成功回调
const handleAddSuccess = (result) => {
  showToast(`成功添加到歌单`, 'success')
}

// 点击页面其他地方关闭右键菜单
const handleClickOutside = (event) => {
  if (contextMenu.value.show) {
    hideContextMenu()
  }
}

// 监听点击事件
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.album-page {
  padding: 20px;
  color: white;
}

.loading {
  text-align: center;
  padding: 40px;
  font-size: 18px;
}

.album-header {
  display: flex;
  gap: 30px;
  margin-bottom: 40px;
}

.album-cover {
  width: 250px;
  height: 250px;
  border-radius: 8px;
  object-fit: cover;
}

.album-info {
  flex: 1;
}

.album-info h1 {
  margin: 0 0 10px 0;
  font-size: 32px;
}

.artist {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 15px 0;
}

.desc {
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 15px 0;
  line-height: 1.6;
}

.album-meta {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  color: rgba(255, 255, 255, 0.7);
}

.play-all-btn {
  background: rgba(102, 126, 234, 0.8);
  border: none;
  color: white;
  padding: 12px 30px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s;
}

.play-all-btn:hover {
  background: rgba(102, 126, 234, 1);
  transform: scale(1.05);
}

.songs-list {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 10px;
}

.song-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s;
}

.song-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.song-index {
  width: 30px;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
}

.song-info {
  flex: 1;
  min-width: 0;
}

.song-name {
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-duration {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

/* 操作按钮组 */
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
  font-size: 16px;
}

.action-btn svg {
  width: 16px;
  height: 16px;
}

.add-btn {
  background: rgba(102, 126, 234, 0.5);
}

.add-btn:hover {
  background: rgba(102, 126, 234, 0.8);
  transform: scale(1.1);
}

.favorite-btn-list {
  background: rgba(102, 126, 234, 0.5);
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

.download-btn {
  background: rgba(79, 172, 254, 0.5);
  position: relative;
}

.download-btn:hover:not(:disabled) {
  background: rgba(79, 172, 254, 0.8);
  transform: scale(1.1);
}

.download-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.download-btn.downloading {
  background: rgba(79, 172, 254, 0.7);
  animation: pulse 1.5s ease-in-out infinite;
}

.download-progress {
  font-size: 10px;
  font-weight: bold;
}

.downloaded-badge {
  font-size: 20px;
  opacity: 0.7;
  display: flex;
  align-items: center;
  justify-content: center;
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

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

/* 操作按钮组 */
.action-buttons {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.download-all-btn {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
  border: none;
  color: white;
  padding: 12px 30px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s;
  box-shadow: 0 4px 16px rgba(79, 172, 254, 0.4);
}

.download-all-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(79, 172, 254, 0.6);
}

.download-all-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

.add-all-btn {
  background: linear-gradient(135deg, #f093fb, #f5576c);
  border: none;
  color: white;
  padding: 12px 30px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s;
  box-shadow: 0 4px 16px rgba(240, 147, 251, 0.4);
}

.add-all-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(240, 147, 251, 0.6);
}

.add-all-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 右键菜单 */
.context-menu {
  position: fixed;
  background: linear-gradient(180deg, #2a2a3e 0%, #1a1a2e 100%);
  border-radius: 8px;
  padding: 8px 0;
  min-width: 180px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 3000;
  animation: contextMenuIn 0.2s ease-out;
}

@keyframes contextMenuIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.context-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.2s;
  color: white;
  font-size: 14px;
}

.context-menu-item:hover {
  background: rgba(102, 126, 234, 0.3);
}

.context-menu-item .menu-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}
</style>

<style>
/* 全局样式：飞行心形动画 */
.flying-heart {
  position: fixed;
  font-size: 20px;
  pointer-events: none;
  z-index: 9999;
  transition: all 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: transform, opacity;
}
</style>

<template>
  <!--在线歌单-->
  <div class="playlist">
    <div v-if="loading" class="loading">加载中...</div>

    <div v-else-if="playlist" class="playlist-content">
      <div class="playlist-header">
        <div class="playlist-cover">
          <img :src="playlist.coverImgUrl" :alt="playlist.name" />
        </div>
        <div class="playlist-info">
          <h1>{{ playlist.name }}</h1>
          <p class="playlist-desc">{{ playlist.description }}</p>
          <div class="playlist-meta">
            <span class="meta-item">
              <span class="meta-icon">👤</span>
              <span class="meta-label">{{ playlist.creator?.nickname }}</span>
            </span>
            <span class="meta-item">
              <span class="meta-icon">🎵</span>
              <span class="meta-label">{{ playlist.trackCount }} 首歌曲</span>
            </span>
            <span class="meta-item">
              <span class="meta-icon">❤️</span>
              <span class="meta-label">{{ formatCount(playlist.subscribedCount) }} 收藏</span>
            </span>
          </div>
          <div class="action-buttons">
            <button @click="playAll" class="play-all-btn">
              <span class="play-icon">▶</span>
              播放全部
            </button>
            <button @click="downloadAll" class="download-all-btn" :disabled="songs.length === 0">
              <span class="download-icon">⬇</span>
              下载全部
            </button>
            <button @click="addAllToPlaylist" class="add-all-btn" :disabled="songs.length === 0">
              <span class="add-icon">➕</span>
              添加全部到歌单
            </button>
            <button @click="toggleCollectPlaylist" class="collect-btn" :class="{ collected: isPlaylistCollected }">
              <span class="collect-icon">{{ isPlaylistCollected ? '❤️' : '🤍' }}</span>
              {{ isPlaylistCollected ? '已收藏' : '收藏歌单' }}
            </button>
          </div>
        </div>
      </div>

      <div class="playlist-songs">
        <div class="songs-list">
          <div
            v-for="(song, index) in displayedSongs"
            :key="song.id"
            class="song-item"
            :class="{ 'is-playing': isCurrentSong(song.id) }"
            @click="playSong(song, index, $event)"
            @contextmenu.prevent="showContextMenu($event, song)"
          >
            <span class="song-index">
              <span v-if="isCurrentSong(song.id)" class="playing-indicator">♪</span>
              <span v-else>{{ index + 1 }}</span>
            </span>
            <div class="song-cover">
              <img v-if="song.al?.picUrl" :src="song.al.picUrl" :alt="song.name" />
              <div v-else class="no-cover">🎵</div>
            </div>
            <div class="song-details">
              <div class="song-name">{{ song.name }}</div>
              <div class="song-artist">
                {{ song.ar?.map(a => a.name).join(' / ') || '未知艺术家' }}
              </div>
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

              <!-- 加入歌单按钮 -->
              <button 
                @click.stop="openAddToPlaylistDialog(song)" 
                class="action-btn add-btn" 
                title="加入歌单"
              >
                +
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

          <!-- 加载更多提示 -->
          <div v-if="hasMoreSongs" class="load-more-container">
            <div v-if="isLoadingMore" class="loading-more">
              <div class="loading-spinner"></div>
              <p>加载中...</p>
            </div>
            <button v-else @click="loadMoreSongs" class="load-more-btn">
              加载更多 ({{ songs.length }}/{{ totalCount }})
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="error">
      加载歌单失败
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
import { ref, onMounted, computed, onBeforeUnmount, onUnmounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { usePlayerStore } from '../stores/player'
import { usePlaylistStore } from '../stores/playlist'
import { useDownloadStore } from '../stores/download'
import { getPlaylistDetail, getPlaylistTracks } from '../api/music'
import AddToPlaylistDialog from '../components/AddToPlaylistDialog.vue'

const route = useRoute()
const playerStore = usePlayerStore()
const playlistStore = usePlaylistStore()
const downloadStore = useDownloadStore()

const playlist = ref(null)
const songs = ref([])
const loading = ref(true)

// 分页状态
const PAGE_SIZE = 10
const currentPage = ref(1)
const isLoadingMore = ref(false)
const totalCount = ref(0)

// 显示的歌曲列表（分页）
const displayedSongs = computed(() => {
  return songs.value
})

// 是否还有更多歌曲
const hasMoreSongs = computed(() => {
  return songs.value.length < totalCount.value
})
const isPlaylistCollected = ref(false)
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

// 加载歌单基本信息
const loadPlaylistInfo = async () => {
  try {
    const res = await getPlaylistDetail(route.params.id)
    playlist.value = res.data.playlist
    totalCount.value = res.data.playlist?.trackCount || 0
    
    // 检查是否已收藏
    if (playlist.value) {
      isPlaylistCollected.value = playlistStore.isCollected(playlist.value.id)
    }
  } catch (error) {
    console.error('加载歌单信息失败:', error)
  }
}

// 加载歌曲列表（分页）
const loadSongs = async (page = 1) => {
  try {
    const offset = (page - 1) * PAGE_SIZE
    const res = await getPlaylistTracks(route.params.id, PAGE_SIZE, offset)
    
    if (res.data.songs) {
      if (page === 1) {
        songs.value = res.data.songs
      } else {
        songs.value = [...songs.value, ...res.data.songs]
      }
    }
  } catch (error) {
    console.error('加载歌曲列表失败:', error)
  }
}

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
const loadMoreSongs = async () => {
  if (isLoadingMore.value || !hasMoreSongs.value) return
  currentPage.value++
  await loadSongs(currentPage.value)
}

onMounted(async () => {
  try {
    // 先加载歌单基本信息
    await loadPlaylistInfo()
    // 再加载第一页歌曲
    await loadSongs(1)
  } catch (error) {
    console.error('加载歌单失败:', error)
  } finally {
    loading.value = false
  }
  
  // 等待 loading 状态更新后再执行滚动
  await nextTick()
  
  // 如果有高亮参数，执行滚动定位
  if (route.query.highlight) {
    await scrollToSong(route.query.highlight)
  }
  
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
  // 重置状态
  currentPage.value = 1
  songs.value = []
  loading.value = true
  
  try {
    await loadPlaylistInfo()
    await loadSongs(1)
  } catch (error) {
    console.error('加载歌单失败:', error)
  } finally {
    loading.value = false
  }
  
  // 等待 loading 状态更新后再执行滚动
  await nextTick()
  
  // 如果有高亮参数，执行滚动定位
  if (route.query.highlight) {
    await scrollToSong(route.query.highlight)
  }
})

// 滚动到指定歌曲并高亮
const scrollToSong = async (songId) => {
  
  let songIndex = songs.value.findIndex(s => s.id == songId)
  
  // 如果在当前已加载的歌曲中找不到，继续加载更多页
  if (songIndex === -1 && songs.value.length < totalCount.value) {
    
    // 计算需要加载的总页数
    const totalPages = Math.ceil(totalCount.value / PAGE_SIZE)
    
    // 逐页加载直到找到歌曲或加载完所有歌曲
    for (let page = currentPage.value + 1; page <= totalPages; page++) {
      await loadSongs(page)
      currentPage.value = page
      
      // 每加载一页就检查一次
      songIndex = songs.value.findIndex(s => s.id == songId)
      if (songIndex !== -1) {
        break
      }
    }
  }
  
  if (songIndex === -1) {
    showToast('未找到该歌曲', 'warning')
    return
  }
  
  // 如果歌曲还未显示（分页显示），更新显示页数
  if (songIndex >= displayedSongs.value.length) {
    const neededPage = Math.ceil((songIndex + 1) / PAGE_SIZE)
    currentPage.value = Math.max(currentPage.value, neededPage)
  }
  
  // 使用 nextTick 确保 DOM 更新完成
  await nextTick()
  // 再等待一下确保渲染完成
  await new Promise(resolve => setTimeout(resolve, 300))
  
  // 查找歌曲元素
  const songElements = document.querySelectorAll('.song-item')
  const targetElement = songElements[songIndex]
  
  if (targetElement) {
    
    // 添加高亮类
    targetElement.classList.add('highlight-song')
    
    // 找到滚动容器
    const scrollContainer = document.querySelector('.app-main')
    if (scrollContainer) {
      // 计算目标元素相对于滚动容器的位置
      const containerRect = scrollContainer.getBoundingClientRect()
      const targetRect = targetElement.getBoundingClientRect()
      
      // 计算需要滚动的距离（让元素居中）
      const scrollTop = scrollContainer.scrollTop
      const offset = targetRect.top - containerRect.top - (containerRect.height / 2) + (targetRect.height / 2)
      
      // 平滑滚动
      scrollContainer.scrollTo({
        top: scrollTop + offset,
        behavior: 'smooth'
      })
    } else {
      // 如果找不到滚动容器，使用默认方式
      targetElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      })
    }
    
    // 3秒后移除高亮
    setTimeout(() => {
      targetElement.classList.remove('highlight-song')
    }, 3000)
  } else {
  }
}

const playAll = async () => {
  // 非本地歌单，使用在线播放
  playerStore.forceLocalMode = false
  // 设置当前播放列表来源
  playerStore.setCurrentPlaylist(route.params.id, 'online')
  
  playerStore.clearPlaylist()
  
  // 立即添加已加载的歌曲并播放
  songs.value.forEach(s => {
    playerStore.addToPlaylist({
      id: s.id,
      name: s.name,
      artist: s.ar?.map(a => a.name).join(' / ') || '未知艺术家',
      duration: s.dt / 1000,
      cover: s.al?.picUrl || ''
    })
  })
  playerStore.play()
  
  // 后台加载剩余歌曲
  if (songs.value.length < totalCount.value) {
    showToast(`正在后台加载剩余 ${totalCount.value - songs.value.length} 首歌曲...`, 'success')
    const totalPages = Math.ceil(totalCount.value / PAGE_SIZE)
    for (let page = currentPage.value + 1; page <= totalPages; page++) {
      await loadSongs(page)
      currentPage.value = page
      
      // 将新加载的歌曲添加到播放列表
      const startIndex = (page - 1) * PAGE_SIZE
      const endIndex = Math.min(page * PAGE_SIZE, songs.value.length)
      for (let i = startIndex; i < endIndex; i++) {
        const s = songs.value[i]
        playerStore.addToPlaylist({
          id: s.id,
          name: s.name,
          artist: s.ar?.map(a => a.name).join(' / ') || '未知艺术家',
          duration: s.dt / 1000,
          cover: s.al?.picUrl || ''
        })
      }
    }
    showToast(`全部 ${songs.value.length} 首歌曲已加载完成`, 'success')
  } else {
    showToast(`已添加全部 ${songs.value.length} 首歌曲`, 'success')
  }
}

const playSong = async (song, displayIndex, event) => {
  // 非本地歌单，使用在线播放
  playerStore.forceLocalMode = false
  // 设置当前播放列表来源
  playerStore.setCurrentPlaylist(route.params.id, 'online')
  
  // 找到歌曲在完整列表中的真实索引
  const realIndex = songs.value.findIndex(s => s.id === song.id)
  
  playerStore.clearPlaylist()
  
  // 立即添加已加载的歌曲（从点击的歌曲开始）并播放
  for (let i = realIndex; i < songs.value.length; i++) {
    const s = songs.value[i]
    playerStore.addToPlaylist({
      id: s.id,
      name: s.name,
      artist: s.ar?.map(a => a.name).join(' / ') || '未知艺术家',
      duration: s.dt / 1000,
      cover: s.al?.picUrl || ''
    })
  }
  playerStore.play()
  
  // 后台加载剩余歌曲
  if (songs.value.length < totalCount.value) {
    showToast(`正在后台加载剩余 ${totalCount.value - songs.value.length} 首歌曲...`, 'success')
    const totalPages = Math.ceil(totalCount.value / PAGE_SIZE)
    for (let page = currentPage.value + 1; page <= totalPages; page++) {
      await loadSongs(page)
      currentPage.value = page
      
      // 将新加载的歌曲添加到播放列表
      const startIndex = (page - 1) * PAGE_SIZE
      const endIndex = Math.min(page * PAGE_SIZE, songs.value.length)
      for (let i = startIndex; i < endIndex; i++) {
        const s = songs.value[i]
        playerStore.addToPlaylist({
          id: s.id,
          name: s.name,
          artist: s.ar?.map(a => a.name).join(' / ') || '未知艺术家',
          duration: s.dt / 1000,
          cover: s.al?.picUrl || ''
        })
      }
    }
    showToast(`全部歌曲已加载完成`, 'success')
  }
  
  // 创建飞行音符动画
  if (event) {
    createFlyingNote(event)
  }
}

const addToPlaylist = (song, event) => {
  playerStore.addToPlaylist({
    id: song.id,
    name: song.name,
    artist: song.ar?.map(a => a.name).join(' / ') || '未知艺术家',
    duration: song.dt / 1000,
    cover: song.al?.picUrl || ''
  })
  
  // 创建飞行音符动画
  createFlyingNote(event)
}

const createFlyingNote = (event) => {
  const button = event.currentTarget
  const rect = button.getBoundingClientRect()
  
  // 创建音符元素
  const note = document.createElement('div')
  note.className = 'flying-note'
  note.innerHTML = '♪'
  
  // 设置起始位置
  const startX = rect.left + rect.width / 2
  const startY = rect.top + rect.height / 2
  note.style.left = startX + 'px'
  note.style.top = startY + 'px'
  
  document.body.appendChild(note)
  
  // 获取播放器位置（底部中间）
  const targetX = window.innerWidth / 2
  const targetY = window.innerHeight - 60
  
  // 计算移动距离
  const deltaX = targetX - startX
  const deltaY = targetY - startY
  
  // 使用requestAnimationFrame确保动画触发
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      note.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.3) rotate(360deg)`
      note.style.opacity = '0'
    })
  })
  
  // 动画结束后移除元素
  setTimeout(() => {
    note.remove()
  }, 1000)
}

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const formatCount = (count) => {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + '万'
  }
  return count
}

// 检查是否是当前播放的歌曲
const isCurrentSong = (songId) => {
  return playerStore.currentSong?.id === songId && playerStore.isPlaying
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
      id: song.al?.id || '',
      name: song.al?.name || '',
      picUrl: song.al?.picUrl || ''
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

// 下载单曲
const downloadSong = async (song) => {
  const songData = {
    id: song.id,
    name: song.name,
    artists: song.ar?.map(a => ({ id: a.id, name: a.name })) || [],
    album: {
      id: song.al?.id || '',
      name: song.al?.name || '',
      picUrl: song.al?.picUrl || ''
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
  if (!playlist.value) return

  // 显示加载提示
  showToast(`正在获取完整歌单...`, 'success')
  
  try {
    // 获取完整歌单的所有歌曲
    let allSongs = []
    const pageSize = 50
    const totalPages = Math.ceil(totalCount.value / pageSize)
    
    for (let page = 1; page <= totalPages; page++) {
      const offset = (page - 1) * pageSize
      const res = await getPlaylistTracks(route.params.id, pageSize, offset)
      
      if (res.data.songs) {
        allSongs = [...allSongs, ...res.data.songs]
      }
      
      // 显示加载进度
      if (page < totalPages) {
        showToast(`已获取 ${allSongs.length}/${totalCount.value} 首歌曲`, 'success')
      }
    }
    
    if (allSongs.length === 0) {
      showToast('歌单中没有歌曲', 'warning')
      return
    }
    
    showToast(`开始下载 ${allSongs.length} 首歌曲`, 'success')
    
    const songsData = allSongs.map(song => ({
      id: song.id,
      name: song.name,
      artists: song.ar?.map(a => ({ id: a.id, name: a.name })) || [],
      album: {
        id: song.al?.id || '',
        name: song.al?.name || '',
        picUrl: song.al?.picUrl || ''
      },
      duration: song.dt || 0,
      url: song.url || song.songUrl
    }))

    // 显示下载面板
    if (window.__showDownloadPanel) {
      window.__showDownloadPanel()
    }

    const result = await downloadStore.downloadPlaylist(songsData)
    
    if (result.success) {
      showToast(
        `下载完成：成功 ${result.data.success} 首，失败 ${result.data.failed} 首，跳过 ${result.data.skipped} 首`,
        result.data.failed > 0 ? 'warning' : 'success'
      )
    } else {
      showToast(result.error || '批量下载失败', 'error')
    }
  } catch (error) {
    console.error('下载全部失败:', error)
    showToast('下载全部失败', 'error')
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

// 打开加入歌单对话框
const openAddToPlaylistDialog = (song) => {
  selectedSong.value = {
    id: song.id,
    name: song.name,
    artists: song.ar?.map(a => ({ id: a.id, name: a.name })) || [],
    album: {
      id: song.al?.id || '',
      name: song.al?.name || '',
      picUrl: song.al?.picUrl || ''
    },
    duration: song.dt || 0
  }
  selectedSongs.value = []
  showAddDialog.value = true
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
        id: song.al?.id || '',
        name: song.al?.name || '',
        picUrl: song.al?.picUrl || ''
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
        id: song.al?.id || '',
        name: song.al?.name || '',
        picUrl: song.al?.picUrl || ''
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
const addAllToPlaylist = async () => {
  if (totalCount.value === 0) return
  
  // 如果还有未加载的歌曲，先加载全部
  if (hasMoreSongs.value) {
    showToast(`正在加载全部 ${totalCount.value} 首歌曲...`, 'success')
    
    // 计算需要加载的页数
    const totalPages = Math.ceil(totalCount.value / PAGE_SIZE)
    
    // 加载所有剩余页面
    for (let page = currentPage.value + 1; page <= totalPages; page++) {
      await loadSongs(page)
      currentPage.value = page
    }
    
    showToast(`已加载全部 ${songs.value.length} 首歌曲`, 'success')
  }
  
  // 将所有歌曲传递给对话框
  selectedSong.value = null
  selectedSongs.value = songs.value.map(song => ({
    id: song.id,
    name: song.name,
    artists: song.ar?.map(a => ({ id: a.id, name: a.name })) || [],
    album: {
      id: song.al?.id || '',
      name: song.al?.name || '',
      picUrl: song.al?.picUrl || ''
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

// 切换收藏状态
const toggleCollectPlaylist = async () => {
  if (!playlist.value) return
  
  if (isPlaylistCollected.value) {
    // 取消收藏
    const success = await playlistStore.uncollectOnlinePlaylist(playlist.value.id)
    if (success) {
      isPlaylistCollected.value = false
      showToast('已取消收藏', 'success')
    }
  } else {
    // 收藏歌单
    const playlistData = {
      id: playlist.value.id,
      name: playlist.value.name,
      description: playlist.value.description,
      coverImgUrl: playlist.value.coverImgUrl,
      trackCount: playlist.value.trackCount,
      creator: playlist.value.creator,
      playCount: playlist.value.playCount,
      tags: playlist.value.tags,
      source: 'netease',
      url: `https://music.163.com/#/playlist?id=${playlist.value.id}`
    }
    const success = await playlistStore.collectOnlinePlaylist(playlistData)
    if (success) {
      isPlaylistCollected.value = true
      showToast('已收藏歌单', 'success')
    }
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
.playlist {
  min-height: 100vh;
  background: var(--page-bg);
  color: var(--text-primary);
  padding: 20px;
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

.playlist-header {
  display: flex;
  gap: 40px;
  margin-bottom: 50px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2));
  padding: 30px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.playlist-cover {
  flex: 0 0 220px;
  width: 220px;
  height: 220px;
  background: var(--button-bg);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  transition: transform 0.3s;
}

.playlist-cover:hover {
  transform: scale(1.02);
}

.playlist-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.playlist-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 15px;
}

.playlist-info h1 {
  margin: 0;
  font-size: 36px;
  font-weight: bold;
  line-height: 1.2;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.playlist-desc {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.6;
  font-size: 14px;
  max-height: 90px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 5;
  -webkit-box-orient: vertical;
}

.playlist-meta {
  display: flex;
  gap: 25px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--text-primary);
}

.meta-icon {
  font-size: 16px;
}

.play-all-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  color: white;
  padding: 14px 32px;
  border-radius: 30px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
  align-self: flex-start;
}

.play-all-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.play-icon {
  font-size: 14px;
}

.playlist-songs {
  margin-top: 40px;
}

.songs-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid var(--border-color);
}

.songs-header h3 {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
}

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
  padding: 14px 32px;
  border-radius: 30px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
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

.download-icon {
  font-size: 14px;
}

.add-all-btn {
  background: linear-gradient(135deg, #f093fb, #f5576c);
  border: none;
  color: white;
  padding: 14px 32px;
  border-radius: 30px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
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

.add-icon {
  font-size: 14px;
}

.collect-btn {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  border: none;
  color: white;
  padding: 14px 32px;
  border-radius: 30px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 16px rgba(245, 158, 11, 0.4);
}

.collect-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(245, 158, 11, 0.6);
}

.collect-btn.collected {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  box-shadow: 0 4px 16px rgba(245, 158, 11, 0.6);
}

.collect-icon {
  font-size: 16px;
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

/* 高亮动画 */
.highlight-song {
  animation: highlightPulse 1.5s ease-in-out 2;
  background: rgba(102, 126, 234, 0.4) !important;
}

@keyframes highlightPulse {
  0%, 100% {
    background: rgba(102, 126, 234, 0.4);
    transform: scale(1);
  }
  50% {
    background: rgba(102, 126, 234, 0.6);
    transform: scale(1.01);
  }
}

/* 右键菜单 */
.context-menu {
  position: fixed;
  background: var(--card-bg);
  border-radius: 8px;
  padding: 8px 0;
  min-width: 180px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  border: 1px solid var(--border-color);
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
  color: var(--text-primary);
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
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-more p {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.load-more-btn {
  padding: 12px 32px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  border-radius: 25px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
}

.load-more-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
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

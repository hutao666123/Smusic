<template>
  <div class="player-bar">
    <div class="player-info">
      <div v-if="currentSong" class="song-info">
        <div class="song-cover-small" @click="goToSongDetail" v-if="songCover">
          <img :src="songCover" :alt="currentSong.name" class="cover-img" />
        </div>
        <div class="song-cover-small placeholder" @click="goToSongDetail" v-else>
          <span>🎵</span>
        </div>
        <div class="song-text" @click="goToSongDetail">
          <div class="song-name" ref="songNameRef">
            <span class="song-name-text">{{ currentSong.name }}</span>
          </div>
          <div class="song-artist" ref="songArtistRef">
            <span class="song-artist-text">{{ currentSong.artist }}</span>
          </div>
        </div>
      </div>
      <div v-else class="song-info">
        <div class="song-name">未选择歌曲</div>
      </div>
    </div>

    <div class="player-controls">
      <button @click="changePlayMode" class="control-btn mode-control-btn" :title="playModeText">
        {{ playModeIcon }}
      </button>
      <button @click="prev" class="control-btn">⏮</button>
      <button @click="togglePlay" class="control-btn play-btn">
        {{ isPlaying ? '⏸' : '▶' }}
      </button>
      <button @click="next" class="control-btn">⏭</button>
    </div>

    <div class="player-progress">
      <span class="time">{{ formatTime(currentTime) }}</span>
      <div class="progress-bar">
        <div class="progress" :style="{ width: progressPercent + '%' }"></div>
        <input
          type="range"
          min="0"
          :max="duration"
          :value="currentTime"
          @input="handleProgressChange"
          class="progress-input"
        />
      </div>
      <span class="time">{{ formatTime(duration) }}</span>
    </div>

    <div class="player-volume">
      <span>🔊</span>
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        :value="volume"
        @input="handleVolumeChange"
        class="volume-input"
      />
    </div>

    <div class="player-extras">
      <button 
        v-if="currentSong"
        @click="toggleFavorite" 
        class="extra-btn favorite-btn" 
        :class="{ 'is-favorite': isFavorited }"
        :title="isFavorited ? '取消喜欢' : '喜欢'"
      >
        {{ isFavorited ? '❤️' : '🤍' }}
      </button>
      <button 
        v-if="currentSong"
        @click.stop="showAddToPlaylistDialog($event)" 
        class="extra-btn add-playlist-btn" 
        title="加入歌单"
      >
        ➕
      </button>
      <button @click="goToLyrics" class="extra-btn lyrics-btn" title="歌词">
        📝
      </button>
      <button @click="togglePlaylist" class="extra-btn playlist-btn" title="播放列表">
        ⋯
      </button>
    </div>

    <!-- 加入歌单对话框 -->
    <AddToPlaylistDialog
      :visible="showAddDialog"
      :song="songToAdd"
      @update:visible="showAddDialog = $event"
      @success="handleAddDialogClose"
      @cancel="handleAddDialogClose"
    />

    <!-- 播放列表弹窗 -->
    <div v-if="showPlaylist" class="playlist-modal" @click.self="closePlaylist">
      <div class="playlist-content" ref="playlistContent" tabindex="-1" @blur="handleBlur">
        <div class="playlist-header">
          <h3>播放列表 ({{ playlist.length }})</h3>
          <div class="header-controls">
            <button @click="clearPlaylist" class="clear-btn">清空</button>
            <div class="play-mode-selector">
              <button 
                @click="changePlayMode" 
                class="mode-btn"
                :title="playModeText"
              >
                {{ playModeIcon }}
              </button>
            </div>
          </div>
        </div>
        <div class="playlist-items">
          <div
            v-for="(song, index) in playlist"
            :key="song.id + '-' + index"
            :class="['playlist-item', { active: index === currentIndex }]"
            draggable="true"
            @dragstart="handleDragStart(index, $event)"
            @dragover.prevent="handleDragOver(index, $event)"
            @drop="handleDrop(index, $event)"
            @dragend="handleDragEnd"
            @click="playSongAtIndex(index)"
          >
            <span class="song-index">{{ index + 1 }}</span>
            <div class="song-cover-tiny">
              <img v-if="song.cover" :src="song.cover" :alt="song.name" />
              <span v-else>🎵</span>
            </div>
            <div class="song-info-item">
              <div class="song-name-item">{{ song.name }}</div>
              <div class="song-artist-item">{{ song.artist }}</div>
            </div>
            <div class="song-actions">
              <button @click.stop="toggleActions(index)" class="more-btn">⋮</button>
              <div v-if="activeActionIndex === index" class="action-menu">
                <button @click.stop="removeSong(index)" class="action-item">
                  <span>🗑️</span> 移除
                </button>
                <button 
                  @click.stop="moveSongUp(index)" 
                  class="action-item"
                  :disabled="index === 0"
                >
                  <span>⬆️</span> 上移
                </button>
                <button 
                  @click.stop="moveSongDown(index)" 
                  class="action-item"
                  :disabled="index === playlist.length - 1"
                >
                  <span>⬇️</span> 下移
                </button>
              </div>
            </div>
          </div>
          <div v-if="playlist.length === 0" class="empty-playlist">
            播放列表为空
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, watch, ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '../stores/player'
import { usePlaylistStore } from '../stores/playlist'
import { getSongDetail } from '../api/music'
import audioPlayer from '../services/audioPlayer'
import AddToPlaylistDialog from './AddToPlaylistDialog.vue'

const router = useRouter()
const playerStore = usePlayerStore()
const playlistStore = usePlaylistStore()

const songCover = ref('')
const showPlaylist = ref(false)
const playlistContent = ref(null)
const activeActionIndex = ref(null)
const draggedIndex = ref(null)
const playMode = ref('order') // 'order' | 'random' | 'loop'
const showAddDialog = ref(false)
const songToAdd = ref(null)
const songNameRef = ref(null)
const songArtistRef = ref(null)

const currentSong = computed(() => playerStore.currentSong)
const isPlaying = computed(() => playerStore.isPlaying)
const currentTime = computed(() => playerStore.currentTime)
const duration = computed(() => playerStore.duration)
const volume = computed(() => playerStore.volume)
const playlist = computed(() => playerStore.playlist)
const currentIndex = computed(() => playerStore.currentIndex)

// 喜欢状态
const isFavorited = computed(() => {
  if (!currentSong.value || !currentSong.value.id) return false
  return playlistStore.isFavorite(currentSong.value.id)
})

const playModeIcon = computed(() => {
  switch (playMode.value) {
    case 'random': return '🔀'
    case 'loop': return '🔁'
    default: return '➡️'
  }
})

const playModeText = computed(() => {
  switch (playMode.value) {
    case 'random': return '随机播放'
    case 'loop': return '循环播放'
    default: return '顺序播放'
  }
})

const progressPercent = computed(() => {
  return duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0
})

onMounted(() => {
  audioPlayer.setPlayerStore(playerStore)
  // 初始化音量
  audioPlayer.setVolume(playerStore.volume)
  // 设置播放模式获取函数
  audioPlayer.getPlayMode = () => playMode.value
  
  // 检查文本溢出
  checkTextOverflow()
  
  // 恢复播放状态：如果有播放列表和当前歌曲
  if (playerStore.playlist.length > 0 && playerStore.currentSong) {
    const savedTime = playerStore.currentTime
    const wasPlaying = playerStore.isPlaying
    const currentSongData = playerStore.currentSong
    
    // 恢复封面
    if (currentSongData.cover) {
      songCover.value = currentSongData.cover
    } else if (currentSongData.id) {
      // 如果没有封面，异步获取
      getSongDetail(currentSongData.id).then(res => {
        if (res.data.songs && res.data.songs[0]) {
          const song = res.data.songs[0]
          if (song.al && song.al.picUrl) {
            songCover.value = song.al.picUrl
            currentSongData.cover = song.al.picUrl
          }
        }
      }).catch(err => {
        console.error('获取封面失败:', err)
      })
    }
    
    // 先设置为不播放，加载完成后再决定
    playerStore.isPlaying = false
    
    // 预加载当前歌曲
    audioPlayer.playCurrentSong().then(() => {
      // 恢复播放进度
      if (savedTime > 0) {
        audioPlayer.setCurrentTime(savedTime)
      }
      
      // 如果刷新前正在播放，则自动继续播放
      if (wasPlaying) {
        audioPlayer.audio.play()
        playerStore.isPlaying = true
      }
    })
  }
})

// 检查文本是否溢出
const checkTextOverflow = () => {
  nextTick(() => {
    if (songNameRef.value) {
      const container = songNameRef.value
      const text = container.querySelector('.song-name-text')
      if (text && text.scrollWidth > container.clientWidth) {
        container.classList.add('overflow')
      } else {
        container.classList.remove('overflow')
      }
    }
    
    if (songArtistRef.value) {
      const container = songArtistRef.value
      const text = container.querySelector('.song-artist-text')
      if (text && text.scrollWidth > container.clientWidth) {
        container.classList.add('overflow')
      } else {
        container.classList.remove('overflow')
      }
    }
  })
}

// 监听播放状态变化（仅控制暂停/继续，不触发新歌曲加载）
watch(isPlaying, (newVal) => {
  // 只有在已经有音频源的情况下才控制播放/暂停
  if (audioPlayer.audio.src) {
    if (newVal) {
      audioPlayer.audio.play()
    } else {
      audioPlayer.audio.pause()
    }
  }
})

// 监听当前歌曲变化
watch(currentSong, async (newSong, oldSong) => {
  // 只有在歌曲真正改变时才触发播放
  if (newSong && newSong.id && newSong.id !== oldSong?.id) {
    audioPlayer.playCurrentSong()
    
    // 检查文本溢出
    checkTextOverflow()
    
    // 立即更新封面（如果有的话），避免显示上一首歌的封面
    songCover.value = newSong.cover || ''
    
    // 获取歌曲详情以获取图片
    if (!fetchedCovers.has(newSong.id)) {
      fetchedCovers.add(newSong.id)
      try {
        const res = await getSongDetail(newSong.id)
        if (res.data.songs && res.data.songs[0]) {
          const song = res.data.songs[0]
          if (song.al && song.al.picUrl) {
            songCover.value = song.al.picUrl
            // 更新播放列表中的封面
            if (!newSong.cover) {
              newSong.cover = song.al.picUrl
            }
          }
        }
      } catch (error) {
        console.error('获取歌曲详情失败:', error)
      }
    } else if (newSong.cover) {
      // 如果已经请求过且有封面，直接使用
      songCover.value = newSong.cover
    }
  }
})

// 监听播放列表变化，为没有封面的歌曲获取封面
// 使用 Set 记录已经请求过的歌曲，避免重复请求
const fetchedCovers = new Set()

watch(playlist, async (newPlaylist, oldPlaylist) => {
  // 只处理新增的歌曲
  const oldIds = new Set(oldPlaylist?.map(s => s.id) || [])
  const newSongs = newPlaylist.filter(song => !oldIds.has(song.id))
  
  for (const song of newSongs) {
    if (song.id && !song.cover && !fetchedCovers.has(song.id)) {
      fetchedCovers.add(song.id)
      try {
        const res = await getSongDetail(song.id)
        if (res.data.songs && res.data.songs[0]) {
          const songDetail = res.data.songs[0]
          if (songDetail.al && songDetail.al.picUrl) {
            song.cover = songDetail.al.picUrl
          }
        }
      } catch (error) {
        console.error('获取歌曲封面失败:', error)
      }
    }
  }
})

const togglePlay = () => {
  audioPlayer.togglePlay()
}

const next = () => {
  // 只改变索引，让 watch(currentSong) 自动触发播放
  playerStore.next()
}

const prev = () => {
  // 只改变索引，让 watch(currentSong) 自动触发播放
  playerStore.prev()
}

const handleProgressChange = (e) => {
  const time = parseFloat(e.target.value)
  playerStore.setCurrentTime(time)
  audioPlayer.setCurrentTime(time)
}

const handleVolumeChange = (e) => {
  const vol = parseFloat(e.target.value)
  playerStore.setVolume(vol)
  audioPlayer.setVolume(vol)
}

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const togglePlaylist = async () => {
  showPlaylist.value = !showPlaylist.value
  if (showPlaylist.value) {
    // 等待 DOM 更新后自动聚焦
    await nextTick()
    if (playlistContent.value) {
      playlistContent.value.focus()
    }
  }
}

const closePlaylist = () => {
  showPlaylist.value = false
}

const handleBlur = (e) => {
  // 检查失焦的目标是否在播放列表内部
  if (!e.currentTarget.contains(e.relatedTarget)) {
    // 延迟关闭，避免点击内部元素时立即关闭
    setTimeout(() => {
      if (!playlistContent.value?.matches(':focus-within')) {
        showPlaylist.value = false
      }
    }, 100)
  }
}

const playSongAtIndex = (index) => {
  // 只改变索引，让 watch(currentSong) 自动触发播放
  playerStore.currentIndex = index
}

const removeSong = (index) => {
  if (playlist.value.length === 1) {
    playerStore.clearPlaylist()
    audioPlayer.stop()
  } else {
    const wasCurrentSong = index === currentIndex.value
    playerStore.playlist.splice(index, 1)
    
    if (index < currentIndex.value) {
      playerStore.currentIndex--
    } else if (wasCurrentSong) {
      // 删除当前歌曲后，索引不变但歌曲对象会变化
      // 需要强制触发 watch，通过临时改变索引实现
      const tempIndex = playerStore.currentIndex
      playerStore.currentIndex = -1
      nextTick(() => {
        playerStore.currentIndex = Math.min(tempIndex, playlist.value.length - 1)
      })
    }
  }
}

const clearPlaylist = () => {
  if (confirm('确定要清空播放列表吗？')) {
    playerStore.clearPlaylist()
    audioPlayer.stop()
    showPlaylist.value = false
  }
}

const goToSongDetail = () => {
  if (currentSong.value && currentSong.value.id) {
    router.push(`/song/${currentSong.value.id}`)
  }
}

const goToLyrics = () => {
  router.push('/lyrics')
}

const toggleActions = (index) => {
  activeActionIndex.value = activeActionIndex.value === index ? null : index
}

const moveSongUp = (index) => {
  if (index > 0) {
    const temp = playlist.value[index]
    playlist.value.splice(index, 1)
    playlist.value.splice(index - 1, 0, temp)
    
    // 更新当前播放索引
    if (currentIndex.value === index) {
      playerStore.currentIndex = index - 1
    } else if (currentIndex.value === index - 1) {
      playerStore.currentIndex = index
    }
  }
  activeActionIndex.value = null
}

const moveSongDown = (index) => {
  if (index < playlist.value.length - 1) {
    const temp = playlist.value[index]
    playlist.value.splice(index, 1)
    playlist.value.splice(index + 1, 0, temp)
    
    // 更新当前播放索引
    if (currentIndex.value === index) {
      playerStore.currentIndex = index + 1
    } else if (currentIndex.value === index + 1) {
      playerStore.currentIndex = index
    }
  }
  activeActionIndex.value = null
}

const handleDragStart = (index, event) => {
  draggedIndex.value = index
  event.dataTransfer.effectAllowed = 'move'
  event.target.style.opacity = '0.5'
}

const handleDragOver = (index, event) => {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'move'
}

const handleDrop = (index, event) => {
  event.preventDefault()
  if (draggedIndex.value !== null && draggedIndex.value !== index) {
    const draggedSong = playlist.value[draggedIndex.value]
    const newPlaylist = [...playlist.value]
    
    // 移除拖拽的歌曲
    newPlaylist.splice(draggedIndex.value, 1)
    // 插入到新位置
    newPlaylist.splice(index, 0, draggedSong)
    
    // 更新播放列表
    playerStore.playlist = newPlaylist
    
    // 更新当前播放索引
    if (currentIndex.value === draggedIndex.value) {
      playerStore.currentIndex = index
    } else if (draggedIndex.value < currentIndex.value && index >= currentIndex.value) {
      playerStore.currentIndex = currentIndex.value - 1
    } else if (draggedIndex.value > currentIndex.value && index <= currentIndex.value) {
      playerStore.currentIndex = currentIndex.value + 1
    }
  }
}

const handleDragEnd = (event) => {
  event.target.style.opacity = '1'
  draggedIndex.value = null
}

const changePlayMode = () => {
  const modes = ['order', 'random', 'loop']
  const currentModeIndex = modes.indexOf(playMode.value)
  const newMode = modes[(currentModeIndex + 1) % modes.length]
  
  // 如果切换到随机模式，打乱播放列表
  if (newMode === 'random' && playlist.value.length > 0) {
    const currentSongData = currentSong.value
    const newPlaylist = [...playlist.value]
    
    // Fisher-Yates 洗牌算法
    for (let i = newPlaylist.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newPlaylist[i], newPlaylist[j]] = [newPlaylist[j], newPlaylist[i]]
    }
    
    // 更新播放列表
    playerStore.playlist = newPlaylist
    
    // 找到当前歌曲在新列表中的位置
    if (currentSongData) {
      const newIndex = newPlaylist.findIndex(song => song.id === currentSongData.id)
      if (newIndex !== -1) {
        playerStore.currentIndex = newIndex
      }
    }
  }
  
  playMode.value = newMode
  console.log('播放模式切换为:', playModeText.value)
}

// 切换喜欢状态
const toggleFavorite = async () => {
  if (!currentSong.value || !currentSong.value.id) return
  
  const song = currentSong.value
  const songData = {
    id: song.id,
    name: song.name,
    artists: song.artist ? [{ name: song.artist }] : [],
    album: {
      name: song.album || '',
      picUrl: song.cover || songCover.value || ''
    },
    duration: Math.round((song.duration || 0) * 1000)
  }
  
  if (isFavorited.value) {
    await playlistStore.removeFromFavorites(song.id)
  } else {
    const success = await playlistStore.addToFavorites(songData)
    if (success) {
      createFavoriteAnimation()
    }
  }
}

// 创建喜欢动画
const createFavoriteAnimation = () => {
  const button = document.querySelector('.favorite-btn')
  if (!button) return
  
  const rect = button.getBoundingClientRect()
  
  // 创建多个心形元素
  for (let i = 0; i < 5; i++) {
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
    const distance = 50 + Math.random() * 50
    const deltaX = Math.cos(angle) * distance
    const deltaY = -Math.abs(Math.sin(angle)) * distance - 30
    
    // 延迟启动动画
    setTimeout(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          heart.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1.5) rotate(${Math.random() * 360}deg)`
          heart.style.opacity = '0'
        })
      })
    }, i * 50)
    
    // 动画结束后移除元素
    setTimeout(() => {
      heart.remove()
    }, 800 + i * 50)
  }
}

// 显示加入歌单对话框
const showAddToPlaylistDialog = (event) => {
  if (!currentSong.value) return
  
  // 阻止事件冒泡
  if (event) {
    event.stopPropagation()
  }
  
  console.log('点击加入歌单按钮', currentSong.value)
  
  songToAdd.value = {
    id: currentSong.value.id,
    name: currentSong.value.name,
    artists: currentSong.value.artist ? [{ name: currentSong.value.artist }] : [],
    album: {
      name: currentSong.value.album || '',
      picUrl: currentSong.value.cover || songCover.value || ''
    },
    duration: Math.round((currentSong.value.duration || 0) * 1000)
  }
  
  showAddDialog.value = true
  console.log('showAddDialog 设置为 true', showAddDialog.value)
}

const handleAddDialogClose = () => {
  showAddDialog.value = false
  songToAdd.value = null
}
</script>

<style scoped>
.player-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  color: white;
  background: rgba(0, 0, 0, 0.7);
  padding: 15px 20px;
  border-radius: 8px;
}

.player-info {
  flex: 0 0 200px;
  width: 200px;
  min-width: 200px;
  max-width: 200px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.song-info {
  display: flex;
  align-items: center;
  gap: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: opacity 0.3s;
}

.song-info:hover {
  opacity: 0.8;
}

.song-cover-small {
  flex: 0 0 50px;
  width: 50px;
  height: 50px;
  border-radius: 4px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.3s;
}

.song-cover-small:hover {
  transform: scale(1.05);
}

.song-cover-small.placeholder {
  font-size: 24px;
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.song-text {
  flex: 1;
  min-width: 0;
  cursor: pointer;
  overflow: hidden;
}

.song-name {
  font-weight: bold;
  font-size: 14px;
  overflow: hidden;
  width: 100%;
  position: relative;
}

.song-name-text {
  display: inline-block;
  white-space: nowrap;
}

/* 只有溢出时才显示渐变遮罩和滚动 */
.song-name.overflow {
  mask-image: linear-gradient(to right, black 90%, transparent 100%);
  -webkit-mask-image: linear-gradient(to right, black 90%, transparent 100%);
}

.song-name.overflow .song-name-text {
  padding-right: 30px;
}

.song-name.overflow:hover .song-name-text {
  animation: scroll-text 15s linear infinite;
}

@keyframes scroll-text {
  0%, 10% {
    transform: translateX(0);
  }
  90%, 100% {
    transform: translateX(calc(-100% + 170px));
  }
}

.song-artist {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  overflow: hidden;
  width: 100%;
  position: relative;
}

.song-artist-text {
  display: inline-block;
  white-space: nowrap;
}

.song-artist.overflow {
  mask-image: linear-gradient(to right, black 90%, transparent 100%);
  -webkit-mask-image: linear-gradient(to right, black 90%, transparent 100%);
}

.song-artist.overflow .song-artist-text {
  padding-right: 30px;
}

.song-artist.overflow:hover .song-artist-text {
  animation: scroll-text 15s linear infinite;
}

.player-controls {
  flex: 0 0 auto;
  display: flex;
  gap: 6px;
}

.control-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.3s;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.play-btn {
  background: rgba(102, 126, 234, 0.8);
  padding: 8px 16px;
}

.play-btn:hover {
  background: rgba(102, 126, 234, 1);
}

.mode-control-btn {
  background: rgba(102, 126, 234, 0.6);
  font-size: 18px;
}

.mode-control-btn:hover {
  background: rgba(102, 126, 234, 0.8);
  transform: scale(1.05);
}

.player-progress {
  flex: 1;
  min-width: 200px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.time {
  font-size: 12px;
  min-width: 40px;
}

.progress-bar {
  flex: 1;
  position: relative;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  cursor: pointer;
}

.progress {
  position: absolute;
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 2px;
  pointer-events: none;
}

.progress-input {
  position: absolute;
  width: 100%;
  height: 100%;
  cursor: pointer;
  opacity: 0;
  top: -6px;
  height: 16px;
}

.player-volume {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 120px;
  min-width: 120px;
}

.volume-input {
  flex: 1;
  cursor: pointer;
}

.player-extras {
  flex: 0 0 auto;
  display: flex;
  gap: 6px;
}

.extra-btn {
  background: rgba(102, 126, 234, 0.6);
  border: none;
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s;
}

.extra-btn:hover {
  background: rgba(102, 126, 234, 0.8);
  transform: scale(1.05);
  cursor: pointer;
}

.favorite-btn {
  font-size: 20px;
  transition: all 0.3s;
}

.favorite-btn.is-favorite {
  background: rgba(234, 102, 126, 0.8);
  animation: heartbeat 0.6s ease-in-out;
}

.favorite-btn:hover {
  transform: scale(1.15);
}

.add-playlist-btn {
  font-size: 18px;
  background: rgba(102, 234, 126, 0.6);
}

.add-playlist-btn:hover {
  background: rgba(102, 234, 126, 0.8);
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

.playlist-btn {
  font-size: 24px;
  font-weight: bold;
  line-height: 1;
}

.playlist-modal {
  position: fixed;
  left: 240px;
  right: 0;
  bottom: 80px;
  background: transparent;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  z-index: 1000;
  pointer-events: none;
}

.playlist-content {
  background: rgba(30, 30, 30, 0.98);
  backdrop-filter: blur(20px);
  border-radius: 12px 0 0 0;
  width: 420px;
  max-height: 500px;
  display: flex;
  flex-direction: column;
  color: white;
  box-shadow: 0 -4px 32px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: none;
  border-right: none;
  pointer-events: auto;
  outline: none;
}

.playlist-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.playlist-header h3 {
  margin: 0;
  font-size: 18px;
}

.header-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.clear-btn {
  background: rgba(102, 126, 234, 0.6);
  border: none;
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.clear-btn:hover {
  background: rgba(102, 126, 234, 0.9);
  transform: translateY(-1px);
}

.play-mode-selector {
  display: flex;
  align-items: center;
}

.mode-btn {
  background: rgba(102, 126, 234, 0.6);
  border: none;
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
}

.mode-btn:hover {
  background: rgba(102, 126, 234, 0.9);
  transform: scale(1.05);
}

.playlist-items {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.playlist-items::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.playlist-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 6px;
  cursor: move;
  transition: background 0.3s;
  position: relative;
}

.playlist-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.playlist-item.active {
  background: rgba(102, 126, 234, 0.3);
}

.song-index {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  min-width: 25px;
  text-align: center;
}

.song-cover-tiny {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.song-cover-tiny img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.song-cover-tiny span {
  font-size: 20px;
}

.song-info-item {
  flex: 1;
  min-width: 0;
}

.song-name-item {
  font-size: 14px;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist-item {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-actions {
  position: relative;
}

.more-btn {
  background: rgba(102, 126, 234, 0.5);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 20px;
  font-weight: bold;
  line-height: 1;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.more-btn:hover {
  background: rgba(102, 126, 234, 0.8);
  transform: scale(1.05);
}

.action-menu {
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 4px;
  background: rgba(20, 20, 20, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  padding: 4px;
  min-width: 120px;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.action-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 14px;
  border-radius: 4px;
  transition: background 0.2s;
  text-align: left;
}

.action-item:hover:not(:disabled) {
  background: rgba(102, 126, 234, 0.6);
}

.action-item:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.action-item span {
  font-size: 16px;
}

.empty-playlist {
  text-align: center;
  padding: 40px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
}
</style>

<style>
/* 全局样式：飞行心形动画 */
.flying-heart {
  position: fixed;
  font-size: 24px;
  pointer-events: none;
  z-index: 9999;
  transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: transform, opacity;
}
</style>

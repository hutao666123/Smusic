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
          <div class="song-name">{{ currentSong.name }}</div>
          <div class="song-artist">{{ currentSong.artist }}</div>
        </div>
      </div>
      <div v-else class="song-info">
        <div class="song-name">未选择歌曲</div>
      </div>
    </div>

    <div class="player-controls">
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
      <button @click="goToLyrics" class="extra-btn lyrics-btn" title="歌词">
        📝
      </button>
      <button @click="togglePlaylist" class="extra-btn playlist-btn" title="播放列表">
        ⋯
      </button>
    </div>

    <!-- 播放列表弹窗 -->
    <div v-if="showPlaylist" class="playlist-modal" @click.self="closePlaylist">
      <div class="playlist-content" ref="playlistContent" tabindex="-1" @blur="handleBlur">
        <div class="playlist-header">
          <h3>播放列表 ({{ playlist.length }})</h3>
          <button @click="clearPlaylist" class="clear-btn">清空</button>
        </div>
        <div class="playlist-items">
          <div
            v-for="(song, index) in playlist"
            :key="song.id"
            :class="['playlist-item', { active: index === currentIndex }]"
            @click="playSongAtIndex(index)"
          >
            <span class="song-index">{{ index + 1 }}</span>
            <div class="song-info-item">
              <div class="song-name-item">{{ song.name }}</div>
              <div class="song-artist-item">{{ song.artist }}</div>
            </div>
            <button @click.stop="removeSong(index)" class="remove-btn">×</button>
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
import { getSongDetail } from '../api/music'
import audioPlayer from '../services/audioPlayer'

const router = useRouter()
const playerStore = usePlayerStore()

const songCover = ref('')
const showPlaylist = ref(false)
const playlistContent = ref(null)

const currentSong = computed(() => playerStore.currentSong)
const isPlaying = computed(() => playerStore.isPlaying)
const currentTime = computed(() => playerStore.currentTime)
const duration = computed(() => playerStore.duration)
const volume = computed(() => playerStore.volume)
const playlist = computed(() => playerStore.playlist)
const currentIndex = computed(() => playerStore.currentIndex)

const progressPercent = computed(() => {
  return duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0
})

onMounted(() => {
  audioPlayer.setPlayerStore(playerStore)
  // 初始化音量
  audioPlayer.setVolume(playerStore.volume)
})

// 监听播放状态变化
watch(isPlaying, (newVal) => {
  if (newVal) {
    audioPlayer.play()
  } else {
    audioPlayer.pause()
  }
})

// 监听当前歌曲变化
watch(currentSong, async (newSong) => {
  if (newSong && newSong.id) {
    audioPlayer.playCurrentSong()
    
    // 获取歌曲详情以获取图片
    try {
      const res = await getSongDetail(newSong.id)
      if (res.data.songs && res.data.songs[0]) {
        const song = res.data.songs[0]
        if (song.al && song.al.picUrl) {
          songCover.value = song.al.picUrl
        }
      }
    } catch (error) {
      console.error('获取歌曲详情失败:', error)
    }
  }
})

const togglePlay = () => {
  audioPlayer.togglePlay()
}

const next = () => {
  playerStore.next()
  audioPlayer.playCurrentSong()
}

const prev = () => {
  playerStore.prev()
  audioPlayer.playCurrentSong()
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
  playerStore.currentIndex = index
  audioPlayer.playCurrentSong()
}

const removeSong = (index) => {
  if (playlist.value.length === 1) {
    playerStore.clearPlaylist()
    audioPlayer.stop()
  } else {
    playerStore.playlist.splice(index, 1)
    if (index < currentIndex.value) {
      playerStore.currentIndex--
    } else if (index === currentIndex.value) {
      audioPlayer.playCurrentSong()
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
</script>

<style scoped>
.player-bar {
  display: flex;
  align-items: center;
  gap: 20px;
  color: white;
  background: rgba(0, 0, 0, 0.7);
  padding: 15px 20px;
  border-radius: 8px;
}

.player-info {
  flex: 0 0 auto;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 12px;
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
}

.song-name {
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 14px;
}

.song-artist {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.player-controls {
  display: flex;
  gap: 10px;
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

.player-progress {
  flex: 1;
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
}

.volume-input {
  flex: 1;
  cursor: pointer;
}

.player-extras {
  display: flex;
  gap: 8px;
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
  border-radius: 12px 12px 0 0;
  width: 420px;
  max-height: 500px;
  display: flex;
  flex-direction: column;
  color: white;
  margin-right: 20px;
  box-shadow: 0 -4px 32px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: none;
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
  cursor: pointer;
  transition: background 0.3s;
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
  min-width: 30px;
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

.remove-btn {
  background: rgba(102, 126, 234, 0.5);
  border: none;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-btn:hover {
  background: rgba(255, 59, 48, 0.8);
  transform: scale(1.1);
}

.empty-playlist {
  text-align: center;
  padding: 40px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
}
</style>

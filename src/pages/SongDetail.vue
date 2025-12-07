<template>
  <div class="song-detail">
    <!-- 动态背景 -->
    <div class="animated-bg">
      <div class="bg-gradient"></div>
      <div class="bg-particles">
        <div v-for="i in 20" :key="i" class="particle" :style="getParticleStyle(i)"></div>
      </div>
    </div>

    <!-- 返回按钮 -->
    <button class="back-btn" @click="goBack">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <div class="detail-container">
      <!-- 左侧：专辑封面区域 -->
      <div class="detail-left">
        <!-- 旋转唱片效果 -->
        <div class="vinyl-container">
          <div class="vinyl-disc" :class="{ spinning: isPlaying }">
            <div class="vinyl-grooves"></div>
            <div class="album-cover-wrapper">
              <img
                v-if="albumCover"
                :src="albumCover"
                :alt="currentSong.name"
                class="cover-image"
              />
              <div v-else class="cover-placeholder">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- 歌曲信息 -->
        <div class="song-info">
          <h2 class="song-title">{{ currentSong.name }}</h2>
          <p class="song-artist">{{ currentSong.artist }}</p>
        </div>
      </div>

      <!-- 右侧：歌词面板 -->
      <div class="detail-right">
        <div class="lyrics-scroll-container" ref="lyricsContainer">
          <div v-if="lyricsLoading" class="loading">
            <div class="loading-spinner"></div>
            <p>加载中...</p>
          </div>

          <div v-else-if="!lyrics" class="no-lyrics">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" opacity="0.3">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
            <p>暂无歌词</p>
          </div>

          <div v-else class="lyrics-list">
            <div class="lyrics-spacer"></div>
            <div
              v-for="(line, index) in lyricsWithTime"
              :key="index"
              class="lyric-line"
              :class="{ 
                active: index === currentLineIndex,
                passed: index < currentLineIndex,
                upcoming: index > currentLineIndex
              }"
              @click="seekToTime(line.time)"
            >
              <span class="lyric-text">{{ line.text }}</span>
            </div>
            <div class="lyrics-spacer"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePlayerStore } from '../stores/player'
import { getSongDetail, getLyric } from '../api/music'
import audioPlayer from '../services/audioPlayer'

const router = useRouter()
const route = useRoute()
const playerStore = usePlayerStore()

const currentSong = computed(() => playerStore.currentSong)
const currentTime = computed(() => playerStore.currentTime)
const duration = computed(() => playerStore.duration)
const isPlaying = computed(() => playerStore.isPlaying)

const albumCover = ref('')
const lyrics = ref('')
const lyricsLoading = ref(false)
const currentLineIndex = ref(0)
const lyricsWithTime = ref([])
const lyricsContainer = ref(null)

// 用户滚动控制
const isUserScrolling = ref(false)
let scrollTimer = null

// 粒子动画样式
const getParticleStyle = () => {
  const size = Math.random() * 4 + 2
  const duration = Math.random() * 20 + 10
  const delay = Math.random() * 5
  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`
  }
}

onMounted(async () => {
  const songId = route.params.id
  
  if (songId) {
    await loadSongDetails(songId)
    // 加载完成后，初始居中当前歌词
    await nextTick()
    scrollToCurrentLyric()
  }

  // 监听用户滚动
  if (lyricsContainer.value) {
    lyricsContainer.value.addEventListener('scroll', handleUserScroll, { passive: true })
  }
})

onUnmounted(() => {
  // 清理滚动监听和定时器
  if (lyricsContainer.value) {
    lyricsContainer.value.removeEventListener('scroll', handleUserScroll)
  }
  if (scrollTimer) {
    clearTimeout(scrollTimer)
  }
})

// 滚动到当前歌词
const scrollToCurrentLyric = () => {
  if (lyricsContainer.value) {
    isScrollingByUser = true
    const activeElement = lyricsContainer.value.querySelector('.lyric-line.active')
    if (activeElement) {
      activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    setTimeout(() => {
      isScrollingByUser = false
    }, 1000)
  }
}

// 处理用户滚动
let isScrollingByUser = false
const handleUserScroll = () => {
  // 只有在非程序触发的滚动时才标记为用户滚动
  if (!isScrollingByUser) {
    isUserScrolling.value = true

    // 清除之前的定时器
    if (scrollTimer) {
      clearTimeout(scrollTimer)
    }

    // 5秒后恢复自动滚动
    scrollTimer = setTimeout(() => {
      isUserScrolling.value = false
    }, 5000)
  }
}

// 监听当前播放歌曲变化
watch(currentSong, async (newSong) => {
  if (newSong && newSong.id) {
    // 如果当前页面显示的歌曲与正在播放的歌曲不一致，更新页面
    const currentPageSongId = parseInt(route.params.id)
    if (newSong.id !== currentPageSongId) {
      // 更新路由到新歌曲
      router.replace(`/song/${newSong.id}`)
    }
    await loadSongDetails(newSong.id)
  }
})

// 监听路由参数变化
watch(() => route.params.id, async (newId) => {
  if (newId) {
    await loadSongDetails(newId)
    // 切换歌曲后，重置滚动状态并居中
    isUserScrolling.value = false
    if (scrollTimer) {
      clearTimeout(scrollTimer)
    }
    await nextTick()
    scrollToCurrentLyric()
  }
})

const loadSongDetails = async (songId) => {
  try {
    // 获取歌曲详情（包括专辑封面）
    const detailRes = await getSongDetail(songId)
    if (detailRes.data.songs && detailRes.data.songs[0]) {
      const song = detailRes.data.songs[0]
      if (song.al && song.al.picUrl) {
        albumCover.value = song.al.picUrl
      }
    }

    // 获取歌词
    lyricsLoading.value = true
    const lyricRes = await getLyric(songId)
    if (lyricRes.data.lrc && lyricRes.data.lrc.lyric) {
      lyrics.value = lyricRes.data.lrc.lyric
      parseLyricsWithTime()
    }
  } catch (error) {
    console.error('加载歌曲详情失败:', error)
  } finally {
    lyricsLoading.value = false
  }
}

const parseLyricsWithTime = () => {
  if (!lyrics.value) return

  const lines = []
  const lyricsArray = lyrics.value.split('\n')

  for (const line of lyricsArray) {
    const timeMatch = line.match(/\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/)
    if (timeMatch) {
      const minutes = parseInt(timeMatch[1])
      const seconds = parseInt(timeMatch[2])
      const milliseconds = timeMatch[3] ? parseInt(timeMatch[3].padEnd(3, '0')) : 0
      const time = minutes * 60 + seconds + milliseconds / 1000
      const text = line.replace(/\[\d{2}:\d{2}(?:\.\d{2,3})?\]/g, '').trim()
      if (text) {
        lines.push({ time, text })
      }
    }
  }

  lyricsWithTime.value = lines
}

// 监听播放进度，更新当前行
watch(currentTime, (newTime) => {
  if (lyricsWithTime.value.length === 0) return

  let currentIndex = 0
  for (let i = 0; i < lyricsWithTime.value.length; i++) {
    if (lyricsWithTime.value[i].time <= newTime) {
      currentIndex = i
    } else {
      break
    }
  }

  currentLineIndex.value = currentIndex

  // 只有在用户没有滚动时才自动滚动到当前行
  if (!isUserScrolling.value && lyricsContainer.value) {
    isScrollingByUser = true
    const activeElement = lyricsContainer.value.querySelector('.lyric-line.active')
    if (activeElement) {
      activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    // 增加延迟时间，确保滚动动画完成
    setTimeout(() => {
      isScrollingByUser = false
    }, 1000)
  }
})

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const seekToTime = (time) => {
  playerStore.setCurrentTime(time)
  audioPlayer.setCurrentTime(time)
  // 点击歌词后立即恢复自动滚动，并标记为程序滚动
  isUserScrolling.value = false
  if (scrollTimer) {
    clearTimeout(scrollTimer)
  }
  isScrollingByUser = true
  setTimeout(() => {
    isScrollingByUser = false
  }, 1000)
}

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.song-detail {
  position: fixed;
  top: 0;
  left: 240px;
  right: 0;
  bottom: 80px;
  color: white;
  z-index: 100;
  overflow: hidden;
}

/* 动态背景 */
.animated-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.bg-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
  animation: gradientShift 15s ease infinite;
}

@keyframes gradientShift {
  0%, 100% { filter: hue-rotate(0deg); }
  50% { filter: hue-rotate(30deg); }
}

.bg-particles {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.particle {
  position: absolute;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  animation: float linear infinite;
  pointer-events: none;
}

@keyframes float {
  0% {
    transform: translateY(100vh) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100px) rotate(360deg);
    opacity: 0;
  }
}

/* 返回按钮 */
.back-btn {
  position: absolute;
  top: 24px;
  left: 24px;
  background: transparent;
  border: none;
  color: white;
  width: 48px;
  height: 48px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10;
}

.back-btn:hover {
  transform: translateX(-4px);
  opacity: 0.8;
}

.detail-container {
  position: relative;
  display: flex;
  height: 100%;
  padding: 60px;
  gap: 80px;
  overflow: hidden;
  z-index: 1;
  align-items: center;
}

/* 左侧区域 */
.detail-left {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
}

/* 黑胶唱片效果 */
.vinyl-container {
  position: relative;
  width: 360px;
  height: 360px;
  perspective: 1000px;
}

.vinyl-disc {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle at center, #1a1a1a 0%, #000 70%);
  box-shadow: 
    0 0 0 8px rgba(0, 0, 0, 0.8),
    0 20px 60px rgba(0, 0, 0, 0.6),
    inset 0 0 20px rgba(0, 0, 0, 0.5);
  transition: transform 0.5s ease;
}

.vinyl-disc.spinning {
  animation: spin 8s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.vinyl-grooves {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: repeating-radial-gradient(
    circle at center,
    transparent 0px,
    transparent 2px,
    rgba(255, 255, 255, 0.03) 2px,
    rgba(255, 255, 255, 0.03) 4px
  );
}

.album-cover-wrapper {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60%;
  height: 60%;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.8);
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.cover-image {
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
  color: rgba(255, 255, 255, 0.6);
}

/* 歌曲信息 */
.song-info {
  text-align: center;
}

.song-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 12px 0;
  background: linear-gradient(135deg, #fff, #f093fb);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.song-artist {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

/* 右侧歌词面板 */
.detail-right {
  flex: 1;
  display: flex;
  min-width: 0;
  height: 100%;
}

.lyrics-scroll-container {
  flex: 1;
  overflow-y: auto;
  padding: 40px 60px;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.lyrics-scroll-container::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 16px;
  color: rgba(255, 255, 255, 0.5);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.no-lyrics {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 16px;
  color: rgba(255, 255, 255, 0.4);
}

.lyrics-list {
  display: flex;
  flex-direction: column;
}

.lyrics-spacer {
  height: 40vh;
}

.lyric-line {
  padding: 16px 20px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px;
  margin: 4px 0;
}

.lyric-text {
  font-size: 18px;
  line-height: 1.8;
  display: block;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.lyric-line.passed .lyric-text {
  color: rgba(255, 255, 255, 0.3);
  font-size: 16px;
}

.lyric-line.upcoming .lyric-text {
  color: rgba(255, 255, 255, 0.5);
  font-size: 16px;
}

.lyric-line.active {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  transform: scale(1.02);
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
}

.lyric-line.active .lyric-text {
  color: #fff;
  font-size: 24px;
  font-weight: 600;
  background: linear-gradient(135deg, #fff, #f093fb);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.lyric-line:hover:not(.active) {
  background: rgba(255, 255, 255, 0.05);
}


</style>

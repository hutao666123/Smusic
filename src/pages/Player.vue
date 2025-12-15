<template>
  <!--  全屏/专注界面-->
  <div class="player-page" @click="goBack">
    <!-- 动态背景 -->
    <div class="animated-bg">
      <div class="bg-gradient" :style="bgGradientStyle"></div>
      <component 
        v-if="currentEffectComponent" 
        :is="currentEffectComponent" 
        :config="visualTheme.effectConfig"
      />
    </div>

    <div class="player-container">
      <div class="album-section">
        <div class="album-art" :style="albumGlowStyle">
          <img v-if="currentSong?.cover" :src="currentSong.cover" :alt="currentSong?.name" class="album-img" />
          <div v-else class="album-placeholder">🎵</div>
        </div>
      </div>

      <div class="info-section">
        <h1 class="song-name" :style="titleStyle">{{ currentSong?.name }}</h1>
        <p class="song-artist" :style="artistStyle">{{ currentSong?.artist }}</p>
      </div>

      <div class="lyrics-section" @click.stop>
        <div class="lyrics-container" ref="lyricsContainer" @scroll="handleUserScroll">
          <div class="lyrics-spacer"></div>
          <div
            v-for="(lyric, index) in currentLyrics"
            :key="index"
            :class="['lyric-line', { active: index === currentLyricIndex }]"
            :style="{ color: index === currentLyricIndex ? (visualTheme?.lyricColors.active || '#fff') : (visualTheme?.lyricColors.upcoming || 'rgba(255,255,255,0.5)') }"
            :ref="el => { if (index === currentLyricIndex) activeLyricEl = el }"
            @click="seekToTime(lyric.time)"
          >
            {{ lyric.text }}
          </div>
          <div v-if="currentLyrics.length === 0" class="no-lyrics">
            暂无歌词
          </div>
          <div class="lyrics-spacer"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '../stores/player'
import { useThemeStore } from '../stores/theme'
import { loadLyric } from '../utils/lyricLoader'
import audioPlayer from '../services/audioPlayer'
import ParticleEffect from '../components/visual-effects/ParticleEffect.vue'
import RippleEffect from '../components/visual-effects/RippleEffect.vue'
import AuroraEffect from '../components/visual-effects/AuroraEffect.vue'
import GlowEffect from '../components/visual-effects/GlowEffect.vue'
import CyberEffect from '../components/visual-effects/CyberEffect.vue'
import SakuraEffect from '../components/visual-effects/SakuraEffect.vue'
import MistEffect from '../components/visual-effects/MistEffect.vue'

const router = useRouter()
const playerStore = usePlayerStore()
const themeStore = useThemeStore()

const currentSong = computed(() => playerStore.currentSong)
const currentTime = computed(() => playerStore.currentTime)
const currentLyrics = ref([])
const currentLyricIndex = ref(0)
const lyricsContainer = ref(null)
const activeLyricEl = ref(null)

// 用户滚动控制
const isUserScrolling = ref(false)
let scrollTimer = null
let isScrollingByUser = false

// 当前视觉主题(与播放页面共享)
const visualTheme = computed(() => themeStore.currentVisualTheme)

// 背景渐变样式
const bgGradientStyle = computed(() => {
  if (!visualTheme.value) return {}
  const colors = visualTheme.value.bgColors
  return {
    background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]}, ${colors[2]})`
  }
})

// 歌名样式
const titleStyle = computed(() => {
  if (!visualTheme.value) return {}
  return {
    color: visualTheme.value.textColors.songTitle
  }
})

// 歌手名样式
const artistStyle = computed(() => {
  if (!visualTheme.value) return {}
  return {
    color: visualTheme.value.textColors.songArtist
  }
})

// 封面光晕样式
const albumGlowStyle = computed(() => {
  if (!visualTheme.value) return {}
  return {
    boxShadow: `0 20px 60px rgba(0, 0, 0, 0.8), 0 0 60px ${visualTheme.value.vinylGlow}`
  }
})

// 效果组件映射
const effectComponents = {
  particles: ParticleEffect,
  ripple: RippleEffect,
  aurora: AuroraEffect,
  glow: GlowEffect,
  cyber: CyberEffect,
  sakura: SakuraEffect,
  mist: MistEffect,
  none: null
}

const currentEffectComponent = computed(() => {
  if (!visualTheme.value) return null
  return effectComponents[visualTheme.value.effectType]
})

// 加载歌词
const loadLyrics = async (songId) => {
  if (!songId) return
  try {
    const lyricContent = await loadLyric(songId)
    if (lyricContent) {
      currentLyrics.value = parseLyric(lyricContent)
    } else {
      currentLyrics.value = []
    }
  } catch (error) {
    console.error('加载歌词失败:', error)
    currentLyrics.value = []
  }
}

// 解析歌词
const parseLyric = (lyricText) => {
  if (!lyricText) return []
  const lines = lyricText.split('\n')
  const result = []
  
  for (const line of lines) {
    const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/)
    if (match) {
      const minutes = parseInt(match[1])
      const seconds = parseInt(match[2])
      const milliseconds = parseInt(match[3].padEnd(3, '0'))
      const time = minutes * 60 + seconds + milliseconds / 1000
      const text = match[4].trim()
      
      if (text) {
        result.push({ time, text })
      }
    }
  }
  
  return result.sort((a, b) => a.time - b.time)
}

// 处理用户滚动
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

// 点击歌词跳转到指定时间
const seekToTime = (time) => {
  playerStore.setCurrentTime(time)
  audioPlayer.setCurrentTime(time)
  // 点击歌词后，标记为用户操作，5秒后才恢复自动滚动
  isUserScrolling.value = true
  if (scrollTimer) {
    clearTimeout(scrollTimer)
  }
  scrollTimer = setTimeout(() => {
    isUserScrolling.value = false
  }, 5000)
  isScrollingByUser = true
  setTimeout(() => {
    isScrollingByUser = false
  }, 1000)
}

// 监听当前歌曲变化
watch(currentSong, (newSong) => {
  if (newSong?.id) {
    loadLyrics(newSong.id)
    // 重置滚动状态
    isUserScrolling.value = false
    if (scrollTimer) {
      clearTimeout(scrollTimer)
    }
  }
}, { immediate: true })

// 监听播放时间，更新当前歌词
watch(currentTime, (time) => {
  if (currentLyrics.value.length === 0) return

  let index = 0
  for (let i = currentLyrics.value.length - 1; i >= 0; i--) {
    if (time >= currentLyrics.value[i].time) {
      index = i
      break
    }
  }
  currentLyricIndex.value = index
  
  // 只有在用户没有滚动时才自动滚动到当前行
  if (!isUserScrolling.value && lyricsContainer.value) {
    isScrollingByUser = true
    const activeElement = lyricsContainer.value.querySelector('.lyric-line.active')
    if (activeElement) {
      const container = lyricsContainer.value
      const containerHeight = container.clientHeight
      const scrollTop = activeElement.offsetTop - containerHeight * 0.38 + activeElement.clientHeight / 2
      container.scrollTo({
        top: scrollTop,
        behavior: 'smooth'
      })
    }
    // 增加延迟时间，确保滚动动画完成
    setTimeout(() => {
      isScrollingByUser = false
    }, 1000)
  }
})

// 点击返回
const goBack = () => {
  router.back()
}

// 清理定时器
onUnmounted(() => {
  if (scrollTimer) {
    clearTimeout(scrollTimer)
  }
})
</script>

<style scoped>
.player-page {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  z-index: 9999;
  color: white;
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
  animation: gradientShift 15s ease infinite;
}

@keyframes gradientShift {
  0%, 100% { filter: hue-rotate(0deg); }
  50% { filter: hue-rotate(30deg); }
}

.player-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  height: 100%;
  padding: 0;
  text-align: center;
  z-index: 1;
}

.album-section {
  flex: 0 0 20%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 20px;
}

.album-art {
  width: 200px;
  height: 200px;
  border-radius: 20px;
  overflow: hidden;
  animation: albumFloat 6s ease-in-out infinite;
  transition: box-shadow 0.5s ease;
}

@keyframes albumFloat {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.album-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.album-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 80px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.info-section {
  flex: 0 0 auto;
  animation: slideUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both;
  padding: 10px 20px;
}

.song-name {
  font-size: 36px;
  font-weight: bold;
  margin: 0;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.8);
  letter-spacing: 2px;
  transition: color 0.5s ease;
}

.song-artist {
  font-size: 18px;
  margin: 8px 0 0 0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.8);
  transition: color 0.5s ease;
}

.lyrics-section {
  flex: 0 0 80%;
  width: 100%;
  overflow: hidden;
  animation: slideUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both;
  padding: 0 20px 20px 20px;
}

.lyrics-container {
  height: 100%;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.lyrics-container::-webkit-scrollbar {
  display: none;
}

.lyrics-spacer {
  height: 38%;
  flex-shrink: 0;
}

.lyrics-spacer:last-child {
  height: 62%;
}

.lyric-line {
  font-size: 22px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 14px 0;
  flex-shrink: 0;
}

.lyric-line.active {
  font-size: 36px;
  font-weight: bold;
  transform: scale(1.08);
  text-shadow: 0 0 30px currentColor;
  backdrop-filter: blur(10px);
  background: transparent !important;
  background-color: transparent !important;
}

.no-lyrics {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: rgba(255, 255, 255, 0.3);
  font-size: 16px;
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>

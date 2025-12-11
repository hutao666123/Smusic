<template>
  <div class="player-page" @click="goBack">
    <div class="player-container">
      <div class="album-section">
        <div class="album-art">
          <img v-if="currentSong?.cover" :src="currentSong.cover" :alt="currentSong?.name" class="album-img" />
          <div v-else class="album-placeholder">🎵</div>
        </div>
      </div>

      <div class="info-section">
        <h1 class="song-name">{{ currentSong?.name }}</h1>
        <p class="song-artist">{{ currentSong?.artist }}</p>
      </div>

      <div class="lyrics-section" @click.stop>
        <div class="lyrics-container" ref="lyricsContainer">
          <div class="lyrics-spacer"></div>
          <div
            v-for="(lyric, index) in currentLyrics"
            :key="index"
            :class="['lyric-line', { active: index === currentLyricIndex }]"
            :ref="el => { if (index === currentLyricIndex) activeLyricEl = el }"
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
import { computed, ref, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '../stores/player'
import { getLyric } from '../api/music'

const router = useRouter()
const playerStore = usePlayerStore()

const currentSong = computed(() => playerStore.currentSong)
const currentTime = computed(() => playerStore.currentTime)
const currentLyrics = ref([])
const currentLyricIndex = ref(0)
const lyricsContainer = ref(null)
const activeLyricEl = ref(null)

// 加载歌词
const loadLyrics = async (songId) => {
  if (!songId) return
  try {
    const res = await getLyric(songId)
    if (res.data.lrc && res.data.lrc.lyric) {
      currentLyrics.value = parseLyric(res.data.lrc.lyric)
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

// 监听当前歌曲变化
watch(currentSong, (newSong) => {
  if (newSong?.id) {
    loadLyrics(newSong.id)
  }
}, { immediate: true })

// 监听播放时间，更新当前歌词并居中滚动
watch(currentTime, async (time) => {
  let index = 0
  for (let i = currentLyrics.value.length - 1; i >= 0; i--) {
    if (time >= currentLyrics.value[i].time) {
      index = i
      break
    }
  }
  currentLyricIndex.value = index
  
  // 歌词居中滚动
  await nextTick()
  if (activeLyricEl.value && lyricsContainer.value) {
    const container = lyricsContainer.value
    const activeEl = activeLyricEl.value
    const containerHeight = container.clientHeight
    const scrollTop = activeEl.offsetTop - containerHeight * 0.38 + activeEl.clientHeight / 2
    container.scrollTo({
      top: scrollTop,
      behavior: 'smooth'
    })
  }
})

// 点击返回
const goBack = () => {
  router.back()
}
</script>

<style scoped>
.player-page {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  z-index: 9999;
}

.player-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  height: 100%;
  padding: 0;
  text-align: center;
  color: white;
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
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8), 0 0 60px rgba(102, 126, 234, 0.4);
  animation: albumRotate 20s linear infinite;
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
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.info-section {
  flex: 0 0 auto;
  animation: slideUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both;
  padding: 10px 20px;
}

.song-name {
  font-size: 32px;
  font-weight: bold;
  margin: 0;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  letter-spacing: 1px;
}

.song-artist {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  margin: 6px 0 0 0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
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
  font-size: 24px;
  color: rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;
  padding: 12px;
  border-radius: 4px;
  flex-shrink: 0;
}

.lyric-line.active {
  font-size: 32px;
  color: #667eea;
  font-weight: bold;
  background: rgba(102, 126, 234, 0.2);
  transform: scale(1.05);
  text-shadow: 0 0 20px rgba(102, 126, 234, 0.6);
}

.no-lyrics {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: rgba(255, 255, 255, 0.3);
  font-size: 16px;
}

@keyframes albumRotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
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

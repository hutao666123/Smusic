<template>
  <!-- 单纯歌词界面-->
  <div class="lyrics-page">
    <div class="lyrics-container">
      <div v-if="loading" class="loading">加载歌词中...</div>

      <div v-else-if="!lyrics" class="no-lyrics">
        <p>暂无歌词</p>
      </div>

      <div v-else class="lyrics-text">
        <div
          v-for="(line, index) in lyricsLines"
          :key="index"
          class="lyric-line"
          :class="{ active: index === currentLineIndex }"
        >
          {{ line }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { usePlayerStore } from '../stores/player'
import { loadLyric } from '../utils/lyricLoader'

const playerStore = usePlayerStore()

const loading = ref(false)
const lyrics = ref('')
const currentLineIndex = ref(0)

const currentSong = computed(() => playerStore.currentSong)
const currentTime = computed(() => playerStore.currentTime)

const lyricsLines = computed(() => {
  if (!lyrics.value) return []
  return lyrics.value
    .split('\n')
    .map(line => {
      return line.replace(/\[\d{2}:\d{2}(?:\.\d{2,3})?\]/g, '').trim()
    })
    .filter(line => line.length > 0)
})

const parseLyricsWithTime = () => {
  if (!lyrics.value) return []
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
  
  return lines
}

const loadLyrics = async (songId) => {
  if (!songId) return

  loading.value = true
  try {
    const lyricContent = await loadLyric(songId)
    if (lyricContent) {
      lyrics.value = lyricContent
      currentLineIndex.value = 0
    } else {
      lyrics.value = ''
    }
  } catch (error) {
    console.error('加载歌词失败:', error)
    lyrics.value = ''
  } finally {
    loading.value = false
  }
}

const updateCurrentLine = (time) => {
  const lyricsWithTime = parseLyricsWithTime()
  if (lyricsWithTime.length === 0) return
  
  let currentIndex = 0
  for (let i = 0; i < lyricsWithTime.length; i++) {
    if (lyricsWithTime[i].time <= time) {
      currentIndex = i
    } else {
      break
    }
  }
  
  currentLineIndex.value = currentIndex
}

onMounted(() => {
  if (currentSong.value && currentSong.value.id) {
    loadLyrics(currentSong.value.id)
  }

  watch(currentSong, (newSong) => {
    if (newSong && newSong.id) {
      loadLyrics(newSong.id)
    }
  })

  watch(currentTime, (newTime) => {
    if (lyrics.value) {
      updateCurrentLine(newTime)
    }
  })
})
</script>

<style scoped>
.lyrics-page {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: var(--page-bg);
}

.lyrics-container {
  width: 100%;
  max-width: 800px;
  height: 100%;
  overflow-y: auto;
  padding: 20px;
}

.loading,
.no-lyrics {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 18px;
  color: var(--text-secondary);
}

.lyrics-text {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px 0;
}

.lyric-line {
  padding: 12px 20px;
  border-radius: 8px;
  color: var(--text-secondary);
  transition: all 0.3s;
  font-size: 16px;
  line-height: 1.8;
  text-align: center;
}

.lyric-line.active {
  background: var(--button-hover-bg);
  color: var(--text-primary);
  font-weight: 500;
  font-size: 20px;
  transform: scale(1.05);
}

.lyrics-container::-webkit-scrollbar {
  width: 8px;
}

.lyrics-container::-webkit-scrollbar-track {
  background: transparent;
}

.lyrics-container::-webkit-scrollbar-thumb {
  background: var(--button-bg);
  border-radius: 4px;
}

.lyrics-container::-webkit-scrollbar-thumb:hover {
  background: var(--button-hover-bg);
}
</style>

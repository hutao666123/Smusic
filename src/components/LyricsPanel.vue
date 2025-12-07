<template>
  <div class="lyrics-panel" v-if="isVisible">
    <div class="lyrics-header">
      <h3>歌词</h3>
      <button class="close-btn" @click="closeLyrics">✕</button>
    </div>

    <div class="lyrics-content">
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
import { getLyric } from '../api/music'

const playerStore = usePlayerStore()

const isVisible = ref(false)
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
      // 移除时间戳，只保留歌词文本
      // 时间戳格式: [mm:ss.xx] 或 [mm:ss]
      return line.replace(/\[\d{2}:\d{2}(?:\.\d{2,3})?\]/g, '').trim()
    })
    .filter(line => line.length > 0)
})

// 解析歌词时间戳
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

onMounted(() => {
  // 监听当前歌曲变化
  watch(currentSong, (newSong) => {
    if (newSong && newSong.id && isVisible.value) {
      loadLyrics(newSong.id)
    }
  })

  // 监听播放进度，更新当前行
  watch(currentTime, (newTime) => {
    if (lyrics.value) {
      updateCurrentLine(newTime)
    }
  })
})

const loadLyrics = async (songId) => {
  if (!songId) return

  loading.value = true
  try {
    const res = await getLyric(songId)
    if (res.data.lrc && res.data.lrc.lyric) {
      lyrics.value = res.data.lrc.lyric
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
  // 根据时间戳更新当前行
  const lyricsWithTime = parseLyricsWithTime()
  if (lyricsWithTime.length === 0) return
  
  // 找到当前时间对应的歌词行
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

const showLyrics = () => {
  isVisible.value = true
  if (currentSong.value && currentSong.value.id) {
    loadLyrics(currentSong.value.id)
  }
}

const closeLyrics = () => {
  isVisible.value = false
}

// 暴露给父组件
defineExpose({
  showLyrics,
  closeLyrics,
  isVisible
})
</script>

<style scoped>
.lyrics-panel {
  position: absolute;
  right: 0;
  top: 0;
  width: 400px;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  flex-direction: column;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.3);
  z-index: 100;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.lyrics-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(0, 0, 0, 0.2);
}

.lyrics-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.lyrics-content {
  flex: 1;
  overflow-y: auto;
  padding: 30px 20px;
}

.loading,
.no-lyrics {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
}

.lyrics-text {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.lyric-line {
  padding: 8px 12px;
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.6);
  transition: all 0.3s;
  font-size: 14px;
  line-height: 1.6;
}

.lyric-line.active {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-weight: 500;
  transform: scale(1.05);
}

/* 滚动条样式 */
.lyrics-content::-webkit-scrollbar {
  width: 6px;
}

.lyrics-content::-webkit-scrollbar-track {
  background: transparent;
}

.lyrics-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.lyrics-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>

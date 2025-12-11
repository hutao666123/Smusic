<template>
  <div class="now-playing-container" v-if="currentSong">
    <div class="now-playing-left">
      <div class="album-cover">
        <img
          v-if="albumCover"
          :src="albumCover"
          :alt="currentSong.name"
          class="cover-image"
        />
        <div v-else class="cover-placeholder">
          <span>🎵</span>
        </div>
      </div>
    </div>

    <div class="now-playing-right">
      <div class="song-header">
        <h2 class="song-title">{{ currentSong.name }}</h2>
        <p class="song-artist">{{ currentSong.artist }}</p>
      </div>

      <div class="song-meta">
        <div class="meta-item">
          <span class="meta-label">歌词作者:</span>
          <span class="meta-value">{{ currentSong.artist }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">作曲:</span>
          <span class="meta-value">{{ currentSong.artist }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">制作人:</span>
          <span class="meta-value">-</span>
        </div>
      </div>

      <div class="action-buttons">
        <button class="action-btn like-btn" @click="toggleLike" :class="{ liked: isLiked }">
          {{ isLiked ? '❤️' : '🤍' }}
        </button>
        <button class="action-btn share-btn" @click="shareSong">
          📤
        </button>
        <button class="action-btn download-btn" @click="downloadSong">
          📥
        </button>
      </div>

      <div class="lyrics-preview">
        <h3>歌词</h3>
        <div class="lyrics-content">
          <div v-if="lyricsLoading" class="loading">加载歌词中...</div>
          <div v-else-if="!lyrics" class="no-lyrics">暂无歌词</div>
          <div v-else class="lyrics-text">
            <div
              v-for="(line, index) in previewLyrics"
              :key="index"
              class="lyric-line"
            >
              {{ line }}
            </div>
            <div v-if="hasMoreLyrics" class="more-lyrics">
              <button @click="$emit('show-all-lyrics')" class="show-more-btn">
                查看全部歌词 →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="no-song">
    <div class="empty-state">
      <span class="empty-icon">🎵</span>
      <p>未选择歌曲</p>
      <p class="hint">选择一首歌曲开始播放</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { usePlayerStore } from '../stores/player'
import { getLyric } from '../api/music'

const playerStore = usePlayerStore()

const currentSong = computed(() => playerStore.currentSong)
const albumCover = ref('')
const isLiked = ref(false)
const lyrics = ref('')
const lyricsLoading = ref(false)

const previewLyrics = computed(() => {
  if (!lyrics.value) return []
  return lyrics.value
    .split('\n')
    .map(line => line.replace(/\[\d{2}:\d{2}(?:\.\d{2,3})?\]/g, '').trim())
    .filter(line => line.length > 0)
    .slice(0, 5) // 只显示前 5 行
})

const hasMoreLyrics = computed(() => {
  if (!lyrics.value) return false
  const allLines = lyrics.value
    .split('\n')
    .map(line => line.replace(/\[\d{2}:\d{2}(?:\.\d{2,3})?\]/g, '').trim())
    .filter(line => line.length > 0)
  return allLines.length > 5
})

watch(currentSong, async (newSong) => {
  if (newSong && newSong.id) {
    // 加载歌词
    lyricsLoading.value = true
    try {
      const res = await getLyric(newSong.id)
      if (res.data.lrc && res.data.lrc.lyric) {
        lyrics.value = res.data.lrc.lyric
      } else {
        lyrics.value = ''
      }
    } catch (error) {
      console.error('加载歌词失败:', error)
      lyrics.value = ''
    } finally {
      lyricsLoading.value = false
    }

    // 获取专辑封面（如果有的话）
    albumCover.value = ''
  }
})

const toggleLike = () => {
  isLiked.value = !isLiked.value
  // TODO: 调用 API 添加/移除喜欢
}

const shareSong = () => {
  // TODO: 实现分享功能
  console.log('分享歌曲:', currentSong.value.name)
}

const downloadSong = () => {
  // TODO: 实现下载功能
  console.log('下载歌曲:', currentSong.value.name)
}
</script>

<style scoped>
.now-playing-container {
  display: flex;
  gap: 40px;
  padding: 30px 0;
  color: var(--text-primary);
}

.now-playing-left {
  flex: 0 0 auto;
}

.album-cover {
  width: 280px;
  height: 280px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  background: rgba(0, 0, 0, 0.2);
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
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%);
  font-size: 80px;
}

.now-playing-right {
  flex: 1;
  min-width: 0;
}

.song-header {
  margin-bottom: 24px;
}

.song-title {
  font-size: 32px;
  font-weight: 600;
  margin: 0 0 8px 0;
  word-break: break-word;
}

.song-artist {
  font-size: 16px;
  color: var(--text-secondary);
  margin: 0;
}

.song-meta {
  margin-bottom: 24px;
  padding: 16px 0;
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
}

.meta-item {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 14px;
}

.meta-item:last-child {
  margin-bottom: 0;
}

.meta-label {
  color: var(--text-secondary);
  min-width: 80px;
}

.meta-value {
  color: var(--text-primary);
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.action-btn {
  background: var(--button-bg);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background: var(--button-hover-bg);
  border-color: var(--border-color);
}

.like-btn.liked {
  background: rgba(255, 0, 0, 0.3);
  border-color: rgba(255, 0, 0, 0.5);
}

.lyrics-preview {
  background: var(--card-bg);
  border-radius: 8px;
  padding: 16px;
}

.lyrics-preview h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
}

.lyrics-content {
  max-height: 300px;
  overflow-y: auto;
}

.loading,
.no-lyrics {
  text-align: center;
  padding: 20px;
  color: var(--text-secondary);
  font-size: 14px;
}

.lyrics-text {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.lyric-line {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-secondary);
  padding: 4px 0;
}

.more-lyrics {
  margin-top: 12px;
  text-align: center;
}

.show-more-btn {
  background: var(--primary-color);
  border: 1px solid var(--primary-color);
  color: var(--text-primary);
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s;
}

.show-more-btn:hover {
  background: var(--primary-hover-color);
  border-color: var(--primary-hover-color);
}

.no-song {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-primary);
}

.empty-state {
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  display: block;
  margin-bottom: 16px;
}

.empty-state p {
  margin: 8px 0;
  color: var(--text-primary);
}

.hint {
  font-size: 14px;
  color: var(--text-secondary);
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

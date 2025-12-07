<template>
  <div class="search">
    <div class="search-header">
      <div class="search-box">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索歌曲、歌手..."
          @keyup.enter="handleSearch"
          class="search-input"
        />
        <button @click="handleSearch" class="search-btn">🔍 搜索</button>
      </div>
    </div>

    <div v-if="loading" class="loading">搜索中...</div>

    <div v-else-if="searchResults.length > 0" class="search-results">
      <h3>搜索结果 ({{ searchResults.length }})</h3>
      <div class="songs-list">
        <div
          v-for="song in searchResults"
          :key="song.id"
          class="song-item"
          @click="playSong(song)"
        >
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
          <button @click.stop="addToPlaylist(song)" class="add-btn">➕</button>
        </div>
      </div>
    </div>

    <div v-else-if="searched" class="no-results">
      没有找到相关歌曲
    </div>

    <div v-else class="search-tips">
      <h3>🎵 搜索提示</h3>
      <p>输入歌曲名称或艺术家名称进行搜索</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { usePlayerStore } from '../stores/player'
import { searchSongs } from '../api/music'

const playerStore = usePlayerStore()

const searchQuery = ref('')
const searchResults = ref([])
const loading = ref(false)
const searched = ref(false)

const handleSearch = async () => {
  if (!searchQuery.value.trim()) return

  loading.value = true
  searched.value = true

  try {
    const res = await searchSongs(searchQuery.value, 30)
    searchResults.value = res.data.result?.songs || []
  } catch (error) {
    console.error('搜索失败:', error)
    searchResults.value = []
  } finally {
    loading.value = false
  }
}

const playSong = (song) => {
  playerStore.clearPlaylist()
  playerStore.addToPlaylist({
    id: song.id,
    name: song.name,
    artist: song.ar?.map(a => a.name).join(' / ') || '未知艺术家',
    duration: song.dt / 1000
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

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.search {
  color: white;
}

.search-header {
  margin-bottom: 30px;
}

.search-box {
  display: flex;
  gap: 10px;
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 16px;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.search-input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.4);
}

.search-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: transform 0.3s;
}

.search-btn:hover {
  transform: scale(1.05);
}

.loading,
.no-results,
.search-tips {
  text-align: center;
  padding: 40px;
  font-size: 18px;
}

.search-tips h3 {
  font-size: 24px;
  margin: 0 0 10px 0;
}

.search-tips p {
  color: rgba(255, 255, 255, 0.7);
}

.search-results h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
}

.songs-list {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  overflow: hidden;
}

.song-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: background 0.3s;
  gap: 12px;
}

.song-item:last-child {
  border-bottom: none;
}

.song-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.song-cover {
  flex: 0 0 50px;
  width: 50px;
  height: 50px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  overflow: hidden;
}

.song-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-cover {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.song-details {
  flex: 1;
  min-width: 0;
}

.song-name {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-duration {
  flex: 0 0 50px;
  text-align: right;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.add-btn {
  flex: 0 0 40px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.add-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>

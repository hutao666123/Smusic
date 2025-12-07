<template>
  <div class="home">
    <!-- 现在播放 -->
    <div class="now-playing-section">
      <now-playing />
    </div>

    <div class="divider"></div>

    <div class="home-section">
      <h2>🎤 热门单曲</h2>
      <div class="songs-list">
        <div
          v-for="(song, index) in topSongs"
          :key="song.id"
          class="song-item"
          @click="playSong(song)"
        >
          <span class="song-index">{{ index + 1 }}</span>
          <div class="song-details">
            <div class="song-name">{{ song.name }}</div>
            <div class="song-artist">
              {{ song.ar?.map(a => a.name).join(' / ') || '未知艺术家' }}
            </div>
          </div>
          <span class="song-duration">{{ formatTime(song.dt / 1000) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usePlayerStore } from '../stores/player'
import { getTopSongs } from '../api/music'
import NowPlaying from '../components/NowPlaying.vue'

const playerStore = usePlayerStore()

const topSongs = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const songsRes = await getTopSongs(10)
    topSongs.value = songsRes.data.data || []
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
})

const playSong = (song) => {
  playerStore.addToPlaylist({
    id: song.id,
    name: song.name,
    artist: song.ar?.map(a => a.name).join(' / ') || '未知艺术家',
    duration: song.dt / 1000
  })
  playerStore.play()
}

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.home {
  color: white;
}

.now-playing-section {
  margin-bottom: 40px;
  padding: 20px 0;
}

.divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 20px 0 40px 0;
}

.home-header {
  margin-bottom: 30px;
}

.home-header h2 {
  font-size: 24px;
  margin: 0 0 20px 0;
}

.loading {
  text-align: center;
  padding: 40px;
  font-size: 18px;
}

.home-section {
  margin-top: 0;
}

.home-section h2 {
  font-size: 24px;
  margin: 0 0 20px 0;
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
}

.song-item:last-child {
  border-bottom: none;
}

.song-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.song-index {
  flex: 0 0 40px;
  text-align: center;
  font-weight: bold;
  color: rgba(255, 255, 255, 0.7);
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
</style>

<template>
  <div class="playlist">
    <div v-if="loading" class="loading">加载中...</div>

    <div v-else-if="playlist" class="playlist-content">
      <div class="playlist-header">
        <div class="playlist-cover">
          <img :src="playlist.coverImgUrl" :alt="playlist.name" />
        </div>
        <div class="playlist-info">
          <h1>{{ playlist.name }}</h1>
          <p class="playlist-desc">{{ playlist.description }}</p>
          <div class="playlist-stats">
            <span>👤 {{ playlist.creator?.nickname }}</span>
            <span>🎵 {{ playlist.trackCount }} 首歌曲</span>
            <span>❤️ {{ playlist.subscribedCount }} 收藏</span>
          </div>
        </div>
      </div>

      <div class="playlist-songs">
        <h3>歌曲列表</h3>
        <div class="songs-list">
          <div
            v-for="(song, index) in songs"
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

    <div v-else class="error">
      加载歌单失败
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { usePlayerStore } from '../stores/player'
import { getPlaylistDetail } from '../api/music'

const route = useRoute()
const playerStore = usePlayerStore()

const playlist = ref(null)
const songs = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await getPlaylistDetail(route.params.id)
    playlist.value = res.data.playlist
    songs.value = res.data.playlist?.tracks || []
  } catch (error) {
    console.error('加载歌单失败:', error)
  } finally {
    loading.value = false
  }
})

const playSong = (song) => {
  playerStore.clearPlaylist()
  songs.value.forEach(s => {
    playerStore.addToPlaylist({
      id: s.id,
      name: s.name,
      artist: s.ar?.map(a => a.name).join(' / ') || '未知艺术家',
      duration: s.dt / 1000
    })
  })
  const index = songs.value.findIndex(s => s.id === song.id)
  playerStore.currentIndex = index
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
.playlist {
  color: white;
}

.loading,
.error {
  text-align: center;
  padding: 40px;
  font-size: 18px;
}

.playlist-content {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.playlist-header {
  display: flex;
  gap: 30px;
  margin-bottom: 40px;
  background: rgba(0, 0, 0, 0.3);
  padding: 20px;
  border-radius: 8px;
}

.playlist-cover {
  flex: 0 0 200px;
  width: 200px;
  height: 200px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  overflow: hidden;
}

.playlist-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.playlist-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.playlist-info h1 {
  margin: 0 0 10px 0;
  font-size: 32px;
}

.playlist-desc {
  margin: 0 0 20px 0;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.5;
}

.playlist-stats {
  display: flex;
  gap: 20px;
  font-size: 14px;
}

.playlist-songs {
  margin-top: 40px;
}

.playlist-songs h3 {
  margin: 0 0 20px 0;
  font-size: 20px;
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

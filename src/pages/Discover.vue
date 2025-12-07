<template>
  <div class="discover">
    <div class="discover-header">
      <h2>🎵 发现音乐</h2>
      <div class="filter-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="['filter-tab', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          {{ tab.name }}
        </button>
      </div>
    </div>

    <!-- 推荐歌单 -->
    <div v-if="activeTab === 'playlists'" class="section">
      <h3>推荐歌单</h3>
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else class="playlists-grid">
        <div
          v-for="playlist in personalizedPlaylists"
          :key="playlist.id"
          class="playlist-card"
          @click="goToPlaylist(playlist.id)"
        >
          <div class="playlist-cover">
            <img :src="playlist.picUrl" :alt="playlist.name" />
            <div class="playlist-overlay">
              <span class="play-icon">▶</span>
            </div>
          </div>
          <div class="playlist-info">
            <h4>{{ playlist.name }}</h4>
            <p>{{ playlist.copywriter || '推荐歌单' }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 新歌推荐 -->
    <div v-if="activeTab === 'newsongs'" class="section">
      <h3>推荐新歌</h3>
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else class="songs-list">
        <div
          v-for="(song, index) in personalizedNewSongs"
          :key="song.id"
          class="song-item"
          @click="playSong(song)"
        >
          <span class="song-index">{{ index + 1 }}</span>
          <div class="song-cover">
            <img v-if="song.album?.picUrl" :src="song.album.picUrl" :alt="song.name" />
            <div v-else class="no-cover">🎵</div>
          </div>
          <div class="song-details">
            <div class="song-name">{{ song.name }}</div>
            <div class="song-artist">
              {{ song.artists?.map(a => a.name).join(' / ') || '未知艺术家' }}
            </div>
          </div>
          <button @click.stop="addToPlaylist(song)" class="add-btn">➕</button>
        </div>
      </div>
    </div>

    <!-- 热门歌单 -->
    <div v-if="activeTab === 'hotplaylists'" class="section">
      <h3>热门歌单</h3>
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else class="playlists-grid">
        <div
          v-for="playlist in topPlaylists"
          :key="playlist.id"
          class="playlist-card"
          @click="goToPlaylist(playlist.id)"
        >
          <div class="playlist-cover">
            <img :src="playlist.coverImgUrl" :alt="playlist.name" />
            <div class="playlist-overlay">
              <span class="play-icon">▶</span>
            </div>
          </div>
          <div class="playlist-info">
            <h4>{{ playlist.name }}</h4>
            <p>👤 {{ playlist.creator?.nickname }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 热门单曲 -->
    <div v-if="activeTab === 'topsongs'" class="section">
      <h3>热门单曲</h3>
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else class="songs-list">
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
          <button @click.stop="addToPlaylist(song)" class="add-btn">➕</button>
        </div>
      </div>
    </div>

    <!-- 新碟上架 -->
    <div v-if="activeTab === 'newalbums'" class="section">
      <h3>新碟上架</h3>
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else class="albums-grid">
        <div
          v-for="album in newAlbums"
          :key="album.id"
          class="album-card"
          @click="goToAlbum(album.id)"
        >
          <div class="album-cover">
            <img :src="album.picUrl" :alt="album.name" />
            <div class="album-overlay">
              <span class="play-icon">▶</span>
            </div>
          </div>
          <div class="album-info">
            <h4>{{ album.name }}</h4>
            <p>{{ album.artist?.name || '未知艺术家' }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '../stores/player'
import {
  getPersonalizedPlaylist,
  getPersonalizedNewSong,
  getTopPlaylist,
  getTopSongs,
  getNewAlbums
} from '../api/music'

const router = useRouter()
const playerStore = usePlayerStore()

const activeTab = ref('playlists')
const loading = ref(false)
const personalizedPlaylists = ref([])
const personalizedNewSongs = ref([])
const topPlaylists = ref([])
const topSongs = ref([])
const newAlbums = ref([])

const tabs = [
  { id: 'playlists', name: '推荐歌单' },
  { id: 'newsongs', name: '新歌推荐' },
  { id: 'hotplaylists', name: '热门歌单' },
  { id: 'topsongs', name: '热门单曲' },
  { id: 'newalbums', name: '新碟上架' }
]

onMounted(async () => {
  await loadData()
})

const loadData = async () => {
  loading.value = true
  try {
    const [playlistRes, newsongRes, topPlaylistRes, topSongRes, newAlbumRes] = await Promise.all([
      getPersonalizedPlaylist(6),
      getPersonalizedNewSong(10),
      getTopPlaylist(6),
      getTopSongs(10),
      getNewAlbums(6)
    ])

    personalizedPlaylists.value = playlistRes.data.result || []
    personalizedNewSongs.value = newsongRes.data.result || []
    topPlaylists.value = topPlaylistRes.data.playlists || []
    topSongs.value = topSongRes.data.data || []
    newAlbums.value = newAlbumRes.data.albums || []
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

const playSong = (song) => {
  playerStore.clearPlaylist()
  const songData = {
    id: song.id,
    name: song.name,
    artist: song.artists?.map(a => a.name).join(' / ') || song.ar?.map(a => a.name).join(' / ') || '未知艺术家',
    duration: song.duration ? song.duration / 1000 : song.dt / 1000
  }
  playerStore.addToPlaylist(songData)
  playerStore.play()
}

const addToPlaylist = (song) => {
  const songData = {
    id: song.id,
    name: song.name,
    artist: song.artists?.map(a => a.name).join(' / ') || song.ar?.map(a => a.name).join(' / ') || '未知艺术家',
    duration: song.duration ? song.duration / 1000 : song.dt / 1000
  }
  playerStore.addToPlaylist(songData)
}

const goToPlaylist = (id) => {
  router.push(`/playlist/${id}`)
}

const goToAlbum = (id) => {
  router.push(`/album/${id}`)
}

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.discover {
  color: white;
}

.discover-header {
  margin-bottom: 30px;
}

.discover-header h2 {
  font-size: 28px;
  margin: 0 0 20px 0;
}

.filter-tabs {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-tab {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.8);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
}

.filter-tab:hover {
  background: rgba(255, 255, 255, 0.2);
}

.filter-tab.active {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-color: transparent;
  color: white;
}

.section {
  margin-bottom: 40px;
}

.section h3 {
  font-size: 20px;
  margin: 0 0 20px 0;
}

.loading {
  text-align: center;
  padding: 40px;
  font-size: 16px;
}

.playlists-grid,
.albums-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}

.playlist-card,
.album-card {
  cursor: pointer;
  transition: transform 0.3s;
}

.playlist-card:hover,
.album-card:hover {
  transform: translateY(-5px);
}

.playlist-cover,
.album-cover {
  position: relative;
  width: 100%;
  padding-bottom: 100%;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 10px;
}

.playlist-cover img,
.album-cover img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.playlist-overlay,
.album-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.playlist-card:hover .playlist-overlay,
.album-card:hover .album-overlay {
  opacity: 1;
}

.play-icon {
  font-size: 32px;
}

.playlist-info,
.album-info {
  min-height: 50px;
}

.playlist-info h4,
.album-info h4 {
  margin: 0;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.playlist-info p,
.album-info p {
  margin: 5px 0 0 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

.song-index {
  flex: 0 0 30px;
  text-align: center;
  font-weight: bold;
  color: rgba(255, 255, 255, 0.7);
}

.song-cover {
  flex: 0 0 40px;
  width: 40px;
  height: 40px;
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
  font-size: 18px;
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

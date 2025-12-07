<template>
  <div class="profile">
    <div v-if="!userStore.isLoggedIn" class="not-logged-in">
      <h2>请先登录</h2>
      <p>登录后可以查看个人信息和歌单</p>
      <router-link to="/login" class="login-link">前往登录</router-link>
    </div>

    <div v-else class="profile-content">
      <!-- 用户信息卡片 -->
      <div class="user-card">
        <div class="user-avatar">
          <img v-if="userStore.avatarUrl" :src="userStore.avatarUrl" :alt="userStore.nickname" />
          <div v-else class="avatar-placeholder">👤</div>
        </div>
        <div class="user-info">
          <h2>{{ userStore.nickname }}</h2>
          <p class="user-id">ID: {{ userStore.userId }}</p>
          <button @click="logout" class="logout-btn">登出</button>
        </div>
      </div>

      <!-- 用户歌单 -->
      <div class="playlists-section">
        <h3>我的歌单</h3>
        <div v-if="loadingPlaylists" class="loading">加载中...</div>
        <div v-else-if="userPlaylists.length > 0" class="playlists-grid">
          <div
            v-for="playlist in userPlaylists"
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
              <p>🎵 {{ playlist.trackCount }} 首歌曲</p>
            </div>
          </div>
        </div>
        <div v-else class="empty">
          暂无歌单
        </div>
      </div>

      <!-- 喜欢的歌曲 -->
      <div class="likes-section">
        <h3>我喜欢的歌曲</h3>
        <div v-if="loadingLikes" class="loading">加载中...</div>
        <div v-else-if="likeSongIds.length > 0" class="likes-info">
          <p>共有 {{ likeSongIds.length }} 首喜欢的歌曲</p>
          <button @click="goToLikeSongs" class="view-btn">查看全部</button>
        </div>
        <div v-else class="empty">
          暂无喜欢的歌曲
        </div>
      </div>

      <!-- 播放历史 -->
      <div class="history-section">
        <h3>播放历史</h3>
        <div v-if="playHistory.length > 0" class="history-list">
          <div
            v-for="(song, index) in playHistory.slice(0, 10)"
            :key="index"
            class="history-item"
            @click="playSong(song)"
          >
            <span class="history-index">{{ index + 1 }}</span>
            <div class="history-details">
              <div class="song-name">{{ song.name }}</div>
              <div class="song-artist">{{ song.artist }}</div>
            </div>
            <span class="history-time">{{ formatTime(song.playedAt) }}</span>
          </div>
        </div>
        <div v-else class="empty">
          暂无播放历史
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { usePlayerStore } from '../stores/player'

const router = useRouter()
const userStore = useUserStore()
const playerStore = usePlayerStore()

const userPlaylists = ref([])
const likeSongIds = ref([])
const playHistory = ref([])
const loadingPlaylists = ref(false)
const loadingLikes = ref(false)

onMounted(async () => {
  if (userStore.isLoggedIn) {
    await loadUserData()
  }
})

const loadUserData = async () => {
  loadingPlaylists.value = true
  loadingLikes.value = true

  try {
    const [playlists, likes] = await Promise.all([
      userStore.fetchUserPlaylists(),
      userStore.fetchLikeSongs()
    ])

    userPlaylists.value = playlists
    likeSongIds.value = likes
  } catch (error) {
    console.error('加载用户数据失败:', error)
  } finally {
    loadingPlaylists.value = false
    loadingLikes.value = false
  }

  // 从 localStorage 加载播放历史
  const history = localStorage.getItem('playHistory')
  if (history) {
    playHistory.value = JSON.parse(history)
  }
}

const logout = async () => {
  if (confirm('确定要登出吗？')) {
    await userStore.logoutUser()
    router.push('/login')
  }
}

const goToPlaylist = (id) => {
  router.push(`/playlist/${id}`)
}

const goToLikeSongs = () => {
  router.push('/likes')
}

const playSong = (song) => {
  playerStore.clearPlaylist()
  playerStore.addToPlaylist(song)
  playerStore.play()
}

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
  if (diff < 604800000) return Math.floor(diff / 86400000) + '天前'

  return date.toLocaleDateString()
}
</script>

<style scoped>
.profile {
  color: white;
}

.not-logged-in {
  text-align: center;
  padding: 60px 20px;
}

.not-logged-in h2 {
  font-size: 28px;
  margin-bottom: 10px;
}

.not-logged-in p {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 30px;
}

.login-link {
  display: inline-block;
  padding: 12px 30px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  transition: transform 0.3s;
}

.login-link:hover {
  transform: scale(1.05);
}

.profile-content {
  max-width: 1000px;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 30px;
  background: rgba(0, 0, 0, 0.3);
  padding: 30px;
  border-radius: 12px;
  margin-bottom: 40px;
}

.user-avatar {
  flex: 0 0 120px;
  width: 120px;
  height: 120px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  overflow: hidden;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
}

.user-info {
  flex: 1;
}

.user-info h2 {
  margin: 0 0 10px 0;
  font-size: 28px;
}

.user-id {
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 20px 0;
}

.logout-btn {
  padding: 10px 20px;
  background: rgba(244, 67, 54, 0.8);
  border: none;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s;
}

.logout-btn:hover {
  background: rgba(244, 67, 54, 1);
}

.playlists-section,
.likes-section,
.history-section {
  margin-bottom: 40px;
}

.playlists-section h3,
.likes-section h3,
.history-section h3 {
  font-size: 20px;
  margin: 0 0 20px 0;
}

.loading {
  text-align: center;
  padding: 20px;
  color: rgba(255, 255, 255, 0.7);
}

.empty {
  text-align: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.5);
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.playlists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 20px;
}

.playlist-card {
  cursor: pointer;
  transition: transform 0.3s;
}

.playlist-card:hover {
  transform: translateY(-5px);
}

.playlist-cover {
  position: relative;
  width: 100%;
  padding-bottom: 100%;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 10px;
}

.playlist-cover img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.playlist-overlay {
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

.playlist-card:hover .playlist-overlay {
  opacity: 1;
}

.play-icon {
  font-size: 28px;
}

.playlist-info h4 {
  margin: 0;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.playlist-info p {
  margin: 5px 0 0 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.likes-info {
  background: rgba(0, 0, 0, 0.3);
  padding: 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.likes-info p {
  margin: 0;
  font-size: 16px;
}

.view-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  transition: transform 0.3s;
}

.view-btn:hover {
  transform: scale(1.05);
}

.history-list {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  overflow: hidden;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: background 0.3s;
  gap: 12px;
}

.history-item:last-child {
  border-bottom: none;
}

.history-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.history-index {
  flex: 0 0 30px;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
}

.history-details {
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

.history-time {
  flex: 0 0 80px;
  text-align: right;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}
</style>

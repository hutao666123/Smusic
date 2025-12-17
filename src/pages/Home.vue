<template>
  <!--首页-->
  <div class="home">
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>正在为你准备音乐...</p>
    </div>

    <div v-else class="home-content">
      <!-- 主视觉区 - 随机播放卡片 -->
      <div class="random-play-hero">
        <div class="hero-background" :style="{ backgroundImage: currentPlaylist ? `url(${currentPlaylist.picUrl})` : '' }">
          <div class="hero-overlay"></div>
        </div>
        <div class="hero-content">
          <div class="hero-badge">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
            </svg>
            <span>随机播放</span>
          </div>
          <h1 class="hero-title">{{ currentPlaylist?.name || '发现音乐' }}</h1>
          <p class="hero-subtitle">从推荐歌单中为你精选 · 每次都有新惊喜</p>
          
          <div class="hero-actions">
            <button class="btn-primary" @click="startRandomPlay">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
              <span>{{ isPlaying ? '继续播放' : '开始播放' }}</span>
            </button>
            <button class="btn-secondary" @click="refreshRandomSongs">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 4v6h6M23 20v-6h-6"/>
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
              </svg>
              <span>换一批</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 随机歌曲队列 -->
      <div class="random-queue-section">
        <div class="section-header">
          <h2>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18V5l12-2v13M9 18c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3zm12-2c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3z"/>
            </svg>
            随机队列
          </h2>
          <span class="queue-count">{{ randomSongs.length }} 首歌曲</span>
        </div>

        <div class="songs-grid">
          <div
            v-for="(song, index) in randomSongs"
            :key="`${song.id}-${index}`"
            class="song-card"
            @click="playSongFromQueue(index)"
          >
            <div class="song-cover">
              <img :src="song.coverUrl || song.al?.picUrl" :alt="song.name" />
              <div class="song-overlay">
                <div class="play-icon">▶</div>
              </div>
            </div>
            <div class="song-info">
              <div class="song-name">{{ song.name }}</div>
              <div class="song-artist">{{ song.artist }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 推荐歌单 -->
      <section class="content-section">
        <div class="section-header">
          <h2 class="section-title">推荐歌单</h2>
        </div>
        <div class="carousel-wrapper">
          <button
            class="carousel-nav-btn prev"
            @click="prevPlaylist"
            :disabled="playlistStartIndex === 0"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div class="playlist-grid">
            <div
              v-for="playlist in getDisplayedPlaylists()"
              :key="playlist.id"
              class="playlist-card"
              @click="goToPlaylist(playlist.id)"
            >
              <div class="playlist-cover">
                <img :src="playlist.picUrl" :alt="playlist.name" />
                <div class="playlist-overlay">
                  <div class="play-icon">▶</div>
                </div>
              </div>
              <h3 class="playlist-title">{{ playlist.name }}</h3>
            </div>
          </div>
          <button
            class="carousel-nav-btn next"
            @click="nextPlaylist"
            :disabled="playlistStartIndex + 5 >= playlists.length"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '../stores/player'
import { getPersonalizedPlaylist, getPlaylistDetail } from '../api/music'

const router = useRouter()
const playerStore = usePlayerStore()

const loading = ref(true)
const playlists = ref([])
const randomSongs = ref([])
const currentPlaylist = ref(null)
const playlistStartIndex = ref(0)
const isPlaying = computed(() => playerStore.isPlaying)

onMounted(async () => {
  await loadPlaylists()
  await loadRandomSongs()
  loading.value = false
})

// 加载推荐歌单
const loadPlaylists = async () => {
  try {
    const res = await getPersonalizedPlaylist(30)
    playlists.value = res.data.result || []
    console.log('✅ 加载推荐歌单:', playlists.value.length)
  } catch (error) {
    console.error('❌ 加载推荐歌单失败:', error)
  }
}

// 从推荐歌单中随机加载歌曲
const loadRandomSongs = async () => {
  if (playlists.value.length === 0) return

  try {
    // 随机选择一个歌单
    const randomPlaylist = playlists.value[Math.floor(Math.random() * playlists.value.length)]
    currentPlaylist.value = randomPlaylist

    // 获取歌单详情
    const res = await getPlaylistDetail(randomPlaylist.id)
    const tracks = res.data.playlist?.tracks || []

    // 随机打乱歌曲顺序并取前12首
    const shuffled = tracks.sort(() => Math.random() - 0.5).slice(0, 12)
    
    randomSongs.value = shuffled.map(song => ({
      id: song.id,
      name: song.name,
      artist: song.ar?.map(a => a.name).join(' / ') || '未知艺术家',
      duration: song.dt / 1000,
      coverUrl: song.al?.picUrl,
      al: song.al,
      ar: song.ar
    }))

    console.log('✅ 随机加载歌曲:', randomSongs.value.length, '首，来自:', randomPlaylist.name)
  } catch (error) {
    console.error('❌ 加载随机歌曲失败:', error)
  }
}

// 开始随机播放
const startRandomPlay = () => {
  if (randomSongs.value.length === 0) return

  // 非本地歌单，使用在线播放
  playerStore.forceLocalMode = false
  playerStore.clearPlaylist()
  randomSongs.value.forEach(song => {
    playerStore.addToPlaylist(song)
  })
  playerStore.play()
  console.log('🎵 开始随机播放，共', randomSongs.value.length, '首歌')
}

// 从队列中播放指定歌曲
const playSongFromQueue = (index) => {
  playerStore.clearPlaylist()
  // 非本地歌单，使用在线播放
  playerStore.forceLocalMode = false
  // 从点击的歌曲开始添加到播放列表
  for (let i = index; i < randomSongs.value.length; i++) {
    playerStore.addToPlaylist(randomSongs.value[i])
  }
  // 添加前面的歌曲到队列末尾
  for (let i = 0; i < index; i++) {
    playerStore.addToPlaylist(randomSongs.value[i])
  }
  playerStore.play()
}

// 刷新随机歌曲
const refreshRandomSongs = async () => {
  loading.value = true
  await loadRandomSongs()
  loading.value = false
}

// 跳转到歌单详情
const goToPlaylist = (id) => {
  router.push(`/playlist/${id}`)
}

// 推荐歌单轮播
const prevPlaylist = () => {
  if (playlistStartIndex.value > 0) {
    playlistStartIndex.value -= 5
  }
}

const nextPlaylist = () => {
  if (playlistStartIndex.value + 5 < playlists.value.length) {
    playlistStartIndex.value += 5
  }
}

const getDisplayedPlaylists = () => {
  return playlists.value.slice(playlistStartIndex.value, playlistStartIndex.value + 5)
}
</script>

<style scoped>
.home {
  min-height: 100vh;
  background: var(--page-bg);
  color: var(--text-primary);
  padding-bottom: 100px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 20px;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid var(--border-color);
  border-top-color: var(--text-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  font-size: 16px;
  color: var(--text-secondary);
}

/* 主视觉区 */
.random-play-hero {
  position: relative;
  height: 400px;
  margin: -20px -20px 40px -20px;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  filter: blur(40px);
  transform: scale(1.2);
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.7));
}

.hero-content {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 40px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 20px;
}

.hero-badge svg {
  width: 18px;
  height: 18px;
}

.hero-title {
  font-size: 48px;
  font-weight: 800;
  margin: 0 0 15px 0;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  max-width: 800px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.hero-subtitle {
  font-size: 18px;
  color: var(--text-primary);
  margin: 0 0 40px 0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

.hero-actions {
  display: flex;
  gap: 15px;
}

.btn-primary,
.btn-secondary {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 32px;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.btn-primary {
  background: white;
  color: #333;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.btn-primary:hover {
  transform: scale(1.05);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: scale(1.05);
}

.btn-primary svg,
.btn-secondary svg {
  width: 20px;
  height: 20px;
}

/* 内容区 */
.home-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.section-header h2 {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 28px;
  font-weight: 700;
  margin: 0;
}

.section-header h2 svg {
  width: 28px;
  height: 28px;
}

.queue-count {
  font-size: 14px;
  color: var(--text-secondary);
  background: var(--button-bg);
  padding: 6px 14px;
  border-radius: 20px;
}

/* 随机队列 */
.random-queue-section {
  margin-bottom: 60px;
}

.songs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 20px;
}

.song-card {
  cursor: pointer;
  transition: all 0.3s;
}

.song-card:hover {
  transform: translateY(-5px);
}

.song-cover {
  position: relative;
  width: 100%;
  padding-bottom: 100%;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 12px;
  background: var(--button-bg);
}

.song-cover img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.song-card:hover .song-cover img {
  transform: scale(1.1);
}

.song-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.song-card:hover .song-overlay {
  opacity: 1;
}

.play-icon {
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333;
  font-size: 20px;
  padding-left: 4px;
}

.song-info {
  padding: 0 4px;
}

.song-name {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
  min-height: 2.8em;
}

.song-artist {
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 推荐歌单 */
.content-section {
  margin-bottom: 50px;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  color: var(--text-primary);
}

.carousel-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  gap: 15px;
}

.carousel-nav-btn {
  flex: 0 0 40px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--button-bg);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  backdrop-filter: blur(10px);
  z-index: 10;
}

.carousel-nav-btn:hover:not(:disabled) {
  background: var(--button-hover-bg);
  transform: scale(1.1);
}

.carousel-nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.carousel-nav-btn svg {
  width: 20px;
  height: 20px;
}

.playlist-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
}

.playlist-card {
  cursor: pointer;
  transition: all 0.3s;
}

.playlist-card:hover {
  transform: translateY(-5px);
}

.playlist-cover {
  position: relative;
  width: 100%;
  padding-bottom: 100%;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 12px;
  background: var(--button-bg);
}

.playlist-cover img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.playlist-card:hover .playlist-cover img {
  transform: scale(1.1);
}

.playlist-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.playlist-card:hover .playlist-overlay {
  opacity: 1;
}

.playlist-title {
  font-size: 14px;
  font-weight: 500;
  margin: 0;
  padding: 0 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
  min-height: 2.8em;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 32px;
  }

  .hero-subtitle {
    font-size: 14px;
  }

  .songs-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 15px;
  }

  .playlist-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>

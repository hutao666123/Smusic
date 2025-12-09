<template>
  <div class="discover">
    <div class="discover-content">
      <!-- 顶部轮播横幅 - 热门歌单 -->
      <div v-if="loadingStates.topPlaylists" class="section-loading">
        <div class="loading-spinner"></div>
        <p>加载热门歌单中...</p>
      </div>
      <div v-else class="banner-section">
        <div class="banner-header">
          <h2 class="banner-section-title">热门歌单</h2>
          <button class="more-btn" @click="goToTopPlaylistList">
            <span>更多</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
        <div class="banner-content-wrapper">
          <button
            class="banner-nav-btn banner-nav-transparent prev"
            @click="prevBanner"
            :disabled="bannerStartIndex === 0"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <div class="banner-carousel">
          <div
            class="banner-slide"
            v-for="playlist in getDisplayedBanners()"
            :key="playlist.id"
            @click="goToPlaylist(playlist.id)"
          >
            <div class="banner-content" :style="{ backgroundImage: `url(${playlist.coverImgUrl})` }">
              <div class="banner-overlay"></div>
              <div class="banner-text-content">
                <h3 class="banner-title">{{ playlist.name }}</h3>
                <button class="banner-play-btn" @click.stop="playPlaylist(playlist.id)">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

          <button
            class="banner-nav-btn banner-nav-transparent next"
            @click="nextBanner"
            :disabled="loadingMore || !hasMoreTopPlaylists"
          >
            <svg v-if="!loadingMore" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
            <div v-else class="mini-spinner"></div>
          </button>
        </div>
      </div>

      <!-- 新碟上架 -->
      <div v-if="loadingStates.albums" class="section-loading">
        <div class="loading-spinner"></div>
        <p>加载新碟中...</p>
      </div>
      <section v-else class="content-section">
        <div class="section-header">
          <h2 class="section-title">新碟上架</h2>
          <div class="section-nav">
            <button class="more-btn" @click="goToAlbumList">
              <span>更多</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
        <div class="carousel-wrapper">
          <button
            class="carousel-nav-btn prev"
            @click="prevAlbum"
            :disabled="albumStartIndex === 0"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div class="album-grid">
            <div
              v-for="album in getDisplayedAlbums()"
              :key="album.id"
              class="album-card"
              @click="goToAlbum(album.id)"
            >
              <div class="album-cover">
                <img :src="album.picUrl" :alt="album.name" />
                <div class="album-overlay">
                  <div class="play-icon">▶</div>
                </div>
              </div>
              <h3 class="album-title">{{ album.name }}</h3>
              <p class="album-artist">{{ album.artist?.name || '未知艺术家' }}</p>
            </div>
          </div>
          <button
            class="carousel-nav-btn next"
            @click="nextAlbum"
            :disabled="loadingMore || !hasMoreAlbums"
          >
            <svg v-if="!loadingMore" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
            <div v-else class="mini-spinner"></div>
          </button>
        </div>
      </section>

      <!-- 热歌榜和新歌榜并排 -->
      <div class="charts-row">
        <!-- 热歌榜 -->
        <div v-if="loadingStates.topSongs" class="section-loading">
          <div class="loading-spinner"></div>
          <p>加载热歌榜中...</p>
        </div>
        <section v-else class="chart-section">
          <div class="chart-header">
            <h2 class="chart-title">热歌榜</h2>
            <button class="play-all-btn" @click="playAllTopSongs">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          </div>
          <p class="chart-update">更新时间: {{ formatDate(new Date()) }}</p>
          <div v-if="topSongs.length === 0" class="chart-empty">
            <p>暂无数据</p>
          </div>
          <div v-else>
            <div class="chart-list">
              <div
                v-for="(song, index) in (showAllTopSongs ? topSongs : topSongs.slice(0, 10))"
                :key="song.id"
                class="chart-item"
                @click="playSong(song)"
              >
                <div class="chart-rank" :class="{ top: index < 3 }">{{ index + 1 }}</div>
                <div class="chart-song-info">
                  <div class="chart-song-name">{{ song.name }}</div>
                  <div class="chart-song-artist">
                    {{ song.ar?.map(a => a.name).join(' / ') || '未知艺术家' }}
                  </div>
                </div>
                <button @click.stop="addToPlaylist(song, $event)" class="chart-add-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </button>
              </div>
            </div>
            <button v-if="topSongs.length > 10" class="show-more-btn" @click="showAllTopSongs = !showAllTopSongs">
              <span v-if="!showAllTopSongs">查看全部 {{ topSongs.length }} 首</span>
              <span v-else>收起</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ rotate: showAllTopSongs }">
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </section>

        <!-- 新歌榜 -->
        <div v-if="loadingStates.newSongs" class="section-loading">
          <div class="loading-spinner"></div>
          <p>加载新歌榜中...</p>
        </div>
        <section v-else class="chart-section">
          <div class="chart-header">
            <h2 class="chart-title">新歌榜</h2>
            <button class="play-all-btn" @click="playAllNewSongs">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          </div>
          <p class="chart-update">更新时间: {{ formatDate(new Date()) }}</p>
          <div v-if="personalizedNewSongs.length === 0" class="chart-empty">
            <p>暂无数据</p>
          </div>
          <div v-else>
            <div class="chart-list">
              <div
                v-for="(song, index) in (showAllNewSongs ? personalizedNewSongs : personalizedNewSongs.slice(0, 10))"
                :key="song.id"
                class="chart-item"
                @click="playSong(song)"
              >
                <div class="chart-rank" :class="{ top: index < 3 }">{{ index + 1 }}</div>
                <div class="chart-song-info">
                  <div class="chart-song-name">{{ song.name }}</div>
                  <div class="chart-song-artist">
                    {{ song.artists?.map(a => a.name).join(' / ') || '未知艺术家' }}
                  </div>
                </div>
                <button @click.stop="addToPlaylist(song, $event)" class="chart-add-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </button>
              </div>
            </div>
            <button v-if="personalizedNewSongs.length > 10" class="show-more-btn" @click="showAllNewSongs = !showAllNewSongs">
              <span v-if="!showAllNewSongs">查看全部 {{ personalizedNewSongs.length }} 首</span>
              <span v-else>收起</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ rotate: showAllNewSongs }">
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Discover'
}
</script>

<script setup>
import { ref, computed, onMounted, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '../stores/player'
import {
  getPersonalizedNewSong,
  getTopPlaylist,
  getNewAlbums,
  getPlaylistDetail
} from '../api/music'

const router = useRouter()
const playerStore = usePlayerStore()

const personalizedNewSongs = ref([])
const topPlaylists = ref([])
const topSongs = ref([])
const newAlbums = ref([])
const bannerStartIndex = ref(0)
const albumStartIndex = ref(0)

// 各区块的加载状态
const loadingStates = ref({
  newSongs: true,
  topPlaylists: true,
  topSongs: true,
  albums: true
})

// 榜单展开状态
const showAllTopSongs = ref(false)
const showAllNewSongs = ref(false)

// 分页状态
const topPlaylistsPage = ref(0)
const albumsPage = ref(0)
const loadingMore = ref(false)
const hasMoreTopPlaylists = ref(true)
const hasMoreAlbums = ref(true)

// 保存的滚动位置
const savedScrollPosition = ref(0)

// 初始化标志
const isInitialized = ref(false)

onMounted(() => {
  if (!isInitialized.value) {
    // 异步加载各个区块，互不阻塞
    loadPersonalizedNewSongs()
    loadTopPlaylists()
    loadTopSongs()
    loadNewAlbums()
    isInitialized.value = true
  }
})

// 页面激活时恢复滚动位置
onActivated(() => {
  if (savedScrollPosition.value > 0) {
    setTimeout(() => {
      const mainElement = document.querySelector('.app-main')
      if (mainElement) {
        mainElement.scrollTop = savedScrollPosition.value
      }
    }, 50)
  }
})

// 异步加载推荐新歌
const loadPersonalizedNewSongs = async () => {
  loadingStates.value.newSongs = true
  try {
    const res = await getPersonalizedNewSong(20)
    personalizedNewSongs.value = res.data.result || []
    console.log('✅ 推荐新歌加载完成')
  } catch (error) {
    console.error('❌ 加载推荐新歌失败:', error)
  } finally {
    loadingStates.value.newSongs = false
  }
}

// 异步加载热门歌单
const loadTopPlaylists = async () => {
  loadingStates.value.topPlaylists = true
  try {
    const res = await getTopPlaylist(30, 0)
    topPlaylists.value = res.data.playlists || []
    console.log('✅ 热门歌单加载完成')
  } catch (error) {
    console.error('❌ 加载热门歌单失败:', error)
  } finally {
    loadingStates.value.topPlaylists = false
  }
}

// 异步加载热歌榜
const loadTopSongs = async () => {
  loadingStates.value.topSongs = true
  try {
    const res = await getPlaylistDetail(3778678)
    if (res.data.playlist?.tracks) {
      topSongs.value = res.data.playlist.tracks.slice(0, 50)
      console.log('✅ 热歌榜加载完成:', topSongs.value.length, '首歌')
    }
  } catch (error) {
    console.error('❌ 加载热歌榜失败:', error)
  } finally {
    loadingStates.value.topSongs = false
  }
}

// 异步加载新碟
const loadNewAlbums = async () => {
  loadingStates.value.albums = true
  try {
    const res = await getNewAlbums(24, 0)
    newAlbums.value = res.data.albums || []
    console.log('✅ 新碟上架加载完成')
  } catch (error) {
    console.error('❌ 加载新碟失败:', error)
  } finally {
    loadingStates.value.albums = false
  }
}

// 加载更多热门歌单
const loadMoreTopPlaylists = async () => {
  if (loadingMore.value || !hasMoreTopPlaylists.value) return
  loadingMore.value = true
  try {
    topPlaylistsPage.value++
    const res = await getTopPlaylist(30, topPlaylistsPage.value * 30)
    const newPlaylists = res.data.playlists || []
    if (newPlaylists.length === 0) {
      hasMoreTopPlaylists.value = false
    } else {
      topPlaylists.value = [...topPlaylists.value, ...newPlaylists]
    }
  } catch (error) {
    console.error('加载更多热门歌单失败:', error)
  } finally {
    loadingMore.value = false
  }
}

// 加载更多新碟
const loadMoreAlbums = async () => {
  if (loadingMore.value || !hasMoreAlbums.value) return
  loadingMore.value = true
  try {
    albumsPage.value++
    const res = await getNewAlbums(24, albumsPage.value * 24)
    const newAlbums_ = res.data.albums || []
    if (newAlbums_.length === 0) {
      hasMoreAlbums.value = false
    } else {
      newAlbums.value = [...newAlbums.value, ...newAlbums_]
    }
  } catch (error) {
    console.error('加载更多新碟失败:', error)
  } finally {
    loadingMore.value = false
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

// 播放全部热歌榜
const playAllTopSongs = () => {
  if (topSongs.value.length === 0) return
  
  playerStore.clearPlaylist()
  topSongs.value.forEach(song => {
    const songData = {
      id: song.id,
      name: song.name,
      artist: song.ar?.map(a => a.name).join(' / ') || '未知艺术家',
      duration: song.dt / 1000
    }
    playerStore.addToPlaylist(songData)
  })
  playerStore.play()
  console.log('🎵 开始播放热歌榜，共', topSongs.value.length, '首歌')
}

// 播放全部新歌榜
const playAllNewSongs = () => {
  if (personalizedNewSongs.value.length === 0) return
  
  playerStore.clearPlaylist()
  personalizedNewSongs.value.forEach(song => {
    const songData = {
      id: song.id,
      name: song.name,
      artist: song.artists?.map(a => a.name).join(' / ') || '未知艺术家',
      duration: song.duration / 1000
    }
    playerStore.addToPlaylist(songData)
  })
  playerStore.play()
  console.log('🎵 开始播放新歌榜，共', personalizedNewSongs.value.length, '首歌')
}

const addToPlaylist = (song, event) => {
  const songData = {
    id: song.id,
    name: song.name,
    artist: song.artists?.map(a => a.name).join(' / ') || song.ar?.map(a => a.name).join(' / ') || '未知艺术家',
    duration: song.duration ? song.duration / 1000 : song.dt / 1000
  }
  playerStore.addToPlaylist(songData)
  
  // 创建飞行音符动画
  createFlyingNote(event)
}

const createFlyingNote = (event) => {
  const button = event.currentTarget
  const rect = button.getBoundingClientRect()
  
  // 创建音符元素
  const note = document.createElement('div')
  note.className = 'flying-note'
  note.innerHTML = '♪'
  
  // 设置起始位置
  const startX = rect.left + rect.width / 2
  const startY = rect.top + rect.height / 2
  note.style.left = startX + 'px'
  note.style.top = startY + 'px'
  
  document.body.appendChild(note)
  
  // 获取播放器位置（底部中间）
  const targetX = window.innerWidth / 2
  const targetY = window.innerHeight - 60
  
  // 计算移动距离
  const deltaX = targetX - startX
  const deltaY = targetY - startY
  
  console.log('音符飞行:', { startX, startY, targetX, targetY, deltaX, deltaY })
  
  // 使用requestAnimationFrame确保动画触发
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      note.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.3) rotate(360deg)`
      note.style.opacity = '0'
    })
  })
  
  // 动画结束后移除元素
  setTimeout(() => {
    note.remove()
  }, 1000)
}

const goToPlaylist = (id) => {
  // 保存当前滚动位置
  const mainElement = document.querySelector('.app-main')
  if (mainElement) {
    savedScrollPosition.value = mainElement.scrollTop
  }
  router.push(`/playlist/${id}`)
}

const goToAlbum = (id) => {
  // 保存当前滚动位置
  const mainElement = document.querySelector('.app-main')
  if (mainElement) {
    savedScrollPosition.value = mainElement.scrollTop
  }
  router.push(`/album/${id}`)
}

const playPlaylist = async (id) => {
  try {
    const res = await getPlaylistDetail(id)
    const songs = res.data.playlist?.tracks || []
    
    if (songs.length === 0) {
      alert('该歌单暂无歌曲')
      return
    }
    
    // 清空播放列表并添加所有歌曲
    playerStore.clearPlaylist()
    songs.forEach(song => {
      playerStore.addToPlaylist({
        id: song.id,
        name: song.name,
        artist: song.ar?.map(a => a.name).join(' / ') || '未知艺术家',
        duration: song.dt / 1000
      })
    })
    
    // 开始播放
    playerStore.play()
  } catch (error) {
    console.error('播放歌单失败:', error)
    alert('播放歌单失败，请稍后重试')
  }
}

const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const prevBanner = () => {
  if (bannerStartIndex.value > 0) {
    bannerStartIndex.value -= 4
  }
}

const nextBanner = async () => {
  // 如果还有当前数据可以显示，直接切换
  if (bannerStartIndex.value + 4 < topPlaylists.value.length) {
    bannerStartIndex.value += 4
  } 
  // 如果到达当前数据末尾，尝试加载更多
  else if (hasMoreTopPlaylists.value && !loadingMore.value) {
    await loadMoreTopPlaylists()
    // 加载成功后切换到新数据
    if (topPlaylists.value.length > bannerStartIndex.value + 4) {
      bannerStartIndex.value += 4
    }
  }
}

const getDisplayedBanners = () => {
  return topPlaylists.value.slice(bannerStartIndex.value, bannerStartIndex.value + 4)
}

const prevAlbum = () => {
  if (albumStartIndex.value > 0) {
    albumStartIndex.value -= 5
  }
}

const nextAlbum = async () => {
  // 如果还有当前数据可以显示，直接切换
  if (albumStartIndex.value + 5 < newAlbums.value.length) {
    albumStartIndex.value += 5
  } 
  // 如果到达当前数据末尾，尝试加载更多
  else if (hasMoreAlbums.value && !loadingMore.value) {
    await loadMoreAlbums()
    // 加载成功后切换到新数据
    if (newAlbums.value.length > albumStartIndex.value + 5) {
      albumStartIndex.value += 5
    }
  }
}

const getDisplayedAlbums = () => {
  return newAlbums.value.slice(albumStartIndex.value, albumStartIndex.value + 5)
}

// 跳转到热门歌单列表
const goToTopPlaylistList = () => {
  router.push('/playlist/top')
}

// 跳转到新碟列表
const goToAlbumList = () => {
  router.push('/album/new')
}
</script>

<style scoped>
.discover {
  min-height: 100vh;
  color: white;
  padding: 20px;
  background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%);
}

.discover-content {
  max-width: 1400px;
  margin: 0 auto;
}

/* 顶部轮播横幅 */
.banner-section {
  position: relative;
  margin-bottom: 40px;
}

.banner-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.banner-section-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  color: white;
}

.banner-content-wrapper {
  display: flex;
  align-items: center;
  gap: 15px;
}

.banner-nav-btn {
  flex: 0 0 40px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  backdrop-filter: blur(10px);
  z-index: 10;
}

/* 热门歌单的透明箭头样式 */
.banner-nav-btn.banner-nav-transparent {
  background: transparent;
  border: 2px solid rgba(255, 255, 255, 0.6);
  backdrop-filter: none;
}

.banner-nav-btn.banner-nav-transparent:hover:not(:disabled) {
  background: transparent;
  border-color: white;
  transform: scale(1.1);
}

.banner-nav-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.banner-nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.banner-nav-btn svg {
  width: 20px;
  height: 20px;
}

.banner-carousel {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.banner-slide {
  cursor: pointer;
  transition: all 0.3s;
  border-radius: 16px;
  overflow: hidden;
}

.banner-slide:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.banner-content {
  position: relative;
  height: 180px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 20px;
  transition: all 0.3s;
}

.banner-slide:hover .banner-content {
  background-size: 110%;
}

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.75) 100%);
  z-index: 1;
}

.banner-text-content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 10px;
}

.banner-title {
  flex: 1;
  font-size: 16px;
  font-weight: 700;
  margin: 0;
  color: white;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  line-height: 1.4;
}

.banner-play-btn {
  flex: 0 0 45px;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.banner-play-btn:hover {
  background: white;
  transform: scale(1.15);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
}

.banner-play-btn svg {
  width: 18px;
  height: 18px;
  margin-left: 3px;
}

/* 内容区块 */
.content-section {
  margin-bottom: 50px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  color: white;
}

.more-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  cursor: pointer;
  transition: color 0.3s;
}

.more-btn:hover {
  color: white;
}

.more-btn svg {
  width: 16px;
  height: 16px;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 20px;
  gap: 20px;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.mini-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-state p {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

/* 轮播包装器 */
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
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  backdrop-filter: blur(10px);
  z-index: 10;
}

.carousel-nav-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
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

.carousel-nav-btn .end-text {
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
}

/* 歌单网格 */
.playlist-grid,
.album-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
}

.playlist-card,
.album-card {
  cursor: pointer;
  transition: all 0.3s;
  width: 100%;
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
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 10px;
  background: rgba(255, 255, 255, 0.05);
}

.playlist-cover img,
.album-cover img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.playlist-card:hover .playlist-cover img,
.album-card:hover .album-cover img {
  transform: scale(1.1);
}

.playlist-overlay,
.album-overlay {
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

.playlist-card:hover .playlist-overlay,
.album-card:hover .album-overlay {
  opacity: 1;
}

.play-icon {
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333;
  font-size: 20px;
  padding-left: 4px;
}

.playlist-title,
.album-title {
  font-size: 14px;
  font-weight: 500;
  margin: 0 0 5px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.9);
  min-height: 2.8em;
}

.album-artist {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 榜单行 */
.charts-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 50px;
}

.chart-section {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  padding: 25px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.chart-title {
  font-size: 22px;
  font-weight: 700;
  margin: 0;
  color: white;
}

.play-all-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.play-all-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
}

.play-all-btn svg {
  width: 18px;
  height: 18px;
  margin-left: 2px;
}

.chart-update {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  margin: 0 0 20px 0;
}

.chart-list {
  display: flex;
  flex-direction: column;
}

.chart-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.chart-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.chart-rank {
  flex: 0 0 30px;
  text-align: center;
  font-weight: 800;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.4);
}

.chart-rank.top {
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 18px;
}

.chart-song-info {
  flex: 1;
  min-width: 0;
}

.chart-song-name {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: rgba(255, 255, 255, 0.9);
}

.chart-song-artist {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chart-add-btn {
  flex: 0 0 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
}

.chart-item:hover .chart-add-btn {
  opacity: 1;
}

.chart-add-btn svg {
  width: 14px;
  height: 14px;
}

.chart-add-btn:hover {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-color: transparent;
  transform: scale(1.1);
}

.chart-empty {
  text-align: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.4);
  font-size: 14px;
}

/* 区块加载状态 */
.section-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 15px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  margin-bottom: 40px;
}

.section-loading .loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.section-loading p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

/* 查看更多按钮 */
.show-more-btn {
  width: 100%;
  padding: 12px;
  margin-top: 15px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.show-more-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.show-more-btn svg {
  width: 16px;
  height: 16px;
  transition: transform 0.3s;
}

.show-more-btn svg.rotate {
  transform: rotate(180deg);
}


/* 响应式设计 */
@media (max-width: 1200px) {
  .playlist-grid,
  .album-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .charts-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .discover {
    padding: 10px;
  }

  .banner-carousel {
    grid-template-columns: repeat(2, 1fr);
  }

  .playlist-grid,
  .album-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
  }

  .section-title {
    font-size: 20px;
  }
}

@media (max-width: 480px) {
  .playlist-grid,
  .album-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>

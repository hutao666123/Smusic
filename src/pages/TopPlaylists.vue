<template>
  <div class="top-playlists">
    <div class="page-header">
      <button class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <h1 class="page-title">热门歌单</h1>
    </div>

    <div class="playlists-grid">
      <div
        v-for="playlist in playlists"
        :key="playlist.id"
        class="playlist-card"
        @click="goToPlaylist(playlist.id)"
      >
        <div class="playlist-cover">
          <img :src="playlist.coverImgUrl" :alt="playlist.name" />
          <div class="playlist-overlay">
            <div class="play-icon">▶</div>
          </div>
          <div class="play-count">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
            </svg>
            <span>{{ formatPlayCount(playlist.playCount) }}</span>
          </div>
        </div>
        <h3 class="playlist-title">{{ playlist.name }}</h3>
        <p class="playlist-creator">by {{ playlist.creator?.nickname || '未知' }}</p>
      </div>
    </div>

    <div v-if="loading" class="loading-more">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-if="!hasMore && playlists.length > 0" class="no-more">
      <p>没有更多了</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { getTopPlaylist } from '../api/music'

const router = useRouter()
const playlists = ref([])
const loading = ref(false)
const hasMore = ref(true)
const page = ref(0)
const pageSize = 30

let scrollContainer = null

onMounted(async () => {
  await loadPlaylists()
  
  // 找到滚动容器（.app-main）
  scrollContainer = document.querySelector('.app-main')
  if (scrollContainer) {
    scrollContainer.addEventListener('scroll', handleScroll)
    console.log('✅ 滚动监听已绑定到 .app-main')
  } else {
    console.error('❌ 未找到滚动容器 .app-main')
  }
})

onUnmounted(() => {
  if (scrollContainer) {
    scrollContainer.removeEventListener('scroll', handleScroll)
  }
})

const loadPlaylists = async () => {
  if (loading.value || !hasMore.value) return
  
  loading.value = true
  try {
    const res = await getTopPlaylist(pageSize, page.value * pageSize)
    const newPlaylists = res.data.playlists || []
    
    if (newPlaylists.length === 0) {
      hasMore.value = false
    } else {
      playlists.value = [...playlists.value, ...newPlaylists]
      page.value++
    }
  } catch (error) {
    console.error('加载热门歌单失败:', error)
  } finally {
    loading.value = false
  }
}

let scrollTimer = null
const handleScroll = (e) => {
  if (scrollTimer) {
    clearTimeout(scrollTimer)
  }
  
  scrollTimer = setTimeout(() => {
    const target = e.target
    const scrollTop = target.scrollTop
    const scrollHeight = target.scrollHeight
    const clientHeight = target.clientHeight
    
    const distanceToBottom = scrollHeight - (scrollTop + clientHeight)
    
    console.log('📜 滚动检测:', {
      scrollTop,
      scrollHeight,
      clientHeight,
      distanceToBottom,
      loading: loading.value,
      hasMore: hasMore.value
    })
    
    // 距离底部100px时开始加载
    if (distanceToBottom <= 100 && !loading.value && hasMore.value) {
      loadPlaylists()
    }
  }, 100)
}

const formatPlayCount = (count) => {
  if (count >= 100000000) {
    return (count / 100000000).toFixed(1) + '亿'
  } else if (count >= 10000) {
    return (count / 10000).toFixed(1) + '万'
  }
  return count
}

const goToPlaylist = (id) => {
  router.push(`/playlist/${id}`)
}

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.top-playlists {
  min-height: 100vh;
  color: white;
  padding: 20px;
  padding-bottom: 100px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
}

.back-btn {
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
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.back-btn svg {
  width: 20px;
  height: 20px;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0;
  color: white;
}

.playlists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
  max-width: 1400px;
  margin: 0 auto;
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
  margin-bottom: 10px;
  background: rgba(255, 255, 255, 0.05);
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

.play-count {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  color: white;
  font-size: 12px;
  background: rgba(0, 0, 0, 0.6);
  padding: 4px 8px;
  border-radius: 12px;
  backdrop-filter: blur(4px);
}

.play-count svg {
  width: 14px;
  height: 14px;
}

.playlist-title {
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

.playlist-creator {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.loading-more {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  gap: 15px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-more p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.no-more {
  text-align: center;
  padding: 40px 20px;
}

.no-more p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
}

@media (max-width: 768px) {
  .playlists-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 15px;
  }

  .page-title {
    font-size: 24px;
  }
}
</style>

<template>
  <!--新碟详情页-->
  <div class="new-albums">
    <div class="page-header">
      <button class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <h1 class="page-title">新碟上架</h1>
    </div>

    <div class="albums-grid">
      <div
        v-for="album in albums"
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
        <p class="album-date">{{ formatDate(album.publishTime) }}</p>
      </div>
    </div>

    <div v-if="loading" class="loading-more">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-if="!hasMore && albums.length > 0" class="no-more">
      <p>没有更多了</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { getNewAlbums } from '../api/music'

const router = useRouter()
const albums = ref([])
const loading = ref(false)
const hasMore = ref(true)
const page = ref(0)
const pageSize = 30

let scrollContainer = null

onMounted(async () => {
  await loadAlbums()
  
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

const loadAlbums = async () => {
  if (loading.value || !hasMore.value) return
  
  loading.value = true
  try {
    const res = await getNewAlbums(pageSize, page.value * pageSize)
    const newAlbums = res.data.albums || []
    
    if (newAlbums.length === 0) {
      hasMore.value = false
    } else {
      albums.value = [...albums.value, ...newAlbums]
      page.value++
    }
  } catch (error) {
    console.error('加载新碟失败:', error)
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
    
    // 距离底部300px时开始加载
    if (distanceToBottom <= 300 && !loading.value && hasMore.value) {
      console.log('🚀 触发加载更多')
      loadAlbums()
    }
  }, 100)
}

const formatDate = (timestamp) => {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const goToAlbum = (id) => {
  router.push(`/album/${id}`)
}

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.new-albums {
  min-height: 100vh;
  background: var(--page-bg);
  color: var(--text-primary);
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
  background: var(--button-bg);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.back-btn:hover {
  background: var(--button-hover-bg);
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
  color: var(--text-primary);
}

.albums-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.album-card {
  cursor: pointer;
  transition: all 0.3s;
}

.album-card:hover {
  transform: translateY(-5px);
}

.album-cover {
  position: relative;
  width: 100%;
  padding-bottom: 100%;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 10px;
  background: rgba(255, 255, 255, 0.05);
}

.album-cover img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.album-card:hover .album-cover img {
  transform: scale(1.1);
}

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
  color: var(--text-primary);
  min-height: 2.8em;
}

.album-artist {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.album-date {
  font-size: 11px;
  color: var(--text-tertiary);
  margin: 0;
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
  border: 3px solid var(--border-color);
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
  color: var(--text-secondary);
  margin: 0;
}

.no-more {
  text-align: center;
  padding: 40px 20px;
}

.no-more p {
  font-size: 14px;
  color: var(--text-tertiary);
  margin: 0;
}

@media (max-width: 768px) {
  .albums-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 15px;
  }

  .page-title {
    font-size: 24px;
  }
}
</style>

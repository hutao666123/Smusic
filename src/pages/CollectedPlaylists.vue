<template>
  <div class="collected-playlists">

    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else class="playlists-content">
      <div v-if="collectedPlaylists.length === 0" class="empty-state">
        <div class="empty-icon">📚</div>
        <p class="empty-text">还没有收藏任何歌单</p>
        <p class="empty-hint">去发现页面收藏喜欢的歌单吧</p>
      </div>

      <div v-else class="playlists-grid">
        <div
          v-for="playlist in collectedPlaylists"
          :key="playlist.id"
          class="playlist-card"
          @click="goToPlaylist(playlist.id)"
        >
          <div class="playlist-cover">
            <img :src="playlist.coverImgUrl" :alt="playlist.name" />
            <div class="cover-overlay">
              <div class="play-icon">▶</div>
            </div>
            <div class="playlist-actions">
              <button
                class="action-btn uncollect-btn"
                @click.stop="confirmUncollect(playlist)"
                title="取消收藏"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
              <button
                class="action-btn add-btn"
                @click.stop="showAddToPlaylistDialog(playlist)"
                title="添加到歌单"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
            </div>
            <div class="play-count">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
              </svg>
              <span>{{ formatPlayCount(playlist.playCount) }}</span>
            </div>
          </div>
          <div class="playlist-info">
            <h3 class="playlist-title">{{ playlist.name }}</h3>
            <p class="playlist-meta">
              {{ playlist.trackCount }} 首歌曲 · by {{ playlist.creator?.nickname || '未知' }}
            </p>
            <div v-if="playlist.tags && playlist.tags.length > 0" class="playlist-tags">
              <span v-for="tag in playlist.tags.slice(0, 3)" :key="tag" class="tag">
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 取消收藏确认对话框 -->
    <div v-if="showUncollectDialog" class="dialog-overlay" @click="showUncollectDialog = false">
      <div class="dialog" @click.stop>
        <div class="dialog-header">
          <h3>确认取消收藏</h3>
        </div>
        <div class="dialog-body">
          <p>确定要取消收藏歌单「{{ uncollectTarget?.name }}」吗？</p>
        </div>
        <div class="dialog-footer">
          <button class="btn-cancel" @click="showUncollectDialog = false">取消</button>
          <button class="btn-danger" @click="handleUncollect">取消收藏</button>
        </div>
      </div>
    </div>

    <!-- 添加到歌单对话框 -->
    <div v-if="showAddDialog" class="dialog-overlay" @click="showAddDialog = false">
      <div class="dialog add-dialog" @click.stop>
        <div class="dialog-header">
          <h3>添加到歌单</h3>
          <button class="close-btn" @click="showAddDialog = false">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="dialog-body">
          <p class="dialog-hint">将「{{ addTarget?.name }}」的所有歌曲添加到：</p>
          <div class="playlist-list">
            <div
              v-for="playlist in targetPlaylists"
              :key="playlist.id"
              class="playlist-item"
              @click="handleAddToPlaylist(playlist.id)"
            >
              <div class="playlist-item-icon">
                {{ playlist.type === 'system' ? (playlist.id === 'local-favorites' ? '❤️' : '💾') : '🎵' }}
              </div>
              <div class="playlist-item-info">
                <div class="playlist-item-name">{{ playlist.name }}</div>
                <div class="playlist-item-count">{{ playlist.songs?.length || 0 }} 首歌曲</div>
              </div>
              <div class="playlist-item-arrow">›</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast 提示 -->
    <div v-if="toast.show" class="toast" :class="toast.type">
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePlaylistStore } from '../stores/playlist'
import { getPlaylistDetail } from '../api/music'

const router = useRouter()
const playlistStore = usePlaylistStore()

// 状态
const loading = ref(true)
const showUncollectDialog = ref(false)
const showAddDialog = ref(false)
const uncollectTarget = ref(null)
const addTarget = ref(null)
const addingToPlaylist = ref(false)
const toast = ref({
  show: false,
  message: '',
  type: 'success'
})

// 计算属性
const collectedPlaylists = computed(() => playlistStore.collectedPlaylists)
const targetPlaylists = computed(() => playlistStore.allLocalPlaylists)

// 生命周期
onMounted(async () => {
  await playlistStore.loadAllPlaylists()
  loading.value = false
})

// 跳转到歌单详情
const goToPlaylist = (id) => {
  router.push(`/playlist/${id}`)
}

// 确认取消收藏
const confirmUncollect = (playlist) => {
  uncollectTarget.value = playlist
  showUncollectDialog.value = true
}

// 执行取消收藏
const handleUncollect = async () => {
  if (!uncollectTarget.value) return

  const success = await playlistStore.uncollectOnlinePlaylist(uncollectTarget.value.id)
  if (success) {
    showToast('已取消收藏', 'success')
    showUncollectDialog.value = false
    uncollectTarget.value = null
  } else {
    showToast(playlistStore.error || '取消收藏失败', 'error')
  }
}

// 显示添加到歌单对话框
const showAddToPlaylistDialog = (playlist) => {
  addTarget.value = playlist
  showAddDialog.value = true
}

// 添加到指定歌单
const handleAddToPlaylist = async (targetPlaylistId) => {
  if (!addTarget.value || addingToPlaylist.value) return

  addingToPlaylist.value = true
  showAddDialog.value = false

  try {
    // 显示加载提示
    showToast('正在获取歌单歌曲...', 'info')

    // 获取在线歌单的详细信息
    const res = await getPlaylistDetail(addTarget.value.id)
    const tracks = res.data.playlist?.tracks || []

    if (tracks.length === 0) {
      showToast('歌单中没有歌曲', 'error')
      return
    }

    // 转换歌曲格式
    const songs = tracks.map(track => ({
      id: track.id,
      name: track.name,
      artists: track.ar || [],
      album: track.al || {},
      duration: track.dt || 0
    }))

    // 添加到目标歌单
    const result = await playlistStore.addSongsToPlaylist(targetPlaylistId, songs)

    if (result.success) {
      const targetPlaylist = targetPlaylists.value.find(p => p.id === targetPlaylistId)
      showToast(
        `成功添加 ${result.added} 首歌曲到「${targetPlaylist?.name}」${result.skipped > 0 ? `，跳过 ${result.skipped} 首重复歌曲` : ''}`,
        'success'
      )
    } else {
      showToast(playlistStore.error || '添加失败', 'error')
    }
  } catch (error) {
    console.error('添加到歌单失败:', error)
    showToast('添加失败：' + (error.message || '未知错误'), 'error')
  } finally {
    addingToPlaylist.value = false
    addTarget.value = null
  }
}

// 格式化播放次数
const formatPlayCount = (count) => {
  if (!count) return '0'
  if (count >= 100000000) {
    return (count / 100000000).toFixed(1) + '亿'
  } else if (count >= 10000) {
    return (count / 10000).toFixed(1) + '万'
  }
  return count
}

// 显示提示
const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}
</script>

<style scoped>
.collected-playlists {
  min-height: 100vh;
  background: var(--page-bg);
  color: var(--text-primary);
  padding: 20px;
  padding-bottom: 100px;
  max-width: 1400px;
  margin: 0 auto;
}

/* 页面头部 */
.page-header {
  margin-bottom: 40px;
}

.page-title {
  font-size: 36px;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 20px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid var(--border-color);
  border-top-color: #667eea;
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

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  background: var(--button-bg);
  border-radius: 12px;
  border: 2px dashed var(--border-color);
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-text {
  font-size: 18px;
  color: var(--text-secondary);
  margin: 0 0 10px 0;
}

.empty-hint {
  font-size: 14px;
  color: var(--text-tertiary);
  margin: 0;
}

/* 歌单网格 */
.playlists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

/* 歌单卡片 */
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
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
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
  transform: scale(1.05);
}

/* 封面悬停效果 */
.cover-overlay {
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

.playlist-card:hover .cover-overlay {
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

/* 播放次数 */
.play-count {
  position: absolute;
  top: 10px;
  left: 10px;
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

/* 歌单操作按钮 */
.playlist-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s;
}

.playlist-card:hover .playlist-actions {
  opacity: 1;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  backdrop-filter: blur(10px);
}

.action-btn:hover {
  transform: scale(1.1);
}

.uncollect-btn:hover {
  background: rgba(239, 68, 68, 0.9);
}

.uncollect-btn svg {
  fill: currentColor;
}

.add-btn:hover {
  background: rgba(102, 126, 234, 0.9);
}

.action-btn svg {
  width: 16px;
  height: 16px;
}

/* 歌单信息 */
.playlist-info {
  padding: 0 4px;
}

.playlist-title {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 6px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
  min-height: 2.8em;
}

.playlist-meta {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.playlist-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tag {
  font-size: 11px;
  padding: 2px 8px;
  background: rgba(102, 126, 234, 0.3);
  border-radius: 10px;
  color: var(--text-primary);
}

/* 对话框 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.dialog {
  background: var(--card-bg);
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  border: 1px solid var(--border-color);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
}

.dialog-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: var(--button-bg);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.close-btn:hover {
  background: var(--button-hover-bg);
}

.close-btn svg {
  width: 18px;
  height: 18px;
}

.dialog-body {
  padding: 24px;
}

.dialog-body p {
  margin: 0;
  font-size: 16px;
  text-align: center;
}

.dialog-hint {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 20px !important;
  text-align: left !important;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid var(--border-color);
}

.btn-cancel,
.btn-danger {
  padding: 10px 24px;
  border-radius: 8px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-cancel {
  background: var(--button-bg);
  color: var(--text-primary);
}

.btn-cancel:hover {
  background: var(--button-hover-bg);
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.btn-danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

/* 添加到歌单对话框 */
.add-dialog {
  max-width: 450px;
}

.playlist-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 400px;
  overflow-y: auto;
}

.playlist-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--button-bg);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.playlist-item:hover {
  background: rgba(102, 126, 234, 0.3);
  transform: translateX(4px);
}

.playlist-item-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  background: var(--button-bg);
  border-radius: 8px;
}

.playlist-item-info {
  flex: 1;
  min-width: 0;
}

.playlist-item-name {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.playlist-item-count {
  font-size: 12px;
  color: var(--text-secondary);
}

.playlist-item-arrow {
  font-size: 24px;
  color: var(--text-tertiary);
}

/* Toast 提示 */
.toast {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  z-index: 2000;
  animation: slideUp 0.3s ease-out;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  max-width: 90%;
  text-align: center;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.toast.success {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.toast.error {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.toast.info {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}

/* 响应式 */
@media (max-width: 768px) {
  .page-title {
    font-size: 28px;
  }

  .playlists-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
  }
}
</style>

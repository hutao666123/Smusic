<template>
  <div class="my-playlists">
    <div class="page-header">
      <h1 class="page-title">我的歌单</h1>
      <button class="create-btn" @click="showCreateDialog = true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5v14M5 12h14" />
        </svg>
        <span>新建歌单</span>
      </button>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else class="playlists-content">
      <!-- 系统歌单 -->
      <section class="playlists-section">
        <h2 class="section-title">系统歌单</h2>
        <div class="playlists-grid">
          <div
            class="playlist-card system-card"
            @click="goToPlaylist('local-favorites')"
          >
            <div class="playlist-cover favorites-cover">
              <div class="cover-icon">❤️</div>
              <div class="cover-overlay">
                <div class="play-icon">▶</div>
              </div>
            </div>
            <div class="playlist-info">
              <h3 class="playlist-title">喜欢</h3>
              <p class="playlist-meta">{{ favorites.length }} 首歌曲</p>
            </div>
          </div>

          <div
            class="playlist-card system-card"
            @click="goToPlaylist('local-downloads')"
          >
            <div class="playlist-cover downloads-cover">
              <div class="cover-icon">💾</div>
              <div class="cover-overlay">
                <div class="play-icon">▶</div>
              </div>
            </div>
            <div class="playlist-info">
              <h3 class="playlist-title">已下载</h3>
              <p class="playlist-meta">{{ downloads.length }} 首歌曲</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 自定义歌单 -->
      <section class="playlists-section">
        <h2 class="section-title">自定义歌单</h2>
        <div v-if="customPlaylists.length === 0" class="empty-state">
          <div class="empty-icon">📋</div>
          <p class="empty-text">还没有创建歌单</p>
          <button class="empty-action-btn" @click="showCreateDialog = true">
            创建第一个歌单
          </button>
        </div>
        <div v-else class="playlists-grid">
          <div
            v-for="playlist in customPlaylists"
            :key="playlist.id"
            class="playlist-card custom-card"
            @click="goToPlaylist(playlist.id)"
          >
            <div class="playlist-cover custom-cover">
              <img
                v-if="playlist.coverUrl"
                :src="playlist.coverUrl"
                :alt="playlist.name"
              />
              <div v-else class="cover-placeholder">
                <div class="placeholder-icon">🎵</div>
              </div>
              <div class="cover-overlay">
                <div class="play-icon">▶</div>
              </div>
              <div class="playlist-actions">
                <button
                  class="action-btn edit-btn"
                  @click.stop="editPlaylist(playlist)"
                  title="编辑"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button
                  class="action-btn delete-btn"
                  @click.stop="confirmDelete(playlist)"
                  title="删除"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            </div>
            <div class="playlist-info">
              <h3 class="playlist-title">{{ playlist.name }}</h3>
              <p class="playlist-meta">{{ playlist.songs?.length || 0 }} 首歌曲</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 收藏的歌单 -->
      <section v-if="collectedPlaylists.length > 0" class="playlists-section">
        <h2 class="section-title">收藏</h2>
        <div class="playlists-grid">
          <div
            v-for="playlist in collectedPlaylists"
            :key="playlist.id"
            class="playlist-card collected-card"
            @click="goToOnlinePlaylist(playlist)"
          >
            <div class="playlist-cover collected-cover">
              <img
                v-if="playlist.coverImgUrl"
                :src="playlist.coverImgUrl"
                :alt="playlist.name"
              />
              <div v-else class="cover-placeholder">
                <div class="placeholder-icon">🎵</div>
              </div>
              <div class="cover-overlay">
                <div class="play-icon">▶</div>
              </div>
              <div class="playlist-actions">
                <button
                  class="action-btn collect-btn collected"
                  @click.stop="toggleCollectPlaylist(playlist)"
                  title="取消收藏"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                </button>
              </div>
            </div>
            <div class="playlist-info">
              <h3 class="playlist-title">{{ playlist.name }}</h3>
              <p class="playlist-meta">{{ playlist.source }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 加载更多提示 -->
      <div v-if="isLoadingMore" class="loading-more">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>
    </div>

    <!-- 创建/编辑歌单对话框 -->
    <div v-if="showCreateDialog || showEditDialog" class="dialog-overlay" @click="closeDialogs">
      <div class="dialog" @click.stop>
        <div class="dialog-header">
          <h3>{{ showEditDialog ? '编辑歌单' : '新建歌单' }}</h3>
          <button class="close-btn" @click="closeDialogs">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="dialog-body">
          <div class="form-group">
            <label>歌单名称 (最多15字)</label>
            <input
              v-model="formData.name"
              type="text"
              placeholder="请输入歌单名称"
              maxlength="15"
              @keyup.enter="submitForm"
            />
            <div class="char-count">{{ formData.name.length }}/15</div>
          </div>
          <div class="form-group">
            <label>描述（可选）</label>
            <textarea
              v-model="formData.description"
              placeholder="请输入歌单描述"
              maxlength="200"
              rows="4"
            ></textarea>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn-cancel" @click="closeDialogs">取消</button>
          <button
            class="btn-confirm"
            @click="submitForm"
            :disabled="!formData.name.trim()"
          >
            {{ showEditDialog ? '保存' : '创建' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 删除确认对话框 -->
    <div v-if="showDeleteDialog" class="dialog-overlay" @click="showDeleteDialog = false">
      <div class="dialog delete-dialog" @click.stop>
        <div class="dialog-header">
          <h3>确认删除</h3>
        </div>
        <div class="dialog-body">
          <p>确定要删除歌单「{{ deleteTarget?.name }}」吗？</p>
          <p class="warning-text">此操作不可恢复</p>
        </div>
        <div class="dialog-footer">
          <button class="btn-cancel" @click="showDeleteDialog = false">取消</button>
          <button class="btn-danger" @click="handleDelete">删除</button>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePlaylistStore } from '../stores/playlist'

const router = useRouter()
const playlistStore = usePlaylistStore()

// 状态
const loading = ref(true)
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const showDeleteDialog = ref(false)
const deleteTarget = ref(null)
const editTarget = ref(null)
const formData = ref({
  name: '',
  description: ''
})
const toast = ref({
  show: false,
  message: '',
  type: 'success'
})

// 分页状态
const PAGE_SIZE = 10
const customPlaylistsPage = ref(1)
const collectedPlaylistsPage = ref(1)
const isLoadingMore = ref(false)

// 计算属性
const favorites = computed(() => playlistStore.favorites)
const downloads = computed(() => playlistStore.downloads)

// 分页后的自定义歌单
const customPlaylists = computed(() => {
  const all = playlistStore.customPlaylists || []
  return all.slice(0, customPlaylistsPage.value * PAGE_SIZE)
})

const hasMoreCustomPlaylists = computed(() => {
  const all = playlistStore.customPlaylists || []
  return all.length > customPlaylistsPage.value * PAGE_SIZE
})

// 分页后的收藏歌单
const collectedPlaylists = computed(() => {
  const all = playlistStore.collectedPlaylists || []
  return all.slice(0, collectedPlaylistsPage.value * PAGE_SIZE)
})

const hasMoreCollectedPlaylists = computed(() => {
  const all = playlistStore.collectedPlaylists || []
  return all.length > collectedPlaylistsPage.value * PAGE_SIZE
})

// 滚动监听
const handleScroll = () => {
  if (isLoadingMore.value) return
  
  const scrollTop = window.scrollY || document.documentElement.scrollTop
  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight
  
  // 距离底部 300px 时开始加载
  if (scrollTop + windowHeight >= documentHeight - 300) {
    loadMore()
  }
}

// 加载更多
const loadMore = () => {
  if (isLoadingMore.value) return
  
  let hasMore = false
  
  // 检查是否有更多自定义歌单
  if (hasMoreCustomPlaylists.value) {
    customPlaylistsPage.value++
    hasMore = true
  }
  
  // 检查是否有更多收藏歌单
  if (hasMoreCollectedPlaylists.value) {
    collectedPlaylistsPage.value++
    hasMore = true
  }
  
  if (hasMore) {
    isLoadingMore.value = true
    // 模拟加载延迟
    setTimeout(() => {
      isLoadingMore.value = false
    }, 300)
  }
}

// 生命周期
onMounted(async () => {
  // 数据已由 AppContentWrapper 加载，这里只需要关闭 loading
  loading.value = false
  
  // 添加滚动监听
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  // 移除滚动监听
  window.removeEventListener('scroll', handleScroll)
})

// 跳转到歌单详情
const goToPlaylist = (id) => {
  router.push(`/local-playlist/${id}`)
}

// 编辑歌单
const editPlaylist = (playlist) => {
  editTarget.value = playlist
  formData.value = {
    name: playlist.name,
    description: playlist.description || ''
  }
  showEditDialog.value = true
}

// 确认删除
const confirmDelete = (playlist) => {
  deleteTarget.value = playlist
  showDeleteDialog.value = true
}

// 执行删除
const handleDelete = async () => {
  if (!deleteTarget.value) return

  loading.value = true
  try {
    const result = await window.electron.deletePlaylist(deleteTarget.value.id)
    
    if (result.success) {
      // 重新加载所有歌单数据
      await playlistStore.loadAllPlaylists()
      
      showToast('歌单已删除', 'success')
      showDeleteDialog.value = false
      deleteTarget.value = null
    } else {
      showToast(result.error?.message || '删除失败', 'error')
    }
  } catch (error) {
    console.error('删除歌单失败:', error)
    showToast('删除失败', 'error')
  } finally {
    loading.value = false
  }
}

// 提交表单
const submitForm = async () => {
  if (!formData.value.name.trim()) {
    showToast('请输入歌单名称', 'error')
    return
  }

  loading.value = true
  try {
    if (showEditDialog.value) {
      // 编辑歌单
      const result = await window.electron.updatePlaylist(editTarget.value.id, {
        name: formData.value.name.trim(),
        description: formData.value.description.trim()
      })
      if (result.success) {
        // 重新加载所有歌单数据
        await playlistStore.loadAllPlaylists()
        showToast('歌单已更新', 'success')
        closeDialogs()
      } else {
        showToast(result.error?.message || '更新失败', 'error')
      }
    } else {
      // 创建歌单
      const result = await window.electron.createPlaylist(
        formData.value.name.trim(),
        formData.value.description.trim()
      )
      if (result.success) {
        // 重新加载所有歌单数据
        await playlistStore.loadAllPlaylists()
        showToast('歌单已创建', 'success')
        closeDialogs()
      } else {
        showToast(result.error?.message || '创建失败', 'error')
      }
    }
  } catch (error) {
    console.error('操作失败:', error)
    showToast('操作失败', 'error')
  } finally {
    loading.value = false
  }
}

// 关闭对话框
const closeDialogs = () => {
  showCreateDialog.value = false
  showEditDialog.value = false
  editTarget.value = null
  formData.value = {
    name: '',
    description: ''
  }
}

// 显示提示
const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

// 检查歌单是否已收藏
const isPlaylistCollected = (playlistId) => {
  return playlistStore.isCollected(playlistId)
}

// 切换收藏状态
const toggleCollectPlaylist = async (playlist) => {
  const isCollected = isPlaylistCollected(playlist.id)
  
  if (isCollected) {
    // 取消收藏
    const success = await playlistStore.uncollectOnlinePlaylist(playlist.id)
    if (success) {
      showToast('已取消收藏', 'success')
    }
  } else {
    // 收藏歌单
    const success = await playlistStore.collectOnlinePlaylist(playlist)
    if (success) {
      showToast('已收藏歌单', 'success')
    }
  }
}

// 跳转到在线歌单详情
const goToOnlinePlaylist = (playlist) => {
  // 跳转到在线歌单详情页面
  router.push(`/playlist/${playlist.id}`)
}
</script>

<style scoped>
.my-playlists {
  min-height: 100vh;
  color: white;
  padding: 20px;
  padding-bottom: 100px;
  max-width: 1400px;
  margin: 0 auto;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.create-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  color: white;
  padding: 12px 24px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.3s;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.create-btn svg {
  width: 18px;
  height: 18px;
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
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.6);
}

/* 歌单区域 */
.playlists-section {
  margin-bottom: 50px;
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 20px 0;
  color: rgba(255, 255, 255, 0.9);
}

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
}

/* 系统歌单封面 */
.favorites-cover {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.downloads-cover {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.cover-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 80px;
  opacity: 0.9;
}

/* 自定义歌单封面 */
.custom-cover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.custom-cover img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 收藏歌单封面 */
.collected-cover {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.collected-cover img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-icon {
  font-size: 60px;
  opacity: 0.7;
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

.edit-btn:hover {
  background: rgba(102, 126, 234, 0.9);
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.9);
}

.collect-btn {
  background: rgba(0, 0, 0, 0.6);
  color: rgba(255, 255, 255, 0.7);
}

.collect-btn:hover {
  background: rgba(251, 191, 36, 0.9);
  color: white;
}

.collect-btn.collected {
  background: rgba(251, 191, 36, 0.9);
  color: white;
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
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 2px dashed rgba(255, 255, 255, 0.2);
}

.empty-icon {
  font-size: 60px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-text {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 20px 0;
}

.empty-action-btn {
  background: rgba(102, 126, 234, 0.5);
  border: none;
  color: white;
  padding: 10px 24px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.empty-action-btn:hover {
  background: rgba(102, 126, 234, 0.8);
  transform: scale(1.05);
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
  background: linear-gradient(135deg, #2a2a3e 0%, #1a1a2e 100%);
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
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
  background: rgba(255, 255, 255, 0.1);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.close-btn svg {
  width: 18px;
  height: 18px;
}

.dialog-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

.form-group input,
.form-group textarea {
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 12px;
  color: white;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.3s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  background: rgba(255, 255, 255, 0.15);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.char-count {
  margin-top: 4px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  text-align: right;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-cancel,
.btn-confirm,
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
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.2);
}

.btn-confirm {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.btn-confirm:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.btn-danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

/* 删除对话框 */
.delete-dialog .dialog-body {
  text-align: center;
}

.delete-dialog .dialog-body p {
  margin: 0 0 10px 0;
  font-size: 16px;
}

.warning-text {
  color: rgba(239, 68, 68, 0.8);
  font-size: 14px !important;
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

/* 加载更多提示 */
.loading-more {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  gap: 15px;
}

.loading-more .loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-more p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
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

  .create-btn span {
    display: none;
  }
}
</style>

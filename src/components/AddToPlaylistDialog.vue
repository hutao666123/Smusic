<template>
  <div v-if="visible" class="dialog-overlay" @click.self="handleCancel">
    <div class="dialog-content">
      <!-- 头部 -->
      <div class="dialog-header">
        <h3>添加到歌单</h3>
        <button class="close-btn" @click="handleCancel">✕</button>
      </div>

      <!-- 搜索框 -->
      <div class="search-box">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索歌单..."
          class="search-input"
        />
      </div>

      <!-- 新建歌单快捷入口 -->
      <div class="create-playlist-section">
        <button class="create-playlist-btn" @click="showCreateForm = !showCreateForm">
          <span class="icon">+</span>
          <span>新建歌单</span>
        </button>
      </div>

      <!-- 新建歌单表单 -->
      <div v-if="showCreateForm" class="create-form">
        <input
          v-model="newPlaylistName"
          type="text"
          placeholder="歌单名称"
          class="form-input"
          @keyup.enter="handleCreatePlaylist"
        />
        <textarea
          v-model="newPlaylistDescription"
          placeholder="歌单描述（可选）"
          class="form-textarea"
          rows="2"
        ></textarea>
        <div class="form-actions">
          <button class="btn btn-secondary" @click="cancelCreate">取消</button>
          <button class="btn btn-primary" @click="handleCreatePlaylist" :disabled="!newPlaylistName.trim()">
            创建
          </button>
        </div>
      </div>

      <!-- 歌单列表 -->
      <div class="playlist-list">
        <div
          v-for="playlist in filteredPlaylists"
          :key="playlist.id"
          class="playlist-item"
          :class="{ selected: selectedPlaylistId === playlist.id }"
          @click="selectPlaylist(playlist.id)"
        >
          <div class="playlist-info">
            <span class="playlist-icon">{{ getPlaylistIcon(playlist) }}</span>
            <div class="playlist-text">
              <div class="playlist-name">{{ playlist.name }}</div>
              <div class="playlist-count">{{ playlist.songs?.length || 0 }} 首歌曲</div>
            </div>
          </div>
          <div v-if="selectedPlaylistId === playlist.id" class="check-icon">✓</div>
        </div>

        <div v-if="filteredPlaylists.length === 0" class="empty-state">
          <p>{{ searchQuery ? '未找到匹配的歌单' : '暂无歌单，请先创建' }}</p>
        </div>
      </div>

      <!-- 底部操作按钮 -->
      <div class="dialog-footer">
        <button class="btn btn-secondary" @click="handleCancel">取消</button>
        <button
          class="btn btn-primary"
          @click="handleConfirm"
          :disabled="!selectedPlaylistId || adding"
        >
          {{ adding ? '添加中...' : '确定' }}
        </button>
      </div>

      <!-- 结果提示 -->
      <div v-if="resultMessage" class="result-toast" :class="resultType">
        {{ resultMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { usePlaylistStore } from '../stores/playlist'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  song: {
    type: Object,
    default: null
  },
  songs: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:visible', 'success', 'cancel'])

const playlistStore = usePlaylistStore()

// 状态
const searchQuery = ref('')
const selectedPlaylistId = ref(null)
const showCreateForm = ref(false)
const newPlaylistName = ref('')
const newPlaylistDescription = ref('')
const adding = ref(false)
const resultMessage = ref('')
const resultType = ref('success') // 'success' | 'error'

// 计算属性：过滤后的歌单列表
const filteredPlaylists = computed(() => {
  // 过滤掉"已下载"歌单
  const playlists = playlistStore.allLocalPlaylists.filter(p => p.id !== 'local-downloads')
  if (!searchQuery.value.trim()) {
    return playlists
  }
  const query = searchQuery.value.toLowerCase()
  return playlists.filter(p =>
    p.name.toLowerCase().includes(query)
  )
})

// 获取歌单图标
const getPlaylistIcon = (playlist) => {
  if (playlist.id === 'local-favorites') return '❤️'
  if (playlist.id === 'local-downloads') return '💾'
  return '📋'
}

// 选择歌单
const selectPlaylist = (playlistId) => {
  selectedPlaylistId.value = playlistId
}

// 创建新歌单
const handleCreatePlaylist = async () => {
  if (!newPlaylistName.value.trim()) {
    showResultMessage('请输入歌单名称', 'error')
    return
  }

  const newPlaylist = await playlistStore.createPlaylist(
    newPlaylistName.value.trim(),
    newPlaylistDescription.value.trim()
  )

  if (newPlaylist) {
    showResultMessage('歌单创建成功', 'success')
    // 自动选中新创建的歌单
    selectedPlaylistId.value = newPlaylist.id
    // 重置表单
    cancelCreate()
  } else {
    showResultMessage(playlistStore.error || '创建歌单失败', 'error')
  }
}

// 取消创建
const cancelCreate = () => {
  showCreateForm.value = false
  newPlaylistName.value = ''
  newPlaylistDescription.value = ''
}

// 确认添加
const handleConfirm = async () => {
  if (!selectedPlaylistId.value) {
    showResultMessage('请选择一个歌单', 'error')
    return
  }

  adding.value = true

  try {
    // 判断是单曲还是多曲
    const isBatch = props.songs && props.songs.length > 0
    const songsToAdd = isBatch ? props.songs : (props.song ? [props.song] : [])

    if (songsToAdd.length === 0) {
      showResultMessage('没有要添加的歌曲', 'error')
      return
    }

    let success = false
    let message = ''

    if (isBatch) {
      // 批量添加
      const result = await playlistStore.addSongsToPlaylist(
        selectedPlaylistId.value,
        songsToAdd
      )
      success = result.success
      if (success) {
        message = `成功添加 ${result.added} 首歌曲${result.skipped > 0 ? `，跳过 ${result.skipped} 首重复` : ''}`
      }
    } else {
      // 单曲添加
      success = await playlistStore.addSongToPlaylist(
        selectedPlaylistId.value,
        songsToAdd[0]
      )
      if (success) {
        message = '添加成功'
      }
    }

    if (success) {
      showResultMessage(message, 'success')
      // 延迟关闭对话框，让用户看到成功提示
      setTimeout(() => {
        emit('success', {
          playlistId: selectedPlaylistId.value,
          songsCount: songsToAdd.length
        })
        handleClose()
      }, 1000)
    } else {
      showResultMessage(playlistStore.error || '添加失败', 'error')
    }
  } catch (error) {
    console.error('添加歌曲到歌单失败:', error)
    showResultMessage('添加失败：' + error.message, 'error')
  } finally {
    adding.value = false
  }
}

// 取消
const handleCancel = () => {
  emit('cancel')
  handleClose()
}

// 关闭对话框
const handleClose = () => {
  emit('update:visible', false)
  // 重置状态
  setTimeout(() => {
    searchQuery.value = ''
    selectedPlaylistId.value = null
    showCreateForm.value = false
    cancelCreate()
    resultMessage.value = ''
  }, 300)
}

// 显示结果消息
const showResultMessage = (message, type = 'success') => {
  resultMessage.value = message
  resultType.value = type
  setTimeout(() => {
    resultMessage.value = ''
  }, 3000)
}

// 监听对话框显示状态
watch(() => props.visible, (newVal) => {
  if (newVal) {
    // 对话框打开时，加载最新的歌单列表
    playlistStore.loadAllPlaylists()
  }
})
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.dialog-content {
  background: linear-gradient(180deg, #2a2a3e 0%, #1a1a2e 100%);
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  color: white;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: slideUp 0.3s ease-out;
  position: relative;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* 头部 */
.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.dialog-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.3s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

/* 搜索框 */
.search-box {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.search-input {
  width: 100%;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: white;
  font-size: 14px;
  outline: none;
  transition: all 0.3s;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.search-input:focus {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(102, 126, 234, 0.6);
}

/* 新建歌单 */
.create-playlist-section {
  padding: 12px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.create-playlist-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: rgba(102, 126, 234, 0.2);
  border: 1px dashed rgba(102, 126, 234, 0.5);
  border-radius: 6px;
  color: white;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.create-playlist-btn:hover {
  background: rgba(102, 126, 234, 0.3);
  border-color: rgba(102, 126, 234, 0.7);
}

.create-playlist-btn .icon {
  font-size: 16px;
}

/* 创建表单 */
.create-form {
  padding: 16px 20px;
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: white;
  font-size: 14px;
  outline: none;
  transition: all 0.3s;
  margin-bottom: 10px;
  font-family: inherit;
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.form-input:focus,
.form-textarea:focus {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(102, 126, 234, 0.6);
}

.form-textarea {
  resize: vertical;
  min-height: 60px;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

/* 歌单列表 */
.playlist-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px 20px;
  min-height: 200px;
  max-height: 300px;
}

.playlist-list::-webkit-scrollbar {
  width: 6px;
}

.playlist-list::-webkit-scrollbar-track {
  background: transparent;
}

.playlist-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.playlist-list::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.playlist-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.playlist-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.playlist-item.selected {
  background: rgba(102, 126, 234, 0.3);
  border-color: rgba(102, 126, 234, 0.6);
}

.playlist-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.playlist-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.playlist-text {
  flex: 1;
  min-width: 0;
}

.playlist-name {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.playlist-count {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 2px;
}

.check-icon {
  font-size: 20px;
  color: #667eea;
  font-weight: bold;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
}

/* 底部 */
.dialog-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 16px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* 按钮 */
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  outline: none;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* 结果提示 */
.result-toast {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  animation: toastIn 0.3s ease-out;
  z-index: 10;
}

@keyframes toastIn {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

.result-toast.success {
  background: rgba(76, 175, 80, 0.95);
  color: white;
}

.result-toast.error {
  background: rgba(244, 67, 54, 0.95);
  color: white;
}
</style>

<template>
  <n-modal 
    v-model:show="visible" 
    preset="card" 
    style="width: 600px;"
    :theme-overrides="modalTheme"
  >
    <template #header>
      <div class="drawer-header">
        <n-button type="primary" @click="showCreateDialog" :disabled="!canCreate">
          <template #icon>
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
          </template>
          创建抽屉帧
        </n-button>
        <span v-if="!canCreate" class="tip">请先播放歌曲</span>
        
        <n-tooltip placement="bottom" trigger="hover">
          <template #trigger>
            <span class="help-icon">
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="currentColor" d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/>
              </svg>
            </span>
          </template>
          <div class="help-content">
            <p><strong>抽屉帧使用说明：</strong></p>
            <p>1. 播放歌曲时点击"创建抽屉帧"</p>
            <p>2. 输入备注（如"睡前听的歌"）</p>
            <p>3. 点击抽屉帧可快速跳转并播放</p>
            <p>4. 可编辑备注或删除抽屉帧</p>
          </div>
        </n-tooltip>
      </div>
    </template>

    <div class="drawer-content">
      <!-- 抽屉帧列表 -->
      <div class="frames-list">
        <div v-if="drawerStore.frames.length === 0" class="empty">
          <svg width="64" height="64" viewBox="0 0 24 24">
            <path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
          </svg>
          <p>暂无抽屉帧</p>
        </div>

        <div v-else class="frame-item" v-for="frame in drawerStore.frames" :key="frame.id">
          <div class="frame-main" @click="jumpToFrame(frame)">
            <div class="frame-remark">{{ frame.remark || formatTime(frame.createdAt) }}</div>
            <div class="frame-info">
              <span class="song-name">🎵 {{ frame.songName }}</span>
              <span class="separator">|</span>
              <span class="playlist-name">📁 {{ frame.playlistName }}</span>
            </div>
            <div class="frame-time">{{ formatTime(frame.createdAt) }}</div>
          </div>
          <div class="frame-actions">
            <n-button text @click.stop="editFrame(frame)">
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              </svg>
            </n-button>
            <n-button text @click.stop="deleteFrame(frame)">
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
            </n-button>
          </div>
        </div>
      </div>
    </div>
  </n-modal>

  <!-- 创建/编辑对话框 -->
  <n-modal v-model:show="showInput" preset="dialog" :title="editingFrame ? '编辑备注' : '创建抽屉帧'" positive-text="确定" negative-text="取消" @positive-click="handleConfirm">
    <n-input
      v-model:value="inputRemark"
      type="textarea"
      placeholder="请输入备注（可选，不填默认填入创建时间，最多30字）"
      :maxlength="30"
      show-count
      :autosize="{ minRows: 3, maxRows: 5 }"
    />
  </n-modal>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDrawerStore } from '../stores/drawer'
import { usePlayerStore } from '../stores/player'
import { usePlaylistStore } from '../stores/playlist'
import { NModal, NButton, NInput, NTooltip, useMessage } from 'naive-ui'

// Modal 主题覆盖
const modalTheme = {
  peers: {
    Card: {
      color: 'var(--card-bg)',
      colorModal: 'var(--card-bg)',
      borderColor: 'var(--border-color)',
      titleTextColor: 'var(--text-primary)',
      textColor: 'var(--text-primary)'
    }
  }
}

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:show'])

const router = useRouter()
const drawerStore = useDrawerStore()
const playerStore = usePlayerStore()
const playlistStore = usePlaylistStore()
const message = useMessage()

const visible = computed({
  get: () => props.show,
  set: (val) => emit('update:show', val)
})

const showInput = ref(false)
const inputRemark = ref('')
const editingFrame = ref(null)

// 检查是否可以创建抽屉帧
const canCreate = computed(() => {
  return playerStore.currentSong && playerStore.currentPlaylistId
})

// 显示创建对话框
const showCreateDialog = () => {
  if (!canCreate.value) {
    message.warning('请先播放歌曲')
    return
  }
  editingFrame.value = null
  inputRemark.value = ''
  showInput.value = true
}

// 编辑抽屉帧
const editFrame = (frame) => {
  editingFrame.value = frame
  inputRemark.value = frame.remark
  showInput.value = true
}

// 确认创建/编辑
const handleConfirm = async () => {
  if (editingFrame.value) {
    // 编辑模式 - 备注可以为空
    drawerStore.updateFrameRemark(editingFrame.value.id, inputRemark.value.trim())
    message.success('备注已更新')
  } else {
    // 创建模式
    const song = playerStore.currentSong
    const playlistId = playerStore.currentPlaylistId
    
    // 获取歌单名称 - 使用 currentPlaylistId 对应的实际歌单
    let playlistName = '未知歌单'
    
    // 先尝试从本地歌单获取
    const localPlaylist = playlistStore.getPlaylistById(playlistId)
    if (localPlaylist) {
      playlistName = localPlaylist.name
    } else {
      // 如果是在线歌单，尝试从收藏列表获取
      const collectedPlaylist = playlistStore.collectedPlaylists.find(p => p.id === playlistId)
      if (collectedPlaylist) {
        playlistName = collectedPlaylist.name
      } else {
        // 都找不到时，使用默认名称
        playlistName = `歌单 ${playlistId}`
      }
    }

    drawerStore.createFrame(
      inputRemark.value.trim(),
      song.id,
      song.name,
      playlistId,
      playlistName
    )
    message.success('抽屉帧已创建')
  }

  return true
}

// 删除抽屉帧
const deleteFrame = (frame) => {
  drawerStore.deleteFrame(frame.id)
  message.success('已删除')
}

// 跳转到抽屉帧
const jumpToFrame = async (frame) => {
  const playlistId = frame.playlistId
  const songId = frame.songId
  
  // 判断歌单类型
  let playlistType = 'online'
  if (playlistId.startsWith('local-')) {
    playlistType = 'local'
  }

  // 构建目标路由
  const targetRoute = playlistType === 'local'
    ? {
        name: 'LocalPlaylist',
        params: { id: playlistId },
        query: { highlight: songId, autoplay: 'true' }
      }
    : {
        name: 'Playlist',
        params: { id: playlistId },
        query: { highlight: songId, autoplay: 'true' }
      }

  // 检查是否在同一个路由
  const currentRoute = router.currentRoute.value
  const isSameRoute = currentRoute.name === targetRoute.name && 
                      currentRoute.params.id === targetRoute.params.id

  // 关闭弹窗
  visible.value = false
  message.success(`正在跳转到：${frame.remark || '抽屉帧'}`)

  if (isSameRoute) {
    // 如果在同一个路由，先跳转到搜索页面再跳回来
    await router.push('/search')
    await router.push(targetRoute)
  } else {
    // 不同路由直接跳转
    router.push(targetRoute)
  }
}

// 格式化时间
const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}
</script>

<style scoped>
:deep(.n-card) {
  background: var(--card-bg) !important;
  backdrop-filter: blur(20px);
  color: var(--text-primary);
}

:deep(.n-card__header) {
  border-bottom: 1px solid var(--border-color);
  background: transparent;
}

:deep(.n-card__content) {
  background: transparent;
}

:deep(.n-modal-mask) {
  backdrop-filter: blur(4px);
}

.drawer-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tip {
  font-size: 12px;
  color: var(--text-secondary);
}

.help-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: help;
  color: var(--text-secondary);
  transition: color 0.2s;
  margin-left: auto;
}

.help-icon:hover {
  color: var(--text-primary);
}

.help-content {
  max-width: 280px;
  line-height: 1.6;
}

.help-content p {
  margin: 0 0 8px 0;
  font-size: 13px;
}

.help-content p:last-child {
  margin-bottom: 0;
}

.help-content strong {
  color: var(--text-primary);
  display: block;
  margin-bottom: 8px;
}

.drawer-content {
  display: flex;
  flex-direction: column;
}

.frames-list {
  max-height: 500px;
  overflow-y: auto;
}

.frames-list::-webkit-scrollbar {
  width: 6px;
}

.frames-list::-webkit-scrollbar-track {
  background: transparent;
}

.frames-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.frames-list::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--text-secondary);
}

.empty svg {
  opacity: 0.3;
  margin-bottom: 16px;
}

.empty p {
  margin: 0;
  font-size: 14px;
}

.frame-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background: var(--button-bg, rgba(255, 255, 255, 0.05));
  margin-bottom: 8px;
  transition: all 0.2s;
}

.frame-item:hover {
  background: var(--button-hover-bg, rgba(255, 255, 255, 0.08));
}

.frame-main {
  flex: 1;
  cursor: pointer;
}

.frame-remark {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 6px;
  min-height: 24px;
}

.frame-remark:empty::before {
  content: attr(data-placeholder);
  color: var(--text-tertiary);
  font-style: italic;
}

.frame-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.separator {
  opacity: 0.5;
}

.frame-time {
  font-size: 12px;
  color: var(--text-tertiary);
}

.frame-actions {
  display: flex;
  gap: 4px;
}

.frame-actions :deep(.n-button) {
  color: var(--text-secondary);
}

.frame-actions :deep(.n-button:hover) {
  color: var(--text-primary);
}
</style>

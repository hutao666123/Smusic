<template>
  <div v-if="visible" class="download-manager-overlay" @click.self="handleClose">
    <div class="download-manager-content">
      <!-- 头部 -->
      <div class="manager-header">
        <h3>下载管理</h3>
        <button class="close-btn" @click="handleClose">✕</button>
      </div>

      <!-- 统计信息 -->
      <div class="stats-section">
        <div class="stat-item">
          <div class="stat-label">总任务</div>
          <div class="stat-value">{{ totalTasks }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">进行中</div>
          <div class="stat-value active">{{ activeTasks.length }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">已完成</div>
          <div class="stat-value success">{{ completedTasks.length }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">失败</div>
          <div class="stat-value error">{{ failedTasks.length }}</div>
        </div>
      </div>

      <!-- 总体进度 -->
      <div v-if="activeTasks.length > 0" class="overall-progress">
        <div class="progress-info">
          <span>总体进度</span>
          <span class="progress-percent">{{ totalProgress }}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: totalProgress + '%' }"></div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="actions-section">
        <button
          class="action-btn"
          @click="clearCompletedTasks"
          :disabled="completedTasks.length === 0"
        >
          清除已完成
        </button>
        <button
          class="action-btn"
          @click="clearFailedTasks"
          :disabled="failedTasks.length === 0"
        >
          清除失败
        </button>
        <button
          class="action-btn danger"
          @click="clearAllTasks"
          :disabled="totalTasks === 0"
        >
          清除全部
        </button>
      </div>

      <!-- 任务列表 -->
      <div class="tasks-list">
        <div v-if="allTasks.length === 0" class="empty-state">
          <div class="empty-icon">📥</div>
          <p>暂无下载任务</p>
        </div>

        <div
          v-for="task in allTasks"
          :key="task.id"
          class="task-item"
          :class="'status-' + task.status"
        >
          <!-- 任务信息 -->
          <div class="task-info">
            <div class="task-icon">{{ getTaskIcon(task.status) }}</div>
            <div class="task-details">
              <div class="task-name">{{ task.songName }}</div>
              <div class="task-meta">
                <span v-if="task.artists && task.artists.length > 0">
                  {{ task.artists.map(a => a.name).join(', ') }}
                </span>
                <span v-if="task.status === 'downloading'" class="task-speed">
                  {{ formatSpeed(task.speed) }}
                </span>
                <span v-if="task.status === 'failed' && task.error" class="task-error">
                  {{ task.error }}
                </span>
              </div>
            </div>
          </div>

          <!-- 进度条 -->
          <div v-if="task.status === 'downloading' || task.status === 'pending'" class="task-progress">
            <div class="progress-bar small">
              <div class="progress-fill" :style="{ width: task.progress + '%' }"></div>
            </div>
            <span class="progress-text">{{ task.progress }}%</span>
          </div>

          <!-- 状态标签 -->
          <div class="task-status">
            <span class="status-badge" :class="'badge-' + task.status">
              {{ getStatusText(task.status) }}
            </span>
          </div>

          <!-- 操作按钮 -->
          <div class="task-actions">
            <button
              v-if="task.status === 'downloading'"
              class="task-btn"
              @click="handlePause(task.id)"
              title="暂停"
            >
              ⏸
            </button>
            <button
              v-if="task.status === 'paused'"
              class="task-btn"
              @click="handleResume(task.id)"
              title="恢复"
            >
              ▶
            </button>
            <button
              v-if="task.status === 'failed'"
              class="task-btn"
              @click="handleRetry(task.id)"
              title="重试"
            >
              🔄
            </button>
            <button
              v-if="task.status === 'downloading' || task.status === 'pending' || task.status === 'paused'"
              class="task-btn danger"
              @click="handleCancel(task.id)"
              title="取消"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDownloadStore } from '../stores/download'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible', 'close'])

const downloadStore = useDownloadStore()

// 计算属性
const allTasks = computed(() => {
  return Array.from(downloadStore.downloadTasks.values()).sort((a, b) => {
    // 按开始时间倒序排列（最新的在前）
    return b.startTime - a.startTime
  })
})

const totalTasks = computed(() => allTasks.value.length)

const activeTasks = computed(() => downloadStore.activeTasks)
const completedTasks = computed(() => downloadStore.completedTasks)
const failedTasks = computed(() => downloadStore.failedTasks)
const totalProgress = computed(() => downloadStore.totalProgress)

// 方法
const getTaskIcon = (status) => {
  const icons = {
    pending: '⏳',
    downloading: '⬇️',
    completed: '✅',
    failed: '❌',
    cancelled: '🚫',
    paused: '⏸️'
  }
  return icons[status] || '📥'
}

const getStatusText = (status) => {
  const texts = {
    pending: '等待中',
    downloading: '下载中',
    completed: '已完成',
    failed: '失败',
    cancelled: '已取消',
    paused: '已暂停'
  }
  return texts[status] || status
}

const formatSpeed = (speed) => {
  if (!speed || speed === 0) return '0 KB/s'
  
  if (speed < 1024) {
    return `${speed.toFixed(0)} B/s`
  } else if (speed < 1024 * 1024) {
    return `${(speed / 1024).toFixed(1)} KB/s`
  } else {
    return `${(speed / (1024 * 1024)).toFixed(2)} MB/s`
  }
}

const handlePause = async (taskId) => {
  await downloadStore.pauseDownload(taskId)
}

const handleResume = async (taskId) => {
  await downloadStore.resumeDownload(taskId)
}

const handleCancel = async (taskId) => {
  if (confirm('确定要取消这个下载任务吗？')) {
    await downloadStore.cancelDownload(taskId)
  }
}

const handleRetry = async (taskId) => {
  await downloadStore.retryFailedTask(taskId)
}

const clearCompletedTasks = () => {
  if (confirm('确定要清除所有已完成的任务吗？')) {
    downloadStore.clearCompletedTasks()
  }
}

const clearFailedTasks = () => {
  if (confirm('确定要清除所有失败的任务吗？')) {
    downloadStore.clearFailedTasks()
  }
}

const clearAllTasks = () => {
  if (confirm('确定要清除所有任务吗？这将清除所有下载记录。')) {
    downloadStore.clearAllTasks()
  }
}

const handleClose = () => {
  emit('update:visible', false)
  emit('close')
}
</script>

<style scoped>
.download-manager-overlay {
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

.download-manager-content {
  background: var(--card-bg);
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  color: var(--text-primary);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  border: 1px solid var(--border-color);
  animation: slideUp 0.3s ease-out;
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
.manager-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
}

.manager-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
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
  background: var(--button-bg);
  color: var(--text-primary);
}

/* 统计信息 */
.stats-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
}

.stat-item {
  text-align: center;
}

.stat-label {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
}

.stat-value.active {
  color: #667eea;
}

.stat-value.success {
  color: #4caf50;
}

.stat-value.error {
  color: #f44336;
}

/* 总体进度 */
.overall-progress {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
}

.progress-percent {
  font-weight: 600;
  color: #667eea;
}

.progress-bar {
  height: 8px;
  background: var(--border-color);
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar.small {
  height: 4px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

/* 操作按钮区 */
.actions-section {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
}

.action-btn {
  flex: 1;
  padding: 10px 16px;
  background: var(--button-bg);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
}

.action-btn:hover:not(:disabled) {
  background: var(--button-hover-bg);
  border-color: var(--border-color);
}

.action-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.action-btn.danger {
  background: rgba(244, 67, 54, 0.2);
  border-color: rgba(244, 67, 54, 0.4);
}

.action-btn.danger:hover:not(:disabled) {
  background: rgba(244, 67, 54, 0.3);
  border-color: rgba(244, 67, 54, 0.6);
}

/* 任务列表 */
.tasks-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px 20px;
  min-height: 300px;
}

.tasks-list::-webkit-scrollbar {
  width: 6px;
}

.tasks-list::-webkit-scrollbar-track {
  background: transparent;
}

.tasks-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.tasks-list::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state p {
  font-size: 14px;
  margin: 0;
}

/* 任务项 */
.task-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  margin-bottom: 12px;
  background: var(--button-bg);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  transition: all 0.3s;
}

.task-item:hover {
  background: var(--button-hover-bg);
  border-color: var(--border-color);
}

.task-item.status-completed {
  opacity: 0.7;
}

.task-item.status-failed {
  border-color: rgba(244, 67, 54, 0.3);
}

.task-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.task-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.task-details {
  flex: 1;
  min-width: 0;
}

.task-name {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.task-meta {
  font-size: 12px;
  color: var(--text-secondary);
  display: flex;
  gap: 12px;
  align-items: center;
}

.task-speed {
  color: #667eea;
  font-weight: 500;
}

.task-error {
  color: #f44336;
}

.task-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 150px;
  flex-shrink: 0;
}

.task-progress .progress-bar {
  flex: 1;
}

.progress-text {
  font-size: 12px;
  color: var(--text-primary);
  width: 40px;
  text-align: right;
}

.task-status {
  flex-shrink: 0;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.badge-pending {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
}

.status-badge.badge-downloading {
  background: rgba(102, 126, 234, 0.2);
  color: #667eea;
}

.status-badge.badge-completed {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}

.status-badge.badge-failed {
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
}

.status-badge.badge-cancelled {
  background: rgba(158, 158, 158, 0.2);
  color: #9e9e9e;
}

.status-badge.badge-paused {
  background: rgba(255, 152, 0, 0.2);
  color: #ff9800;
}

.task-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.task-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--button-bg);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.task-btn:hover {
  background: var(--button-hover-bg);
  border-color: var(--border-color);
  transform: scale(1.05);
}

.task-btn.danger {
  background: rgba(244, 67, 54, 0.2);
  border-color: rgba(244, 67, 54, 0.4);
}

.task-btn.danger:hover {
  background: rgba(244, 67, 54, 0.3);
  border-color: rgba(244, 67, 54, 0.6);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .download-manager-content {
    width: 95%;
    max-height: 90vh;
  }

  .stats-section {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .task-item {
    flex-wrap: wrap;
  }

  .task-progress {
    width: 100%;
    order: 3;
  }

  .task-status {
    order: 2;
  }

  .task-actions {
    order: 4;
  }
}
</style>

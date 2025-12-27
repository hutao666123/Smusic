<template>
  <div v-if="isVisible" class="download-panel">
    <!-- 面板头部 -->
    <div class="panel-header">
      <div class="header-title">
        <span class="title-icon">⬇️</span>
        <span class="title-text">下载列表</span>
        <span class="task-count">({{ tasks.length }})</span>
      </div>
      <div class="header-actions">
        <button 
          v-if="hasActiveTasks" 
          @click="togglePause" 
          class="action-btn pause-btn"
          :title="isPaused ? '继续' : '暂停'"
        >
          {{ isPaused ? '▶️' : '⏸️' }}
        </button>
        <button @click="togglePanel" class="action-btn close-btn" title="关闭">
          ✕
        </button>
      </div>
    </div>

    <!-- 总体进度 -->
    <div class="overall-progress">
      <div class="progress-info">
        <span class="progress-label">总体进度</span>
        <span class="progress-stats">
          {{ completedCount }}/{{ tasks.length }}
          <span v-if="failedCount > 0" class="failed-count">(失败: {{ failedCount }})</span>
        </span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: overallProgress + '%' }"></div>
      </div>
      <div class="progress-percentage">{{ overallProgress }}%</div>
    </div>

    <!-- 任务列表 -->
    <div class="tasks-container">
      <div 
        v-for="task in tasks" 
        :key="task.id"
        class="task-item"
        :class="{ 
          'task-completed': task.status === 'completed',
          'task-failed': task.status === 'failed',
          'task-downloading': task.status === 'downloading',
          'task-pending': task.status === 'pending'
        }"
      >
        <!-- 任务状态图标 -->
        <div class="task-status-icon">
          <span v-if="task.status === 'completed'" class="icon">✓</span>
          <span v-else-if="task.status === 'failed'" class="icon">✕</span>
          <span v-else-if="task.status === 'downloading'" class="icon spinning">⟳</span>
          <span v-else class="icon">⋯</span>
        </div>

        <!-- 任务信息 -->
        <div class="task-info">
          <div class="task-name">{{ task.songName }}</div>
          <div class="task-details">
            <span v-if="task.status === 'downloading'" class="detail-item">
              {{ formatSize(task.downloadedSize) }}/{{ formatSize(task.totalSize) }}
            </span>
            <span v-else-if="task.status === 'completed'" class="detail-item">
              {{ formatSize(task.fileSize) }}
            </span>
            <span v-else-if="task.status === 'failed'" class="detail-item error">
              {{ task.error || '下载失败' }}
            </span>
            <span v-else class="detail-item">等待中...</span>
          </div>
        </div>

        <!-- 进度条 -->
        <div v-if="task.status === 'downloading'" class="task-progress">
          <div class="progress-bar-small">
            <div class="progress-fill-small" :style="{ width: task.progress + '%' }"></div>
          </div>
          <span class="progress-text">{{ task.progress }}%</span>
        </div>

        <!-- 速度信息 -->
        <div v-if="task.status === 'downloading'" class="task-speed">
          {{ formatSpeed(task.speed) }}
        </div>

        <!-- 操作按钮 -->
        <div class="task-actions">
          <button 
            v-if="task.status === 'failed'"
            @click="retryTask(task.id)"
            class="action-btn retry-btn"
            title="重试"
          >
            🔄
          </button>
          <button 
            v-if="task.status !== 'completed' && task.status !== 'failed'"
            @click="cancelTask(task.id)"
            class="action-btn cancel-btn"
            title="取消"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="tasks.length === 0" class="empty-state">
        <div class="empty-icon">📥</div>
        <div class="empty-text">稍等...</div>
      </div>
    </div>

    <!-- 面板底部统计 -->
    <div class="panel-footer">
      <div class="stats">
        <span class="stat-item">
          <span class="stat-label">成功:</span>
          <span class="stat-value success">{{ completedCount }}</span>
        </span>
        <span class="stat-item">
          <span class="stat-label">失败:</span>
          <span class="stat-value error">{{ failedCount }}</span>
        </span>
        <span class="stat-item">
          <span class="stat-label">进行中:</span>
          <span class="stat-value">{{ downloadingCount }}</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useDownloadStore } from '@/stores/download'

const downloadStore = useDownloadStore()

const isVisible = ref(false)
const isPaused = ref(false)
const tasks = ref([])

// 计算属性
const completedCount = computed(() => tasks.value.filter(t => t.status === 'completed').length)
const failedCount = computed(() => tasks.value.filter(t => t.status === 'failed').length)
const downloadingCount = computed(() => tasks.value.filter(t => t.status === 'downloading').length)
const hasActiveTasks = computed(() => downloadingCount.value > 0)

const overallProgress = computed(() => {
  if (tasks.value.length === 0) return 0
  const completed = completedCount.value + failedCount.value
  return Math.round((completed / tasks.value.length) * 100)
})

// 格式化文件大小
const formatSize = (bytes) => {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  return size.toFixed(2) + ' ' + units[unitIndex]
}

// 格式化速度
const formatSpeed = (bytesPerSecond) => {
  if (!bytesPerSecond) return '0 B/s'
  return formatSize(bytesPerSecond) + '/s'
}

// 切换面板显示
const togglePanel = () => {
  if (isVisible.value) {
    // 关闭时清空任务列表
    downloadStore.clearAllTasks()
  }
  isVisible.value = !isVisible.value
}

// 暂停/继续
const togglePause = () => {
  isPaused.value = !isPaused.value
  // TODO: 实现暂停/继续逻辑
}

// 重试任务
const retryTask = (taskId) => {
  // TODO: 实现重试逻辑
}

// 取消任务
const cancelTask = (taskId) => {
  downloadStore.cancelDownload(taskId)
}

// 更新任务列表
const updateTasks = () => {
  const allTasks = Array.from(downloadStore.downloadTasks.values())
  tasks.value = allTasks.map(task => ({
    id: task.id,
    songId: task.songId,
    songName: task.songName,
    status: task.status,
    progress: task.progress || 0,
    downloadedSize: task.downloadedSize || 0,
    totalSize: task.totalSize || 0,
    fileSize: task.fileSize || 0,
    speed: task.speed || 0,
    error: task.error
  }))
}

// 监听下载任务变化（在顶层调用）
watch(() => downloadStore.downloadTasks, () => {
  updateTasks()
}, { deep: true })

// 定期更新任务列表（备用方案，确保实时更新）
let updateInterval = null

onMounted(() => {
  // 初始化任务列表
  updateTasks()
  
  // 启动定期更新
  updateInterval = setInterval(() => {
    updateTasks()
  }, 300)
})

onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
  }
})

// 暴露切换方法给父组件
defineExpose({
  togglePanel,
  show: () => { isVisible.value = true },
  hide: () => { isVisible.value = false }
})
</script>

<style scoped>
.download-panel {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 400px;
  max-height: 600px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  background: linear-gradient(135deg, #2fbae4 0%, #a5e96d 100%);
  color: white;
  border-radius: 12px 12px 0 0;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 14px;
}

.title-icon {
  font-size: 16px;
}

.task-count {
  opacity: 0.8;
  font-size: 12px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.overall-progress {
  padding: 12px 16px;
  background: #f9f9f9;
  border-bottom: 1px solid #f0f0f0;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 12px;
}

.progress-label {
  color: #666;
  font-weight: 500;
}

.progress-stats {
  color: #333;
  font-weight: 600;
}

.failed-count {
  color: #ff4757;
  margin-left: 4px;
}

.progress-bar {
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 4px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
}

.progress-percentage {
  text-align: right;
  font-size: 12px;
  color: #666;
  font-weight: 600;
}

.tasks-container {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  margin-bottom: 8px;
  background: #f9f9f9;
  border-radius: 8px;
  border-left: 3px solid #ddd;
  transition: all 0.2s;
}

.task-item:hover {
  background: #f5f5f5;
}

.task-completed {
  border-left-color: #2ed573;
  background: #f0fdf4;
}

.task-failed {
  border-left-color: #ff4757;
  background: #fef2f2;
}

.task-downloading {
  border-left-color: #667eea;
  background: #f0f4ff;
}

.task-pending {
  border-left-color: #ffa502;
  background: #fffbf0;
}

.task-status-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
}

.task-completed .icon {
  color: #2ed573;
}

.task-failed .icon {
  color: #ff4757;
}

.task-downloading .icon {
  color: #667eea;
}

.task-pending .icon {
  color: #ffa502;
}

.icon.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.task-info {
  flex: 1;
  min-width: 0;
}

.task-name {
  font-size: 13px;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.task-details {
  font-size: 11px;
  color: #999;
}

.detail-item {
  display: inline-block;
}

.detail-item.error {
  color: #ff4757;
}

.task-progress {
  flex-shrink: 0;
  width: 60px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.progress-bar-small {
  flex: 1;
  height: 4px;
  background: #e0e0e0;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill-small {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 10px;
  color: #666;
  font-weight: 600;
  min-width: 24px;
  text-align: right;
}

.task-speed {
  flex-shrink: 0;
  font-size: 11px;
  color: #667eea;
  font-weight: 600;
  min-width: 50px;
  text-align: right;
}

.task-actions {
  flex-shrink: 0;
  display: flex;
  gap: 4px;
}

.retry-btn,
.cancel-btn {
  background: transparent;
  border: 1px solid #ddd;
  color: #666;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.2s;
}

.retry-btn:hover {
  background: #fff;
  border-color: #667eea;
  color: #667eea;
}

.cancel-btn:hover {
  background: #fff;
  border-color: #ff4757;
  color: #ff4757;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #999;
}

.empty-icon {
  font-size: 32px;
  margin-bottom: 8px;
  animation: bounce 1.5s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.empty-text {
  font-size: 12px;
  font-weight: 500;
}

.panel-footer {
  padding: 12px 16px;
  border-top: 1px solid #f0f0f0;
  background: #f9f9f9;
  border-radius: 0 0 12px 12px;
}

.stats {
  display: flex;
  justify-content: space-around;
  font-size: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-label {
  color: #666;
}

.stat-value {
  font-weight: 600;
  color: #333;
}

.stat-value.success {
  color: #2ed573;
}

.stat-value.error {
  color: #ff4757;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .download-panel {
    width: 320px;
    max-height: 500px;
    bottom: 10px;
    right: 10px;
  }
  
  .task-speed {
    display: none;
  }
}
</style>

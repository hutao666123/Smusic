<template>
  <div v-if="visible" class="dialog-overlay" @click.self="handleClose">
    <div class="dialog download-progress-dialog">
      <div class="dialog-header">
        <h3>批量下载进度</h3>
        <button class="close-btn" @click="handleClose" :disabled="isDownloading">×</button>
      </div>
      
      <div class="dialog-body">
        <div class="progress-summary">
          <div class="summary-item">
            <span class="label">总计：</span>
            <span class="value">{{ total }} 首</span>
          </div>
          <div class="summary-item success">
            <span class="label">成功：</span>
            <span class="value">{{ completed }} 首</span>
          </div>
          <div class="summary-item" v-if="skipped > 0">
            <span class="label">跳过：</span>
            <span class="value">{{ skipped }} 首</span>
          </div>
          <div class="summary-item error" v-if="failed > 0">
            <span class="label">失败：</span>
            <span class="value">{{ failed }} 首</span>
          </div>
        </div>
        
        <div class="progress-bar-container">
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: progressPercent + '%' }"
            ></div>
          </div>
          <div class="progress-text">{{ progressPercent }}%</div>
        </div>
        
        <div class="status-text">
          <span v-if="isDownloading">正在下载...</span>
          <span v-else-if="completed + skipped + failed === total">下载完成</span>
          <span v-else>准备中...</span>
        </div>
      </div>
      
      <div class="dialog-footer">
        <button 
          class="btn-primary" 
          @click="handleClose"
          :disabled="isDownloading"
        >
          {{ isDownloading ? '下载中...' : '关闭' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  total: {
    type: Number,
    default: 0
  },
  completed: {
    type: Number,
    default: 0
  },
  failed: {
    type: Number,
    default: 0
  },
  skipped: {
    type: Number,
    default: 0
  },
  isDownloading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible', 'close'])

const progressPercent = computed(() => {
  if (props.total === 0) return 0
  const current = props.completed + props.failed + props.skipped
  return Math.round((current / props.total) * 100)
})

const handleClose = () => {
  if (!props.isDownloading) {
    emit('update:visible', false)
    emit('close')
  }
}
</script>

<style scoped>
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
  z-index: 2000;
  backdrop-filter: blur(4px);
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

.dialog {
  background: linear-gradient(135deg, #2a2a3e 0%, #1a1a2e 100%);
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
  color: white;
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.close-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(90deg);
}

.close-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dialog-body {
  padding: 24px;
  color: white;
}

.progress-summary {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
}

.summary-item .label {
  color: rgba(255, 255, 255, 0.7);
}

.summary-item .value {
  font-weight: 600;
  color: white;
}

.summary-item.success .value {
  color: #10b981;
}

.summary-item.error .value {
  color: #ef4444;
}

.progress-bar-container {
  margin-bottom: 16px;
}

.progress-bar {
  width: 100%;
  height: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 6px;
  transition: width 0.3s ease;
  box-shadow: 0 0 10px rgba(102, 126, 234, 0.5);
}

.progress-text {
  text-align: center;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
}

.status-text {
  text-align: center;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 12px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  padding: 20px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-primary {
  padding: 10px 24px;
  border-radius: 8px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}
</style>

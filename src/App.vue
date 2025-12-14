<template>
  <n-config-provider>
    <n-message-provider>
      <n-dialog-provider>
        <n-notification-provider>
          <app-content-wrapper />
          
          <!-- API健康检查弹窗 -->
          <n-modal
            v-model:show="showHealthCheck"
            :mask-closable="true"
            :close-on-esc="true"
            preset="card"
            :style="{ width: '400px' }"
            :bordered="false"
            :closable="true"
            @close="handleCloseHealthCheck"
          >
            <template #header>
              <div style="display: flex; align-items: center; gap: 12px;">
                <n-spin v-if="healthCheckStatus === 'checking'" size="small" />
                <n-icon v-else-if="healthCheckStatus === 'success'" size="24" color="#4ade80">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </n-icon>
                <n-icon v-else-if="healthCheckStatus === 'timeout'" size="24" color="#f87171">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                </n-icon>
                <span style="font-size: 16px; font-weight: 500;">
                  {{ healthCheckTitle }}
                </span>
              </div>
            </template>
            
            <div style="padding: 20px 0; text-align: center; font-size: 14px; color: #666;">
              {{ healthCheckMessage }}
            </div>
          </n-modal>
        </n-notification-provider>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup>
import { defineComponent, h, onMounted, ref, computed } from 'vue'
import { useMessage, useDialog, useNotification, NModal, NSpin, NIcon } from 'naive-ui'
import { setupNotification } from './utils/notification'
import { useThemeStore } from './stores/theme'
import AppContentWrapper from './components/AppContentWrapper.vue'
import './styles/theme.css'
import './styles/accent-colors.css'

const themeStore = useThemeStore()

// API健康检查状态
const showHealthCheck = ref(false)
const healthCheckStatus = ref('checking') // 'checking' | 'success' | 'timeout'

const healthCheckTitle = computed(() => {
  switch (healthCheckStatus.value) {
    case 'checking':
      return 'API服务检测'
    case 'success':
      return '检测成功'
    case 'timeout':
      return '检测超时'
    default:
      return 'API服务检测'
  }
})

const healthCheckMessage = computed(() => {
  switch (healthCheckStatus.value) {
    case 'checking':
      return '正在检测API服务...'
    case 'success':
      return '服务启动成功！'
    case 'timeout':
      return '服务未响应，请重启应用'
    default:
      return ''
  }
})

// 定时器ID，用于清理
let checkIntervalId = null

// 关闭健康检查弹窗
const handleCloseHealthCheck = () => {
  showHealthCheck.value = false
  if (checkIntervalId) {
    clearInterval(checkIntervalId)
    checkIntervalId = null
  }
}

// API健康检查函数
const checkApiHealth = async () => {
  showHealthCheck.value = true
  healthCheckStatus.value = 'checking'
  
  const startTime = Date.now()
  const timeout = 30000 // 30秒超时
  const checkInterval = 1000 // 每1秒检测一次
  
  const checkApi = async () => {
    try {
      // 使用 no-cors 模式避免 CORS 错误
      const response = await fetch('http://localhost:3000/', {
        method: 'GET',
        mode: 'no-cors',
        cache: 'no-cache'
      })
      
      // no-cors 模式下，response.type 为 'opaque'，无法读取状态码
      // 但只要不抛出异常，就说明服务在运行
      healthCheckStatus.value = 'success'
      
      // 标记本次会话已完成检查
      sessionStorage.setItem('api-health-checked', 'true')
      
      // 1秒后自动关闭并刷新页面
      setTimeout(() => {
        showHealthCheck.value = false
        window.location.reload()
      }, 1000)
      
      return true
    } catch (error) {
      // 继续检测
      return false
    }
  }
  
  // 开始轮询检测
  checkIntervalId = setInterval(async () => {
    const elapsed = Date.now() - startTime
    
    if (elapsed >= timeout) {
      // 超时
      clearInterval(checkIntervalId)
      checkIntervalId = null
      healthCheckStatus.value = 'timeout'
      return
    }
    
    const success = await checkApi()
    if (success) {
      clearInterval(checkIntervalId)
      checkIntervalId = null
    }
  }, checkInterval)
  
  // 立即执行第一次检测
  const success = await checkApi()
  if (success) {
    clearInterval(checkIntervalId)
    checkIntervalId = null
  }
}

onMounted(() => {
  // 初始化主题
  themeStore.initTheme()
  
  // 使用 sessionStorage，每次应用启动（新会话）时检测一次
  // 刷新页面不会触发，只有关闭应用重新打开才会触发
  const hasChecked = sessionStorage.getItem('api-health-checked')
  
  if (!hasChecked) {
    // 本次会话第一次启动，进行健康检查
    checkApiHealth()
  }
})
</script>

<style>
/* 全局飞行音符动画 */
.flying-note {
  position: fixed;
  font-size: 32px;
  font-weight: bold;
  color: #4ade80;
  pointer-events: none;
  z-index: 9999;
  transform-origin: center center;
  transition: all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  text-shadow: 0 2px 8px rgba(74, 222, 128, 0.5);
  opacity: 1;
}
</style>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
}

.app-content {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative; /* 为歌词面板提供定位上下文 */
}

.app-main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-main {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.app-footer {
  background: rgba(0, 0, 0, 0.5);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 10px 20px;
}

/* 隐藏主内容区域滚动条 */
.app-main::-webkit-scrollbar {
  display: none;
}

.app-main {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
</style>

<template>
  <div class="app-container">
    <!-- 自定义标题栏 -->
    <title-bar />
    
    <div class="app-content">
      <!-- 左侧导航栏 -->
      <sidebar />

      <!-- 主体区域 -->
      <div class="app-main-wrapper">
        <!-- 主内容 -->
        <main class="app-main">
          <router-view v-slot="{ Component }">
            <Transition
              name="page-transition"
              mode="out-in"
              @enter="onTransitionEnter"
              @leave="onTransitionLeave"
            >
              <keep-alive include="Discover">
                <component :is="Component" :key="$route.path" />
              </keep-alive>
            </Transition>
          </router-view>
        </main>

        <!-- 底部播放器 -->
        <footer class="app-footer">
          <player-bar />
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useMessage, useDialog, useNotification } from 'naive-ui'
import TitleBar from './TitleBar.vue'
import Sidebar from './Sidebar.vue'
import PlayerBar from './PlayerBar.vue'
import { usePlaylistStore } from '../stores/playlist'
import { setupNotification, showError, showSuccess } from '../utils/notification'

const message = useMessage()
const dialog = useDialog()
const notification = useNotification()
const playlistStore = usePlaylistStore()
const route = useRoute()
const transitionType = ref('normal')

// 初始化通知 API
setupNotification(message, dialog, notification)

// 过渡动画处理
const onTransitionEnter = (el) => {
  if (route.path === '/lyrics') {
    el.style.animation = 'pageEnter 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
  }
}

const onTransitionLeave = (el) => {
  if (route.path !== '/lyrics') {
    el.style.animation = 'pageExit 0.6s cubic-bezier(0.6, 0, 0.84, 0.3) forwards'
  }
}

// 全局错误处理
window.addEventListener('unhandledrejection', (event) => {
  console.error('未处理的 Promise 拒绝:', event.reason)
  showError('发生了一个错误，请稍后重试')
  event.preventDefault()
})

window.addEventListener('error', (event) => {
  console.error('全局错误:', event.error)
  showError('应用程序遇到错误')
  event.preventDefault()
})

// 应用启动时初始化数据
onMounted(async () => {
  try {
    await playlistStore.loadAllPlaylists()
  } catch (error) {
    console.error('初始化应用数据失败:', error)
    showError('初始化应用失败，请重启应用')
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
  display: flex;
  flex: 1;
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
  position: relative;
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

/* 页面过渡动画 */
.page-transition-enter-active,
.page-transition-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.page-transition-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(20px);
}

.page-transition-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-20px);
}

@keyframes pageEnter {
  from {
    opacity: 0;
    transform: scale(0.9) rotateX(10deg);
  }
  to {
    opacity: 1;
    transform: scale(1) rotateX(0deg);
  }
}

@keyframes pageExit {
  from {
    opacity: 1;
    transform: scale(1) rotateX(0deg);
  }
  to {
    opacity: 0;
    transform: scale(0.9) rotateX(-10deg);
  }
}
</style>

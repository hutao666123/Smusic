<template>
  <n-config-provider>
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
            <router-view />
          </main>

          <!-- 底部播放器 -->
          <footer class="app-footer">
            <player-bar />
          </footer>
        </div>
      </div>
    </div>
  </n-config-provider>
</template>

<script setup>
import TitleBar from './components/TitleBar.vue'
import Sidebar from './components/Sidebar.vue'
import PlayerBar from './components/PlayerBar.vue'
</script>

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
  padding: 20px;
}

.app-footer {
  background: rgba(0, 0, 0, 0.5);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 10px 20px;
}

/* 主内容区域滚动条 */
.app-main::-webkit-scrollbar {
  width: 8px;
}

.app-main::-webkit-scrollbar-track {
  background: transparent;
}

.app-main::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.app-main::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>

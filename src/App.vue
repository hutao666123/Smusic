<template>
  <n-config-provider>
    <n-message-provider>
      <n-dialog-provider>
        <n-notification-provider>
          <app-content-wrapper />
        </n-notification-provider>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup>
import { defineComponent, h } from 'vue'
import { useMessage, useDialog, useNotification } from 'naive-ui'
import { setupNotification } from './utils/notification'
import AppContentWrapper from './components/AppContentWrapper.vue'
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

<template>
  <div class="title-bar">
    <!-- 左侧拖拽区域 -->
    <div class="title-bar-left">
      <!-- Logo -->
      <div class="logo">
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path fill="currentColor" d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
        </svg>
        <span class="logo-text">Smusic</span>
      </div>

      <!-- 导航按钮 -->
      <div class="nav-buttons">
        <button class="nav-button" @click="goBack" title="后退">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="currentColor" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
        </button>
        <button class="nav-button" @click="goForward" title="前进">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="currentColor" d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
          </svg>
        </button>
        <button class="nav-button" @click="refresh" title="刷新">
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="currentColor" d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
          </svg>
        </button>
      </div>

      <!-- 搜索框 -->
      <div class="search-box">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24">
          <path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
        <input 
          v-model="searchKeyword" 
          type="text" 
          placeholder="搜索音乐"
          @keyup.enter="handleSearch"
          @focus="searchFocused = true"
          @blur="searchFocused = false"
        />
      </div>
    </div>

    <!-- 右侧窗口控制按钮 -->
    <div class="title-bar-controls">
      <button class="title-bar-button" @click="minimize" title="最小化">
        <svg width="12" height="12" viewBox="0 0 12 12">
          <rect fill="currentColor" width="10" height="1" x="1" y="6"/>
        </svg>
      </button>
      <button class="title-bar-button" @click="maximize" title="最大化">
        <svg width="12" height="12" viewBox="0 0 12 12">
          <rect width="9" height="9" x="1.5" y="1.5" stroke="currentColor" stroke-width="1" fill="none"/>
        </svg>
      </button>
      <button class="title-bar-button close" @click="close" title="关闭">
        <svg width="12" height="12" viewBox="0 0 12 12">
          <path fill="currentColor" d="M6.5 6l3.5-3.5-0.5-0.5-3.5 3.5-3.5-3.5-0.5 0.5 3.5 3.5-3.5 3.5 0.5 0.5 3.5-3.5 3.5 3.5 0.5-0.5z"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchKeyword = ref('')
const searchFocused = ref(false)

const goBack = () => {
  router.back()
}

const goForward = () => {
  router.forward()
}

const refresh = () => {
  router.go(0)
}

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push({
      path: '/search',
      query: { keyword: searchKeyword.value.trim() }
    })
  }
}

const minimize = () => {
  if (window.electron) {
    window.electron.minimize()
  }
}

const maximize = () => {
  if (window.electron) {
    window.electron.maximize()
  }
}

const close = () => {
  if (window.electron) {
    window.electron.close()
  }
}
</script>

<style scoped>
.title-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  user-select: none;
  padding: 0 16px;
  flex-shrink: 0;
  position: relative;
  z-index: 200;
}

.title-bar-left {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 20px;
  -webkit-app-region: drag;
}

/* Logo */
.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  -webkit-app-region: no-drag;
  padding-right: 20px;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}

.logo svg {
  opacity: 0.9;
}

.logo-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 导航按钮 */
.nav-buttons {
  display: flex;
  gap: 6px;
  -webkit-app-region: no-drag;
}

.nav-button {
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s;
}

.nav-button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-button:active {
  transform: scale(0.95);
}

/* 搜索框 */
.search-box {
  position: relative;
  width: 450px;
  -webkit-app-region: no-drag;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.5;
  pointer-events: none;
}

.search-box input {
  width: 100%;
  height: 40px;
  padding: 0 18px 0 44px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  color: white;
  font-size: 14px;
  outline: none;
  transition: all 0.3s;
}

.search-box input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.search-box input:focus {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

/* 窗口控制按钮 */
.title-bar-controls {
  display: flex;
  -webkit-app-region: no-drag;
}

.title-bar-button {
  width: 46px;
  height: 60px;
  border: none;
  background: transparent;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.title-bar-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.title-bar-button.close:hover {
  background: #e81123;
}

.title-bar-button svg {
  opacity: 0.9;
}
</style>

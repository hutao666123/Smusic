<template>
  <div class="title-bar">
    <!-- 左侧拖拽区域 -->
    <div class="title-bar-left">
      <!-- Logo -->
      <div class="logo">
        <svg t="1765372539361" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8524" width="20" height="20"><path d="M727.578947 215.578947c6.965895 0 13.312 2.640842 18.095158 6.979369l-3.516631-2.465684C847.333053 293.052632 916.210526 414.706526 916.210526 552.421053c0 223.245474-180.965053 404.210526-404.210526 404.210526C288.754526 956.631579 107.789474 775.666526 107.789474 552.421053c0-136.178526 67.341474-256.633263 170.536421-329.862737a26.947368 26.947368 0 0 1 35.058526 40.906105l0.161684 0.202105C221.830737 326.858105 161.684211 432.626526 161.684211 552.421053c0 193.482105 156.833684 350.315789 350.315789 350.315789s350.315789-156.833684 350.315789-350.315789c0-119.296-59.634526-224.673684-150.716631-287.932632l0.121263-0.175158A26.947368 26.947368 0 0 1 727.578947 215.578947z" fill="#555555" p-id="8525"></path><path d="M629.450105 70.629053s3.045053 51.442526-23.215158 85.854315c-22.689684 29.736421-63.568842 49.178947-80.141473 56.185264l162.627368 281.640421C704.889263 519.504842 714.105263 548.513684 714.105263 579.368421c0 96.741053-90.489263 175.157895-202.105263 175.157895-111.616 0-202.105263-78.416842-202.105263-175.157895s90.489263-175.157895 202.105263-175.157895c24.010105 0 47.036632 3.637895 68.405895 10.280421L448.673684 186.354526a26.947368 26.947368 0 0 1 23.552-40.421052c17.785263-4.446316 57.411368-15.225263 91.351579-31.029895 37.187368-17.286737 65.872842-44.274526 65.872842-44.274526zM512 458.105263c-83.429053 0-148.210526 56.144842-148.210526 121.263158s64.781474 121.263158 148.210526 121.263158 148.210526-56.144842 148.210526-121.263158c0-18.607158-5.295158-36.500211-14.794105-52.547368a20.547368 20.547368 0 0 1-1.374316-2.088421l-0.862316-1.522527C618.617263 485.025684 569.775158 458.105263 512 458.105263z" fill="#555555" p-id="8526"></path><path d="M565.113263 589.972211l-72.178526 53.948631a13.473684 13.473684 0 0 1-21.544421-10.778947v-107.910737a13.473684 13.473684 0 0 1 21.544421-10.778947l72.178526 53.935157a13.473684 13.473684 0 0 1 0 21.584843z" p-id="8527"></path></svg>
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

      <!-- 设置按钮 -->
      <button class="settings-button" @click="goToSettings" title="设置">
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5a3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97c0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1c0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66Z"/>
        </svg>
      </button>
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

const goToSettings = () => {
  router.push('/settings')
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
  position: relative;
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
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
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
  position: absolute;
  width: 300px;
  -webkit-app-region: no-drag;
  left: 50%;
  margin-left: 80px;
}

/* 设置按钮 */
.settings-button {
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s;
  -webkit-app-region: no-drag;
  margin-left: auto;
}

.settings-button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.settings-button:active {
  transform: scale(0.95);
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

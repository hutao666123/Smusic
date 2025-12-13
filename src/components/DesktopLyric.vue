<template>
  <div class="desktop-lyric" :class="{ locked: isLocked, hovered: isHovered }" :style="{ fontSize: `${lyricScale}em` }">
    <!-- 锁定状态的解锁按钮 -->
    <div v-if="isLocked" class="unlock-btn" @click="toggleLock" @mouseenter="onUnlockHover" @mouseleave="onUnlockLeave">
      <svg t="1765373484152" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7180" width="20" height="20"><path d="M1024 253.698302q0 45.010989-14.321678 85.418581t-40.407592 73.142857-61.378621 55.752248-76.211788 33.246753q3.068931 23.528472 3.068931 45.010989 0 72.631369-27.62038 137.078921t-75.7003 112.015984-112.527473 75.188811-137.078921 27.62038q-55.240759 0-105.366633-15.856144t-93.090909-45.522478l-282.341658 187.204795 188.227772-283.364635q-28.643357-42.965035-43.476523-91.556444t-14.833167-102.809191q0-72.631369 27.62038-137.078921t75.188811-112.015984 111.504496-75.188811 136.567433-27.62038q11.252747 0 20.45954 0.511489t19.436563 1.534466q10.22977-41.942058 33.246753-78.257742t55.752248-62.401598 73.142857-40.919081 86.441558-14.833167q52.171828 0 98.717283 19.948052t80.815185 54.217782 54.217782 80.815185 19.948052 98.717283zM480.799201 769.278721q47.056943 0 87.976024-17.902098t71.096903-48.591409 47.568432-71.608392 17.390609-86.953047q0-24.551449-4.091908-45.010989-8.183816-2.045954-15.344655-4.603397t-15.344655-5.626374l-88.999001 87.976024q-14.321678 14.321678-31.712288 20.971029t-35.804196 6.649351-36.315684-6.649351-31.200799-20.971029q-14.321678-14.321678-20.971029-31.712288t-6.649351-35.804196 6.649351-35.804196 20.971029-31.712288l88.999001-88.999001q-3.068931-8.183816-5.626374-14.833167t-4.603397-13.81019q-19.436563-4.091908-43.988012-4.091908-46.033966 0-86.953047 17.390609t-71.608392 48.07992-48.07992 71.608392-17.390609 86.953047 17.390609 86.953047 48.07992 71.608392 71.608392 48.591409 86.953047 17.902098zM770.301698 386.685315q26.597403 0 50.125874-10.22977t41.430569-27.62038 28.131868-41.430569 10.22977-50.637363-10.22977-50.125874-28.131868-40.919081-41.430569-27.62038-50.125874-10.22977-50.637363 10.22977-41.430569 27.62038-27.62038 40.919081-10.22977 50.125874 10.22977 50.637363 27.62038 41.430569 41.430569 27.62038 50.637363 10.22977z" p-id="7181"></path></svg>
    </div>

    <!-- 顶部状态栏 -->
    <div class="top-bar" v-show="!isLocked">
      <div class="logo"></div>
      <div class="top-controls">
        <button @click="toggleLock" class="top-btn" title="锁定">
          <svg t="1765373615497" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="18931" width="20" height="20"><path d="M639.616004 383.916856 639.616004 255.892041l-255.859295 0 0 128.024815-63.924915 0 0 383.910717 383.867738 0L703.699532 383.916856 639.616004 383.916856 639.616004 383.916856zM447.745069 319.895751l127.929648-0.016373 0.048095 64.014966c0-0.12382-128.412648 0-127.977743 0L447.745069 319.895751zM639.487068 703.444217 383.745453 703.444217 383.745453 451.668936l255.741615 0L639.487068 703.444217 639.487068 703.444217zM489.486752 583.65804l0 66.319451 45.64662 0 0-66.491367c13.747095-7.912204 22.998807-22.706141 22.998807-39.651069 0-25.27464-20.585851-45.77044-45.975101-45.77044-25.388227 0-45.971008 20.494777-45.971008 45.77044C466.18607 560.90278 475.572858 575.788815 489.486752 583.65804L489.486752 583.65804zM489.486752 583.65804" fill="#272636" p-id="18932"></path><path d="M782.246469 240.527099c36.608779 36.608779 64.905242 79.291904 84.184331 126.794801 18.651802 45.9004 28.084639 94.451162 28.010961 144.263661 0.069585 49.808406-9.359158 98.363262-28.015054 144.260591-19.279089 47.50392-47.569412 90.189092-84.175121 126.793778-36.606733 36.606733-79.294974 64.900126-126.797871 84.179214-45.896306 18.654872-94.451162 28.084639-144.259568 28.015054-49.808406 0.069585-98.365308-9.358135-144.259568-28.015054-47.50392-19.277042-90.192162-47.569412-126.800941-84.179214-36.604686-36.603663-64.895009-79.289857-84.173075-126.793778-18.656919-45.895283-28.084639-94.452185-28.015054-144.260591-0.072655-49.812499 9.359158-98.363262 28.010961-144.263661 19.280112-47.501874 47.575552-90.186022 84.183308-126.793778 36.604686-36.604686 79.286788-64.899102 126.789685-84.178191 45.9004-18.651802 94.451162-28.084639 144.263661-28.011984 49.813522-0.072655 98.363262 9.360182 144.264685 28.011984C702.959681 175.626973 745.642806 203.922413 782.246469 240.527099M827.505255 195.268312C652.829957 20.593014 369.558335 20.593014 194.883037 195.269335 20.202623 369.94975 20.201599 653.220349 194.876897 827.895647c174.681438 174.681438 457.952037 174.679391 632.632451 0C1002.18567 653.220349 1002.18567 369.94975 827.505255 195.268312L827.505255 195.268312 827.505255 195.268312z"  p-id="18933"></path></svg>
        </button>
        <button @click="close" class="top-btn close" title="关闭">✕</button>
      </div>
    </div>

    <!-- 歌词显示区 -->
    <div class="lyric-area">
      <div class="lyric-text current" :style="{ 
        color: lyricColor,
        textShadow: `0 0 40px ${lyricColor}80, 0 0 20px ${lyricColor}60`
      }">{{ currentLyric || songName || '暂无歌词' }}</div>
      <div class="lyric-text next" v-if="nextLyric">{{ nextLyric }}</div>
    </div>

    <!-- 底部控制栏 -->
    <div class="bottom-bar" v-show="!isLocked && isHovered">
      <button @click="prev" class="play-btn" title="上一首">
        <svg t="1765370595956" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5731" width="20" height="20">
          <path d="M928 335.1c-22.6-53.4-54.9-101.3-96.1-142.5-41.2-41.2-89.1-73.5-142.5-96.1-55.3-23.4-114-35.2-174.5-35.2S395.7 73.1 340.4 96.5c-53.4 22.6-101.3 54.9-142.5 96.1-41.2 41.2-73.5 89.1-96.1 142.5-23.4 55.3-35.2 114-35.2 174.5s11.9 119.2 35.2 174.5c22.6 53.4 54.9 101.3 96.1 142.5 41.2 41.2 89.1 73.5 142.5 96.1 55.3 23.4 114 35.2 174.5 35.2s119.2-11.9 174.5-35.2c53.4-22.6 101.3-54.9 142.5-96.1 41.2-41.2 73.5-89.1 96.1-142.5 23.4-55.3 35.2-114 35.2-174.5S951.3 390.4 928 335.1zM514.9 877.9c-203.1 0-368.3-165.2-368.3-368.3 0-203.1 165.2-368.3 368.3-368.3 203.1 0 368.3 165.2 368.3 368.3 0 203-165.2 368.3-368.3 368.3z" p-id="5732"></path><path d="M685.9 339.9c-12.4-7.1-27.6-7.1-40 0l-233.8 135c-3.1 1.8-5.8 3.9-8.3 6.4V356.6c0-22.1-17.9-40-40-40s-40 17.9-40 40v306c0 22.1 17.9 40 40 40s40-17.9 40-40V537.9c2.4 2.4 5.2 4.6 8.3 6.4l233.8 135c6.2 3.6 13.1 5.4 20 5.4s13.8-1.8 20-5.4c12.4-7.1 20-20.3 20-34.6v-270c0-14.4-7.6-27.6-20-34.8z m-60 235.4l-113.8-65.7 113.8-65.7v131.4z" p-id="5733"></path></svg>
      </button>
      <button @click="togglePlay" class="play-btn main" :title="isPlaying ? '暂停' : '播放'">
        <svg v-if="isPlaying" t="1765370713034" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6075" width="20" height="20">
          <path d="M928 335.1c-22.6-53.4-54.9-101.3-96.1-142.5-41.2-41.2-89.1-73.5-142.5-96.1-55.3-23.4-114-35.2-174.5-35.2S395.7 73.1 340.4 96.5c-53.4 22.6-101.3 54.9-142.5 96.1-41.2 41.2-73.5 89.1-96.1 142.5-23.4 55.3-35.2 114-35.2 174.5s11.9 119.2 35.2 174.5c22.6 53.4 54.9 101.3 96.1 142.5 41.2 41.2 89.1 73.5 142.5 96.1 55.3 23.4 114 35.2 174.5 35.2s119.2-11.9 174.5-35.2c53.4-22.6 101.3-54.9 142.5-96.1 41.2-41.2 73.5-89.1 96.1-142.5 23.4-55.3 35.2-114 35.2-174.5S951.3 390.4 928 335.1zM514.9 877.9c-203.1 0-368.3-165.2-368.3-368.3 0-203.1 165.2-368.3 368.3-368.3 203.1 0 368.3 165.2 368.3 368.3 0 203-165.2 368.3-368.3 368.3z" p-id="6076"></path>
          <path d="M413.8 316.6c-22.1 0-40 17.9-40 40v306c0 22.1 17.9 40 40 40s40-17.9 40-40v-306c0-22.1-17.9-40-40-40zM616 316.6c-22.1 0-40 17.9-40 40v306c0 22.1 17.9 40 40 40s40-17.9 40-40v-306c0-22.1-17.9-40-40-40z" p-id="6077"></path>
        </svg>
        <svg v-else t="1765370657697" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5903" width="20" height="20">
          <path d="M923.5 336.9c-22.6-53.4-54.9-101.3-96.1-142.5-41.2-41.2-89.1-73.5-142.5-96.1C629.7 75 571 63.1 510.5 63.1S391.3 75 336 98.3c-53.4 22.6-101.3 54.9-142.5 96.1-41.2 41.2-73.5 89.1-96.1 142.5-23.4 55.3-35.2 114-35.2 174.5s11.9 119.2 35.2 174.5c22.6 53.4 54.9 101.3 96.1 142.5 41.2 41.2 89.1 73.5 142.5 96.1 55.3 23.4 114 35.2 174.5 35.2s119.2-11.9 174.5-35.2c53.4-22.6 101.3-54.9 142.5-96.1 41.2-41.2 73.5-89.1 96.1-142.5 23.4-55.3 35.2-114 35.2-174.5s-11.9-119.2-35.3-174.5z m-413 542.8c-203.1 0-368.3-165.2-368.3-368.3 0-203.1 165.2-368.3 368.3-368.3 203.1 0 368.3 165.2 368.3 368.3 0 203.1-165.2 368.3-368.3 368.3z" p-id="5904"></path>
          <path d="M647.4 341.8c-12.4-7.1-27.6-7.1-40 0l-233.8 135c-12.4 7.1-20 20.4-20 34.6 0 14.3 7.6 27.5 20 34.6l233.8 135c6.2 3.6 13.1 5.4 20 5.4s13.8-1.8 20-5.4c12.4-7.1 20-20.3 20-34.6v-270c0-14.3-7.6-27.5-20-34.6z m-60 235.3l-113.8-65.7 113.8-65.7v131.4z" p-id="5905"></path>
        </svg>
      </button>
      <button @click="next" class="play-btn" title="下一首">
        <svg t="1765370347721" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2859" width="20" height="20">
          <path  d="M101.9 684.1c22.6 53.4 54.9 101.3 96.1 142.5 41.2 41.2 89.1 73.5 142.5 96.1 55.3 23.4 114 35.2 174.5 35.2s119.2-11.9 174.5-35.2c53.4-22.6 101.3-54.9 142.5-96.1 41.2-41.2 73.5-89.1 96.1-142.5 23.4-55.3 35.2-114 35.2-174.5s-11.9-119.2-35.2-174.5c-22.6-53.4-54.9-101.3-96.1-142.5-41.2-41.2-89.1-73.5-142.5-96.1-55.3-23.4-114-35.2-174.5-35.2S395.7 73.1 340.4 96.5c-53.4 22.6-101.3 54.9-142.5 96.1-41.2 41.2-73.5 89.1-96.1 142.5-23.4 55.3-35.2 114-35.2 174.5s11.9 119.2 35.3 174.5z m413-542.8c203.1 0 368.3 165.2 368.3 368.3 0 203.1-165.2 368.3-368.3 368.3-203.1 0-368.3-165.2-368.3-368.3 0-203.1 165.2-368.3 368.3-368.3z" p-id="2860"></path><path d="M343.9 679.2c12.4 7.1 27.6 7.1 40 0l233.8-135c3.1-1.8 5.8-3.9 8.3-6.4v124.7c0 22.1 17.9 40 40 40s40-17.9 40-40v-306c0-22.1-17.9-40-40-40s-40 17.9-40 40v124.7c-2.4-2.4-5.2-4.6-8.3-6.4l-233.8-135c-6.2-3.6-13.1-5.4-20-5.4s-13.8 1.8-20 5.4c-12.4 7.1-20 20.3-20 34.6v270c0 14.4 7.6 27.7 20 34.8z m60-235.3l113.8 65.7-113.8 65.7V443.9z" p-id="2861"></path></svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useThemeStore } from '../stores/theme'

const themeStore = useThemeStore()

const currentLyric = ref('')
const nextLyric = ref('')
const songName = ref('')
const artistName = ref('')
const isPlaying = ref(false)
const isLocked = ref(false)
const isHovered = ref(false)

// 计算歌词颜色
const lyricColor = computed(() => {
  return themeStore.desktopLyricColor || '#00ffcc'
})

// 计算歌词大小
const lyricScale = computed(() => {
  return themeStore.desktopLyricSize || 1.0
})

onMounted(() => {
  // 确保从 localStorage 加载设置
  const savedColor = localStorage.getItem('desktop-lyric-color')
  const savedSize = localStorage.getItem('desktop-lyric-size')
  
  console.log('桌面歌词加载设置:', { savedColor, savedSize })
  console.log('themeStore 值:', { 
    color: themeStore.desktopLyricColor, 
    size: themeStore.desktopLyricSize 
  })
  
  window.electron.onPlayerStateUpdate((state) => {
    isPlaying.value = state.isPlaying
    songName.value = state.songName || ''
    artistName.value = state.artistName || ''
  })

  window.electron.onLyricUpdate((data) => {
    currentLyric.value = data.lyric || ''
    nextLyric.value = data.nextLyric || ''
  })
  
  // 监听主进程发送的鼠标悬停状态
  window.electron.onMouseHoverState((isInside) => {
    isHovered.value = isInside
  })
})

const togglePlay = () => {
  window.electron.desktopLyricControl('togglePlay')
}

const prev = () => {
  window.electron.desktopLyricControl('prev')
}

const next = () => {
  window.electron.desktopLyricControl('next')
}

const toggleLock = () => {
  isLocked.value = !isLocked.value
  window.electron.setDesktopLyricLock(isLocked.value)
}

const onUnlockHover = () => {
  window.electron.setDesktopLyricLock(false)
}

const onUnlockLeave = () => {
  if (isLocked.value) {
    window.electron.setDesktopLyricLock(true)
  }
}

const close = () => {
  window.electron.closeDesktopLyric()
}


</script>

<style scoped>
.desktop-lyric {
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0);
  color: #fff;
  display: flex;
  flex-direction: column;
  font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
  user-select: none;
  overflow: hidden;
  transition: background 0.3s ease;
  position: relative;
  font-size: 16px;
}

.desktop-lyric.hovered:not(.locked) {
  background: rgba(0, 0, 0, 0.9);
}

.desktop-lyric:not(.locked) {
  -webkit-app-region: drag;
}



.unlock-btn {
  position: absolute;
  top: 0.5em;
  right: 0.5em;
  width: 2.25em;
  height: 2.25em;
  background: rgba(0, 255, 204, 0.15);
  border: 2px solid rgba(0, 255, 204, 0.4);
  border-radius: 0.5em;
  color: #00ffcc;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 9999;
  opacity: 0.5;
  backdrop-filter: blur(10px);
}

.unlock-btn:hover {
  opacity: 1;
  background: rgba(0, 255, 204, 0.25);
  border-color: rgba(0, 255, 204, 0.7);
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(0, 255, 204, 0.3);
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5em 1.25em;
}

.logo {
  font-size: 24px;
  opacity: 0.6;
}

.top-controls {
  display: flex;
  gap: 10px;
  -webkit-app-region: no-drag;
}

.top-btn {
  width: 2.25em;
  height: 2.25em;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 0.5em;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  font-size: 1em;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.top-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}

.top-btn.close {
  color: #ff6b6b;
  font-size: 20px;
  font-weight: bold;
}

.top-btn.close:hover {
  background: rgba(255, 107, 107, 0.2);
}

.lyric-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 0.3125em 1.875em 0;
  gap: 0.5em;
}

.lyric-text {
  font-size: 2em;
  font-weight: 700;
  line-height: 1.2;
  text-align: center;
  word-wrap: break-word;
  width: 100%;
}

.lyric-text.current {
  /* 颜色通过内联样式动态设置 */
}

.lyric-text.next {
  font-size: 1.5em;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 600;
}

.bottom-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.75em;
  padding: 0.9375em;
  -webkit-app-region: no-drag;
}

.play-btn {
  width: 2.375em;
  height: 2.375em;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  color: #fff;
  font-size: 1em;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.play-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: scale(1.1);
}

.play-btn.main {
  width: 2.8125em;
  height: 2.8125em;
  background: linear-gradient(135deg, #00ffcc, #00d4aa);
  border: none;
  color: #000;
  font-size: 1em;
}

.play-btn.main:hover {
  background: linear-gradient(135deg, #00d4aa, #00ffcc);
  transform: scale(1.15);
}

@keyframes shimmer {
  0% { background-position: 0% center; }
  100% { background-position: 200% center; }
}


</style>

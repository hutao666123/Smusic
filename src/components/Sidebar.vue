<template>
  <aside class="sidebar">
    <!-- 主菜单 -->
    <nav class="sidebar-menu">
      <div class="menu-section">
        <h3 class="section-title">菜单</h3>
        <router-link to="/" class="menu-item" :class="{ active: isActive('/') }">
          <span class="icon">
            <svg t="1765372684114" class="icon" viewBox="0 0 1124 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="10403" width="20" height="20"><path d="M1073.881601 387.684107a54.70156 54.70156 0 0 1-27.35078-6.837695l-462.364933-268.037642a44.650148 44.650148 0 0 0-44.171509 0L77.561069 380.504528A53.812659 53.812659 0 0 1 6.859303 365.461599c-14.222406-21.470362-5.401779-49.504911 17.914761-63.043548l510.092044-295.183291a55.316952 55.316952 0 0 1 54.701559 0l510.228798 295.320045c23.111409 13.67539 31.863658 41.02617 17.914761 62.564909a51.898105 51.898105 0 0 1-43.829625 22.564393z" fill="#707070" p-id="10404"></path><path d="M848.306045 1024H275.9226a129.916204 129.916204 0 0 1-129.916204-129.916204V437.667657a47.863865 47.863865 0 1 1 95.727729 0v456.142631a34.188475 34.188475 0 0 0 34.188475 34.188475h572.383445a34.188475 34.188475 0 0 0 34.188474-34.188475V437.667657a47.863865 47.863865 0 1 1 95.72773 0v456.142631a129.916204 129.916204 0 0 1-129.916204 130.189712z" fill="#707070" p-id="10405"></path><path d="M355.171484 460.02692m47.863865 0l0 0q47.863865 0 47.863865 47.863865l0 59.351192q0 47.863865-47.863865 47.863865l0 0q-47.863865 0-47.863865-47.863865l0-59.351192q0-47.863865 47.863865-47.863865Z" fill="#707070" p-id="10406"></path><path d="M673.329431 460.02692m47.863864 0l0 0q47.863865 0 47.863865 47.863865l0 59.351192q0 47.863865-47.863865 47.863865l0 0q-47.863865 0-47.863864-47.863865l0-59.351192q0-47.863865 47.863864-47.863865Z" fill="#707070" p-id="10407"></path><path d="M562.080134 827.41627c-79.727523 0-142.155678-51.419466-142.155678-116.924584a41.02617 41.02617 0 1 1 82.052339 0c0 16.410468 25.709733 34.872244 60.103339 34.872245s60.171716-18.461776 60.171715-34.872245a41.02617 41.02617 0 0 1 82.05234 0c0 65.641872-62.428155 116.924584-142.224055 116.924584z" p-id="10408"></path></svg>
          </span>
          <span class="label">首页</span>
        </router-link>
        <router-link to="/discover" class="menu-item" :class="{ active: isActive('/discover') }">
          <span class="icon">
            <svg t="1765372737636" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="12315" width="20" height="20"><path d="M403.968 643.072 403.968 643.072c-16.384 0-29.184-13.312-29.184-29.184l0-59.392c0-16.384 13.312-29.184 29.184-29.184l0 0c16.384 0 29.184 13.312 29.184 29.184l0 59.392C433.152 629.76 419.84 643.072 403.968 643.072z" p-id="12316"></path><path d="M689.152 643.072 689.152 643.072c-16.384 0-29.184-13.312-29.184-29.184l0-59.392c0-16.384 13.312-29.184 29.184-29.184l0 0c16.384 0 29.184 13.312 29.184 29.184l0 59.392C718.336 629.76 705.024 643.072 689.152 643.072z" p-id="12317"></path><path d="M750.08 918.528 157.184 918.528c-40.448 0-73.216-32.768-73.216-73.216L83.968 434.688c0-40.448 32.768-73.216 73.216-73.216l660.992-0.512c72.704 0 132.096 59.392 132.096 132.096 0 8.704-1.024 17.92-2.56 26.624l-67.584 290.304C868.864 872.96 814.08 918.528 750.08 918.528zM818.176 419.84 723.968 419.84 157.184 419.84c-8.192 0-14.848 6.656-14.848 14.848l0 410.624c0 8.192 6.656 14.848 14.848 14.848l592.896 0c35.84 0 66.048-25.6 72.192-60.928 0-0.512 0-1.024 0.512-1.536L890.368 506.88c1.024-4.096 1.536-9.216 1.536-13.824C891.392 452.608 858.624 419.84 818.176 419.84z" p-id="12318"></path><path d="M341.504 419.84c-11.776 0-23.04-7.168-27.648-18.944-5.632-15.36 2.048-32.256 16.896-37.888 60.928-23.04 100.352-79.872 100.864-144.896 0-16.384 13.312-28.672 29.696-29.184 16.384 0 29.184 13.312 29.184 29.696-0.512 88.064-56.32 167.936-138.752 199.168C348.672 419.328 345.088 419.84 341.504 419.84z" p-id="12319"></path><path d="M640 419.84c-3.584 0-7.68-0.512-11.264-2.048-14.848-6.144-22.016-23.04-15.872-38.4 23.552-56.832 28.672-117.76 15.36-177.664-3.584-15.872 6.144-31.232 22.016-34.816 15.872-3.584 31.232 6.144 34.816 22.016 15.872 71.168 9.728 144.896-18.432 212.48C662.528 412.672 651.264 419.84 640 419.84z" p-id="12320"></path><path d="M461.312 246.784c-16.384 0-29.184-13.312-29.184-29.184 0-70.656 57.344-128 128-128 60.416 0 111.616 40.96 124.928 99.84 3.584 15.872-6.144 31.232-22.016 35.328-15.872 3.584-31.232-6.144-35.328-22.016-7.168-31.744-35.328-54.272-68.096-54.272-38.4 0-69.632 31.232-69.632 69.632C490.496 233.472 477.184 246.784 461.312 246.784z" p-id="12321"></path><path d="M269.824 818.176c-16.384 0-29.184-13.312-29.184-29.184L240.64 390.656c0-16.384 13.312-29.184 29.184-29.184s29.184 13.312 29.184 29.184L299.008 788.48C299.008 804.864 285.696 818.176 269.824 818.176z" p-id="12322"></path><path d="M542.72 796.16c-40.448 0-73.216-31.232-73.216-69.12L469.504 706.56c0-16.384 13.312-29.184 29.184-29.184 16.384 0 29.184 13.312 29.184 29.184l0 19.968c0 5.632 6.656 10.752 14.848 10.752 8.704 0 14.848-5.632 14.848-10.752l0-20.48c0-16.384 13.312-29.184 29.184-29.184s29.184 13.312 29.184 29.184l0 20.48C615.936 764.928 583.168 796.16 542.72 796.16z" p-id="12323"></path></svg>
          </span>
          <span class="label">推荐</span>
        </router-link>
      </div>

      <!-- 我的音乐分组 -->
      <div class="menu-section">
        <div class="section-header-with-action">
          <h3 class="section-title">我的音乐</h3>
          <router-link to="/my-playlists" class="more-link">更多</router-link>
        </div>
        <router-link 
          to="/local-playlist/local-favorites" 
          class="menu-item" 
          :class="{ active: isActive('/local-playlist/local-favorites') }"
        >
          <span class="icon">
            <svg t="1765372914604" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="29561" width="20" height="20"><path d="M908.8 214.4c-9.6-12.8-19.2-22.4-28.8-32-112-115.2-230.4-105.6-342.4-16-9.6 6.4-19.2 16-28.8 25.6-9.6-9.6-19.2-16-28.8-25.6-112-86.4-230.4-99.2-342.4 16-9.6 9.6-19.2 19.2-25.6 32-134.4 195.2-60.8 387.2 137.6 560 44.8 38.4 89.6 73.6 137.6 102.4 16 9.6 32 19.2 44.8 28.8 9.6 6.4 12.8 9.6 19.2 9.6 3.2 3.2 6.4 3.2 12.8 6.4 3.2 3.2 9.6 3.2 16 6.4 25.6 6.4 64 3.2 89.6-12.8 3.2 0 9.6-3.2 16-9.6 12.8-6.4 28.8-16 44.8-28.8 48-28.8 92.8-64 137.6-102.4C969.6 598.4 1043.2 406.4 908.8 214.4zM736 732.8c-41.6 35.2-86.4 70.4-131.2 99.2-16 9.6-28.8 19.2-44.8 25.6-6.4 3.2-12.8 6.4-16 9.6-6.4 3.2-16 6.4-25.6 9.6-3.2 0-6.4 0-9.6 0-6.4 0-12.8 0-16 0-3.2 0-3.2 0-3.2 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0-3.2 0-3.2-3.2-3.2 0-6.4-3.2-9.6-3.2-3.2-3.2-9.6-6.4-16-9.6-12.8-6.4-28.8-16-44.8-25.6-44.8-28.8-89.6-60.8-131.2-99.2-179.2-160-243.2-323.2-131.2-489.6 6.4-9.6 16-16 22.4-25.6 89.6-96 182.4-86.4 275.2-12.8 9.6 6.4 16 12.8 22.4 19.2 0 0 0 0 0 0l28.8 32c3.2 3.2 3.2 3.2 6.4 6.4 0 0 0 0 0 0l0 0c3.2-3.2 9.6-9.6 16-16 12.8-12.8 25.6-25.6 41.6-38.4 92.8-73.6 185.6-83.2 275.2 12.8 6.4 9.6 16 16 22.4 25.6C982.4 406.4 918.4 572.8 736 732.8z" p-id="29562"></path></svg>
          </span>
          <span class="label">喜欢</span>
          <span v-if="playlistStore.favorites.length > 0" class="count">{{ playlistStore.favorites.length }}</span>
        </router-link>
        <router-link 
          to="/local-playlist/local-downloads" 
          class="menu-item" 
          :class="{ active: isActive('/local-playlist/local-downloads') }"
        >
          <span class="icon">
            <svg t="1765372783682" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="16712" width="20" height="20"><path d="M960 768 64 768c-35.36 0-64-28.64-64-64L0 160c0-35.328 28.672-64 64-64l416.384 0L480.384 31.712C480.384 14.176 494.56 0 512 0c17.44 0 31.616 14.208 31.616 31.744L543.616 96 960 96c35.36 0 64 28.64 64 64l0 544C1024 739.328 995.328 768 960 768zM960 224c0-35.328-28.64-64-64-64L544 160l0 30.528-0.416 0 0 335.904 167.776-168.448c12.256-12.32 32.128-12.32 44.384 0 12.256 12.288 12.256 32.256 0 44.576l-219.904 220.736c-0.544 0.64-0.704 1.408-1.312 2.016-0.96 0.96-2.368 0.992-3.392 1.792-3.328 2.688-6.944 4.608-10.848 5.76-1.504 0.384-2.848 0.672-4.384 0.864-9.408 1.28-19.2-1.152-26.432-8.416-0.64-0.64-0.832-1.44-1.408-2.08L268.256 402.56C256 390.24 256 370.272 268.256 357.984c12.256-12.32 32.128-12.32 44.384 0l167.776 168.448L480.416 190.528 480 190.528 480 160 128 160C92.64 160 64 188.64 64 224l0 416c0 35.328 28.64 64 64 64l768 0c35.328 0 64-28.672 64-64L960 224zM96 832l832 0c8.672 0 32 8.544 32 17.248l0 32C960 889.92 936.672 896 928 896L96 896c-8.704 0-32-6.08-32-14.752l0-32C64 840.544 87.296 832 96 832zM160 960l704 0c8.672 0 32 7.552 32 16.256l0 32C896 1016.928 872.672 1024 864 1024L160 1024c-8.672 0-32-7.04-32-15.744l0-32C128 967.552 151.296 960 160 960z" p-id="16713"></path></svg>
          </span>
          <span class="label">已下载</span>
          <span v-if="playlistStore.downloads.length > 0" class="count">{{ playlistStore.downloads.length }}</span>
        </router-link>
        <router-link 
          to="/collected-playlists" 
          class="menu-item" 
          :class="{ active: isActive('/collected-playlists') }"
        >
          <span class="icon">
            <svg t="1765372847987" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="23540" width="20" height="20"><path d="M813.5 79.6h-600c-51.8 0-94 40.2-94 89.5v707.4c0 22.2 10.5 42.7 28.8 56.3 19.3 14.2 44.6 18.5 67.8 11.3l2.1-0.7 247.2-113.2c31.1-9.1 65-9.1 96 0l247.2 113.2 2.1 0.7c7.4 2.3 15.1 3.4 22.7 3.4 16.1 0 32-5.1 45.2-14.7 18.3-13.5 28.8-34 28.8-56.3V169.2c0.1-49.4-42-89.6-93.9-89.6z m26 797c0 0.6-1 1.4-1.2 1.6-0.7 0.5-2.8 1.9-6 1.4l-246.6-113-2.1-0.7c-45.2-13.9-95-13.9-140.2 0l-2.1 0.7-246.6 113c-3.2 0.5-5.4-0.9-6-1.4-0.2-0.2-1.2-0.9-1.2-1.6V169.2c0-11.9 11.7-21.5 26-21.5h600c14.3 0 26 9.7 26 21.5v707.4z" fill="" p-id="23541"></path><path d="M669 347l-70.5-10.2-31.5-63.9c-10.1-20.5-30.6-33.2-53.5-33.2s-43.3 12.7-53.5 33.2l-31.5 63.8-70.4 10.3c-22.6 3.3-41.1 18.8-48.1 40.6-7.1 21.7-1.3 45.2 15.1 61.1l51 49.7-12 70.2c-3.9 22.5 5.2 44.9 23.7 58.3 10.5 7.6 22.7 11.5 35 11.5 9.5 0 19-2.3 27.8-6.9l63-33.1 63 33.1c20.2 10.6 44.3 8.9 62.8-4.5s27.6-35.8 23.7-58.3l-12-70.2 51-49.7c16.4-16 22.2-39.4 15.1-61.1-7.2-21.9-25.6-37.5-48.2-40.7z m-68.6 105.7a59.238 59.238 0 0 0-17.1 52.8l9.9 57.8-51.9-27.3c-8.7-4.6-18.2-6.9-27.7-6.9s-19.1 2.3-27.7 6.8L434 563.2l9.9-57.8c3.3-19.3-3.1-39.1-17.1-52.8l-42-40.9 58-8.4c19.4-2.8 36.2-15 44.9-32.6l25.9-52.6 25.9 52.6c8.7 17.6 25.5 29.8 44.9 32.6l58 8.4-42 41z" p-id="23542"></path></svg>
          </span>
          <span class="label">收藏</span>
          <span v-if="collectedCount > 0" class="count">{{ collectedCount }}</span>
        </router-link>
      </div>

      <!-- 自定义歌单（可折叠） -->
      <div class="menu-section">
        <div class="section-header" @click="toggleCustomPlaylists">
          <div class="section-title-wrapper">
            <span class="collapse-icon" :class="{ collapsed: !showCustomPlaylists }">▼</span>
            <h3 class="section-title">自定义歌单</h3>
          </div>
          <button class="add-btn" @click.stop="showCreatePlaylist" title="创建歌单">+</button>
        </div>
        <div v-show="showCustomPlaylists" class="custom-playlists-container">
          <div v-if="playlistStore.customPlaylists.length === 0" class="empty-playlists">
            <p>暂无自定义歌单</p>
          </div>
          <router-link
            v-for="playlist in customPlaylistsWithCount"
            :key="playlist.id"
            :to="`/local-playlist/${playlist.id}`"
            class="playlist-item"
            :class="{ active: isActive(`/local-playlist/${playlist.id}`) }"
            :title="playlist.name"
          >
            <span class="playlist-icon">
              <svg t="1765373024196" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3369" width="20" height="20"><path d="M254.7712 652.6976c-90.5216 0-163.84 64.1024-163.84 143.36s73.3184 143.36 163.84 143.36 163.84-64.1024 163.84-143.36-73.3184-143.36-163.84-143.36z m0 245.76c-67.7888 0-122.88-45.8752-122.88-102.4s55.0912-102.4 122.88-102.4 122.88 45.8752 122.88 102.4-55.0912 102.4-122.88 102.4zM766.7712 529.8176c-90.5216 0-163.84 64.1024-163.84 143.36s73.3184 143.36 163.84 143.36 163.84-64.1024 163.84-143.36-73.3184-143.36-163.84-143.36z m0 245.76c-67.7888 0-122.88-45.8752-122.88-102.4s55.0912-102.4 122.88-102.4 122.88 45.8752 122.88 102.4-55.0912 102.4-122.88 102.4z" p-id="3370"></path><path d="M398.1312 222.6176a20.48 20.48 0 0 1 20.48 20.48v532.48a20.48 20.48 0 0 1-40.96 0v-532.48a20.48 20.48 0 0 1 20.48-20.48zM912.5888 84.992a20.48 20.48 0 0 1 20.48 20.48v573.44a20.48 20.48 0 0 1-40.96 0v-573.44a20.48 20.48 0 0 1 20.48-20.48z" p-id="3371"></path><path d="M392.8064 223.232l514.2528-137.8304a20.48 20.48 0 0 1 10.6496 39.5264L403.456 262.7584a20.48 20.48 0 0 1-10.6496-39.5264zM500.5312 399.1552l-107.7248 28.8768a20.48 20.48 0 0 0 10.6496 39.5264l97.0752-26.0096zM932.2496 304.5376a20.48 20.48 0 0 0-24.9856-14.5408L541.4912 389.12v40.96l376.2176-100.352a20.48 20.48 0 0 0 14.5408-25.1904z" p-id="3372"></path></svg>
            </span>
            <span class="playlist-name">{{ playlist.name }}</span>
            <span v-if="playlist.songCount > 0" class="count">{{ playlist.songCount }}</span>
          </router-link>
        </div>
      </div>

    </nav>

    <!-- 创建歌单对话框 -->
    <CreatePlaylistDialog
      v-model:visible="showCreateDialog"
      @success="handlePlaylistCreated"
    />
  </aside>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { usePlaylistStore } from '../stores/playlist'
import CreatePlaylistDialog from './CreatePlaylistDialog.vue'

const route = useRoute()
const playlistStore = usePlaylistStore()

const showCustomPlaylists = ref(true)
const showCreateDialog = ref(false)

// 使用 computed 确保响应式
const collectedCount = computed(() => playlistStore.collectedPlaylists.length)

// 监听自定义歌单变化，强制刷新
const customPlaylistsWithCount = computed(() => {
  return playlistStore.customPlaylists.map(playlist => ({
    ...playlist,
    songCount: playlist.songs?.length || 0
  }))
})

// Sidebar 不需要主动加载数据，由 AppContentWrapper 统一加载

// 不需要在路由变化时重新加载，数据会在需要时自动更新

const isActive = (path) => {
  return route.path === path || route.path.startsWith(path + '/')
}

const toggleCustomPlaylists = () => {
  showCustomPlaylists.value = !showCustomPlaylists.value
}

const showCreatePlaylist = () => {
  showCreateDialog.value = true
}

const handlePlaylistCreated = (newPlaylist) => {
  // 歌单创建成功后，确保列表展开
  showCustomPlaylists.value = true
}
</script>

<style scoped>
.sidebar {
  width: 180px;
  background: var(--card-bg);
  color: var(--text-primary);
  display: flex;
  flex-direction: column;
  height: 100vh;
  border-right: 1px solid var(--border-color);
  overflow-y: auto;
  overflow-x: hidden;
}

/* 滚动条样式 */
.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* 头部 */
.sidebar-header {
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo {
  font-size: 18px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 菜单 */
.sidebar-menu {
  flex: 1;
  padding: 16px 0;
  overflow-y: auto;
}

.menu-section {
  padding: 0 8px;
  margin-bottom: 16px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  margin-bottom: 8px;
}

.section-header-with-action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  margin-bottom: 8px;
}

.section-title {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--text-secondary);
  margin: 0;
  padding: 8px;
  letter-spacing: 0.5px;
}

.more-link {
  font-size: 12px;
  color: var(--primary-color);
  text-decoration: none;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s;
}

.more-link:hover {
  color: var(--primary-hover-color);
  background: var(--button-bg);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  margin: 2px 0;
  border-radius: 6px;
  color: var(--text-secondary);
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 13px;
}

.menu-item:hover {
  background: var(--button-bg);
  color: var(--text-primary);
}

.menu-item.active {
  background: var(--accent-gradient);
  color: var(--text-primary);
  font-weight: 500;
}

.icon {
  flex: 0 0 18px;
  font-size: 14px;
  text-align: center;
}

.label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

/* 歌曲数量标签 */
.count {
  flex: 0 0 auto;
  font-size: 11px;
  color: var(--text-secondary);
  background: var(--button-bg);
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: auto;
}

/* 折叠功能 */
.section-title-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
}

.collapse-icon {
  font-size: 10px;
  color: var(--text-secondary);
  transition: transform 0.3s;
  display: inline-block;
}

.collapse-icon.collapsed {
  transform: rotate(-90deg);
}

/* 自定义歌单容器 */
.custom-playlists-container {
  overflow: hidden;
  transition: max-height 0.3s ease;
}

/* 添加按钮 */
.add-btn {
  background: var(--primary-color);
  border: none;
  color: var(--text-primary);
  width: 24px;
  height: 24px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s;
  flex-shrink: 0;
}

.add-btn:hover {
  background: var(--primary-hover-color);
}

.empty-playlists {
  padding: 12px 8px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 12px;
}

/* 歌单项 */
.playlist-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  margin: 2px 0;
  border-radius: 6px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s;
  font-size: 12px;
  overflow: hidden;
  text-decoration: none;
}

.playlist-item:hover {
  background: var(--button-bg);
  color: var(--text-primary);
}

.playlist-item.active {
  background: var(--accent-gradient);
  color: var(--text-primary);
  font-weight: 500;
}

.playlist-icon {
  flex: 0 0 14px;
  font-size: 12px;
}

.playlist-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}


</style>

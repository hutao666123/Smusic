<template>
  <aside class="sidebar">
    <!-- Logo -->
    <div class="sidebar-header">
      <div class="logo">🎵 Smusic</div>
    </div>

    <!-- 主菜单 -->
    <nav class="sidebar-menu">
      <div class="menu-section">
        <h3 class="section-title">菜单</h3>
        <router-link to="/" class="menu-item" :class="{ active: isActive('/') }">
          <span class="icon">🏠</span>
          <span class="label">首页</span>
        </router-link>
        <router-link to="/discover" class="menu-item" :class="{ active: isActive('/discover') }">
          <span class="icon">🎵</span>
          <span class="label">推荐</span>
        </router-link>
      </div>

      <!-- 我的音乐分组 -->
      <div class="menu-section">
        <h3 class="section-title">我的音乐</h3>
        <router-link 
          to="/local-playlist/local-favorites" 
          class="menu-item" 
          :class="{ active: isActive('/local-playlist/local-favorites') }"
        >
          <span class="icon">❤️</span>
          <span class="label">我喜欢的音乐</span>
          <span v-if="playlistStore.favorites.length > 0" class="count">{{ playlistStore.favorites.length }}</span>
        </router-link>
        <router-link 
          to="/local-playlist/local-downloads" 
          class="menu-item" 
          :class="{ active: isActive('/local-playlist/local-downloads') }"
        >
          <span class="icon">💾</span>
          <span class="label">已下载</span>
          <span v-if="playlistStore.downloads.length > 0" class="count">{{ playlistStore.downloads.length }}</span>
        </router-link>
        <router-link 
          to="/collected-playlists" 
          class="menu-item" 
          :class="{ active: isActive('/collected-playlists') }"
        >
          <span class="icon">📚</span>
          <span class="label">收藏的歌单</span>
          <span v-if="playlistStore.collectedPlaylists.length > 0" class="count">{{ playlistStore.collectedPlaylists.length }}</span>
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
            v-for="playlist in playlistStore.customPlaylists"
            :key="playlist.id"
            :to="`/local-playlist/${playlist.id}`"
            class="playlist-item"
            :class="{ active: isActive(`/local-playlist/${playlist.id}`) }"
            :title="playlist.name"
          >
            <span class="playlist-icon">📋</span>
            <span class="playlist-name">{{ playlist.name }}</span>
            <span v-if="playlist.songs && playlist.songs.length > 0" class="count">{{ playlist.songs.length }}</span>
          </router-link>
        </div>
      </div>

      <!-- 其他菜单 -->
      <div class="menu-section">
        <h3 class="section-title">其他</h3>
        <router-link to="/profile" class="menu-item" :class="{ active: isActive('/profile') }">
          <span class="icon">👤</span>
          <span class="label">个人中心</span>
        </router-link>
      </div>
    </nav>

    <!-- 底部菜单 -->
    <div class="sidebar-footer">
      <router-link to="/debug" class="menu-item debug-item" :class="{ active: isActive('/debug') }">
        <span class="icon">⚙️</span>
        <span class="label">诊断</span>
      </router-link>
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { usePlaylistStore } from '../stores/playlist'

const route = useRoute()
const playlistStore = usePlaylistStore()

const showCustomPlaylists = ref(true)

onMounted(async () => {
  // 加载所有本地歌单数据
  await playlistStore.loadAllPlaylists()
})

const isActive = (path) => {
  return route.path === path || route.path.startsWith(path + '/')
}

const toggleCustomPlaylists = () => {
  showCustomPlaylists.value = !showCustomPlaylists.value
}

const showCreatePlaylist = () => {
  // TODO: 显示创建歌单对话框
  // 这将在后续任务中实现
  console.log('创建歌单')
}
</script>

<style scoped>
.sidebar {
  width: 240px;
  background: linear-gradient(180deg, #2a2a3e 0%, #1a1a2e 100%);
  color: white;
  display: flex;
  flex-direction: column;
  height: 100vh;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
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
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo {
  font-size: 22px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 8px;
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

.section-title {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
  padding: 8px;
  letter-spacing: 0.5px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  margin: 4px 0;
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.menu-item.active {
  background: rgba(102, 126, 234, 0.3);
  color: #667eea;
  font-weight: 500;
}

.icon {
  flex: 0 0 20px;
  font-size: 16px;
  text-align: center;
}

.label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 歌曲数量标签 */
.count {
  flex: 0 0 auto;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.1);
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
  color: rgba(255, 255, 255, 0.5);
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
  background: rgba(102, 126, 234, 0.5);
  border: none;
  color: white;
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
  background: rgba(102, 126, 234, 0.8);
}

.empty-playlists {
  padding: 12px 8px;
  text-align: center;
  color: rgba(255, 255, 255, 0.4);
  font-size: 12px;
}

/* 歌单项 */
.playlist-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  margin: 2px 0;
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.3s;
  font-size: 13px;
  overflow: hidden;
  text-decoration: none;
}

.playlist-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.playlist-item.active {
  background: rgba(102, 126, 234, 0.3);
  color: #667eea;
  font-weight: 500;
}

.playlist-icon {
  flex: 0 0 16px;
  font-size: 14px;
}

.playlist-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 底部 */
.sidebar-footer {
  padding: 12px 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.debug-item {
  color: rgba(255, 193, 7, 0.7);
}

.debug-item:hover {
  color: rgba(255, 193, 7, 1);
}

.debug-item.active {
  background: rgba(255, 193, 7, 0.2);
  color: rgba(255, 193, 7, 1);
}
</style>

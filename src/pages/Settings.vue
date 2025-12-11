<template>
  <div class="settings-page">
    <div class="settings-container">
      <h1 class="settings-title">设置</h1>

      <!-- 主题设置 -->
      <div class="settings-section">
        <h2 class="section-title">外观</h2>
        <div class="setting-item">
          <div class="setting-label">
            <span class="label-text">主题模式</span>
            <span class="label-desc">选择应用的外观主题</span>
          </div>
          <div class="theme-options">
            <button 
              class="theme-option"
              :class="{ active: themeStore.theme === 'modern-purple' }"
              @click="themeStore.setTheme('modern-purple')"
            >
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z"/>
              </svg>
              <span>现代紫</span>
            </button>
            <button 
              class="theme-option"
              :class="{ active: themeStore.theme === 'dark' }"
              @click="themeStore.setTheme('dark')"
            >
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path fill="currentColor" d="M17.75 4.09L15.22 6.03L16.13 9.09L13.5 7.28L10.87 9.09L11.78 6.03L9.25 4.09L12.44 4L13.5 1L14.56 4L17.75 4.09M21.25 11L19.61 12.25L20.2 14.23L18.5 13.06L16.8 14.23L17.39 12.25L15.75 11L17.81 10.95L18.5 9L19.19 10.95L21.25 11M18.97 15.95C19.8 15.87 20.69 17.05 20.16 17.8C19.84 18.25 19.5 18.67 19.08 19.07C15.17 23 8.84 23 4.94 19.07C1.03 15.17 1.03 8.83 4.94 4.93C5.34 4.53 5.76 4.17 6.21 3.85C6.96 3.32 8.14 4.21 8.06 5.04C7.79 7.9 8.75 10.87 10.95 13.06C13.14 15.26 16.1 16.22 18.97 15.95M17.33 17.97C14.5 17.81 11.7 16.64 9.53 14.5C7.36 12.31 6.2 9.5 6.04 6.68C3.23 9.82 3.34 14.64 6.35 17.66C9.37 20.67 14.19 20.78 17.33 17.97Z"/>
              </svg>
              <span>暗黑</span>
            </button>
            <button 
              class="theme-option"
              :class="{ active: themeStore.theme === 'light' }"
              @click="themeStore.setTheme('light')"
            >
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12 18C11.45 18 11 17.55 11 17V16C11 15.45 11.45 15 12 15C12.55 15 13 15.45 13 16V17C13 17.55 12.55 18 12 18M12 2C11.45 2 11 2.45 11 3V4C11 4.55 11.45 5 12 5C12.55 5 13 4.55 13 4V3C13 2.45 12.55 2 12 2M20 11H19C18.45 11 18 11.45 18 12C18 12.55 18.45 13 19 13H20C20.55 13 21 12.55 21 12C21 11.45 20.55 11 20 11M5 11H4C3.45 11 3 11.45 3 12C3 12.55 3.45 13 4 13H5C5.55 13 6 12.55 6 12C6 11.45 5.55 11 5 11M17.66 6.34C17.26 5.94 16.62 5.94 16.22 6.34L15.51 7.05C15.11 7.45 15.11 8.09 15.51 8.49C15.91 8.89 16.55 8.89 16.95 8.49L17.66 7.78C18.06 7.38 18.06 6.74 17.66 6.34M7.05 15.51L6.34 16.22C5.94 16.62 5.94 17.26 6.34 17.66C6.74 18.06 7.38 18.06 7.78 17.66L8.49 16.95C8.89 16.55 8.89 15.91 8.49 15.51C8.09 15.11 7.45 15.11 7.05 15.51M16.95 15.51C16.55 15.11 15.91 15.11 15.51 15.51C15.11 15.91 15.11 16.55 15.51 16.95L16.22 17.66C16.62 18.06 17.26 18.06 17.66 17.66C18.06 17.26 18.06 16.62 17.66 16.22L16.95 15.51M8.49 7.05L7.78 6.34C7.38 5.94 6.74 5.94 6.34 6.34C5.94 6.74 5.94 7.38 6.34 7.78L7.05 8.49C7.45 8.89 8.09 8.89 8.49 8.49C8.89 8.09 8.89 7.45 8.49 7.05M12 8C9.79 8 8 9.79 8 12C8 14.21 9.79 16 12 16C14.21 16 16 14.21 16 12C16 9.79 14.21 8 12 8Z"/>
              </svg>
              <span>明亮</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 其他设置可以后续添加 -->
      <div class="settings-section">
        <h2 class="section-title">关于</h2>
        <div class="setting-item">
          <div class="setting-label">
            <span class="label-text">版本</span>
            <span class="label-desc">Smusic v1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useThemeStore } from '../stores/theme'

const themeStore = useThemeStore()
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  padding: 40px 20px;
  background: var(--page-bg);
  color: var(--text-primary);
}

.settings-container {
  max-width: 800px;
  margin: 0 auto;
}

.settings-title {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 40px;
  color: var(--text-primary);
}

.settings-section {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  backdrop-filter: blur(20px);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  color: var(--text-primary);
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
}

.setting-label {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.label-text {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
}

.label-desc {
  font-size: 13px;
  color: var(--text-secondary);
}

.theme-options {
  display: flex;
  gap: 12px;
}

.theme-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 24px;
  background: var(--button-bg);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  color: var(--text-secondary);
}

.theme-option:hover {
  background: var(--button-hover-bg);
  border-color: var(--primary-color);
}

.theme-option.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.theme-option svg {
  width: 24px;
  height: 24px;
}

.theme-option span {
  font-size: 14px;
  font-weight: 500;
}
</style>

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

        <div class="setting-item-vertical">
          <div class="setting-header">
            <div class="setting-label">
              <span class="label-text">主题色</span>
              <span class="label-desc">自定义按钮、选中效果等的颜色</span>
            </div>
            <button 
              class="reset-btn-top"
              :class="{ active: !themeStore.customAccentColor }"
              title="重置为主题默认"
              @click="themeStore.setCustomAccentColor(null)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z"/>
              </svg>
              <span>重置</span>
            </button>
          </div>
          
          <div class="color-row">
            <!-- 颜色选择器 -->
            <div class="color-picker-section">
              <div class="color-picker-wrapper">
                <input 
                  type="color" 
                  v-model="accentColorPicker"
                  @change="handleAccentPickerChange"
                  class="color-picker"
                  title="选择任意颜色"
                />
                <span class="picker-label">颜色选择器</span>
              </div>
            </div>

            <!-- 自定义输入 -->
            <div class="custom-input-section">
              <div class="custom-input-wrapper">
                <input 
                  type="text" 
                  v-model="customAccentInput"
                  placeholder="如: #667eea 或 rgb(102,126,234) 或 linear-gradient(...)"
                  class="custom-input"
                  @keyup.enter="applyCustomAccent"
                />
                <button @click="applyCustomAccent" class="apply-btn">应用</button>
              </div>
              <span v-if="accentInputError" class="error-msg">{{ accentInputError }}</span>
              <span class="hint-text">支持: hex、rgb、rgba、linear-gradient</span>
            </div>
          </div>
        </div>

        <div class="setting-item-vertical">
          <div class="setting-header">
            <div class="setting-label">
              <span class="label-text">字体颜色</span>
              <span class="label-desc">自定义文字颜色</span>
            </div>
            <button 
              class="reset-btn-top"
              :class="{ active: !themeStore.customTextColor }"
              title="重置为主题默认"
              @click="themeStore.setCustomTextColor(null)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z"/>
              </svg>
              <span>重置</span>
            </button>
          </div>
          
          <div class="color-row">
            <!-- 颜色选择器 -->
            <div class="color-picker-section">
              <div class="color-picker-wrapper">
                <input 
                  type="color" 
                  v-model="textColorPicker"
                  @change="handleTextPickerChange"
                  class="color-picker"
                  title="选择任意颜色"
                />
                <span class="picker-label">颜色选择器</span>
              </div>
            </div>

            <!-- 自定义输入 -->
            <div class="custom-input-section">
              <div class="custom-input-wrapper">
                <input 
                  type="text" 
                  v-model="customTextInput"
                  placeholder="如: #ffffff 或 rgb(255,255,255)"
                  class="custom-input"
                  @keyup.enter="applyCustomText"
                />
                <button @click="applyCustomText" class="apply-btn">应用</button>
              </div>
              <span v-if="textInputError" class="error-msg">{{ textInputError }}</span>
              <span class="hint-text">支持: hex、rgb、rgba</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 播放页面和专注模式视觉 -->
      <div class="settings-section">
        <h2 class="section-title">播放视觉</h2>
        <div class="setting-item-vertical">
          <div class="setting-label">
            <span class="label-text">视觉主题</span>
            <span class="label-desc">选择播放页面和专注模式的背景和效果风格</span>
          </div>
          <div class="visual-theme-grid">
            <div
              v-for="(theme, key) in visualThemes"
              :key="key"
              class="visual-theme-card"
              :class="{ active: themeStore.playbackVisualTheme === key }"
              @click="themeStore.setPlaybackVisualTheme(key)"
            >
              <div class="theme-preview" :style="getThemePreviewStyle(theme)">
                <div class="preview-text" :style="{ background: theme.textColors.songTitle }">
                  歌曲名
                </div>
              </div>
              <div class="theme-info">
                <div class="theme-name">{{ theme.name }}</div>
                <div class="theme-desc">{{ theme.description }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 桌面歌词设置 -->
      <div class="settings-section">
        <h2 class="section-title">桌面歌词</h2>
        
        <div class="setting-item-vertical">
          <div class="setting-header">
            <div class="setting-label">
              <span class="label-text">歌词颜色</span>
              <span class="label-desc">自定义桌面歌词的颜色</span>
            </div>
            <button 
              class="reset-btn-top"
              :class="{ active: !themeStore.desktopLyricColor }"
              title="重置为默认"
              @click="themeStore.setDesktopLyricColor(null)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z"/>
              </svg>
              <span>重置</span>
            </button>
          </div>
          
          <div class="color-row">
            <!-- 颜色选择器 -->
            <div class="color-picker-section">
              <div class="color-picker-wrapper">
                <input 
                  type="color" 
                  v-model="lyricColorPicker"
                  @change="handleLyricPickerChange"
                  class="color-picker"
                  title="选择任意颜色"
                />
                <span class="picker-label">颜色选择器</span>
              </div>
            </div>

            <!-- 自定义输入 -->
            <div class="custom-input-section">
              <div class="custom-input-wrapper">
                <input 
                  type="text" 
                  v-model="customLyricInput"
                  placeholder="如: #00ffcc 或 rgb(0,255,204)"
                  class="custom-input"
                  @keyup.enter="applyCustomLyric"
                />
                <button @click="applyCustomLyric" class="apply-btn">应用</button>
              </div>
              <span v-if="lyricInputError" class="error-msg">{{ lyricInputError }}</span>
              <span class="hint-text">支持: hex、rgb、rgba</span>
            </div>
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-label">
            <span class="label-text">歌词大小</span>
            <span class="label-desc">调整桌面歌词的整体大小</span>
          </div>
          <div class="size-control">
            <input 
              type="range" 
              min="0.5" 
              max="2.0" 
              step="0.1" 
              v-model.number="lyricSize"
              @input="handleLyricSizeChange"
              class="size-slider"
              :style="{ '--slider-progress': ((lyricSize - 0.5) / 1.5 * 100) + '%' }"
            />
            <span class="size-value">{{ Math.round(lyricSize * 100) }}%</span>
          </div>
        </div>
      </div>

      <!-- 快捷键设置 -->
      <div class="settings-section">
        <h2 class="section-title">快捷键</h2>
        
        <div class="setting-item">
          <div class="setting-label">
            <span class="label-text">快捷键模式</span>
            <span class="label-desc">选择快捷键的作用范围</span>
          </div>
          <div class="shortcut-mode-options">
            <button 
              class="mode-option"
              :class="{ active: shortcutsStore.shortcutMode === 'global' }"
              @click="handleModeChange('global')"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M11,17V16H9V14H13V13H10A1,1 0 0,1 9,12V9A1,1 0 0,1 10,8H14V9H16V11H12V12H15A1,1 0 0,1 16,13V16A1,1 0 0,1 15,17H11Z"/>
              </svg>
              <div class="mode-text">
                <span class="mode-name">全局快捷键</span>
                <span class="mode-desc">窗口失焦也能用</span>
              </div>
            </button>
            <button 
              class="mode-option"
              :class="{ active: shortcutsStore.shortcutMode === 'local' }"
              @click="handleModeChange('local')"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="currentColor" d="M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M19,5V19H5V5H19Z"/>
              </svg>
              <div class="mode-text">
                <span class="mode-name">应用内快捷键</span>
                <span class="mode-desc">仅窗口聚焦时</span>
              </div>
            </button>
          </div>
        </div>
        
        <div class="setting-item-vertical">
          <div class="setting-header-with-action">
            <div class="setting-label">
              <span class="label-text">快捷键配置</span>
              <span class="label-desc">
                {{ shortcutsStore.shortcutMode === 'global' ? '全局快捷键在任何时候都能使用' : '应用内快捷键仅在窗口聚焦时生效' }}
              </span>
            </div>
            <button @click="resetAllShortcuts" class="reset-all-btn-compact">
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12,4C14.1,4 16.1,4.8 17.6,6.3C20.7,9.4 20.7,14.5 17.6,17.6C15.8,19.5 13.3,20.2 10.9,19.9L11.4,17.9C13.1,18.1 14.9,17.5 16.2,16.2C18.5,13.9 18.5,10.1 16.2,7.7C15.1,6.6 13.5,6 12,6V10.6L7,5.6L12,0.6V4M6.3,17.6C3.7,15 3.3,11 5.1,7.9L6.6,9.4C5.5,11.6 5.9,14.4 7.8,16.2C8.3,16.7 8.9,17.1 9.6,17.4L9,19.4C8,19 7.1,18.4 6.3,17.6Z"/>
              </svg>
              <span>重置</span>
            </button>
          </div>
          
          <div class="shortcuts-grid">
            <div 
              v-for="(config, action) in shortcutsStore.shortcuts" 
              :key="action"
              class="shortcut-item"
            >
              <div class="shortcut-info">
                <span class="shortcut-label">{{ config.label }}</span>
                <div class="shortcut-key-display">
                  <kbd v-if="config.key">{{ formatShortcutKey(config.key) }}</kbd>
                  <span v-else class="no-key">未设置</span>
                </div>
              </div>
              <div class="shortcut-actions">
                <button 
                  @click="startEditShortcut(action)"
                  class="edit-btn"
                  title="修改"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"/>
                  </svg>
                </button>
                <button 
                  @click="toggleShortcut(action)"
                  class="toggle-btn"
                  :class="{ active: config.enabled }"
                  :title="config.enabled ? '禁用' : '启用'"
                >
                  <svg v-if="config.enabled" width="16" height="16" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M10,16.5L6,12.5L7.4,11.1L10,13.7L16.6,7.1L18,8.5L10,16.5Z"/>
                  </svg>
                  <svg v-else width="16" height="16" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4Z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 应用行为设置 -->
      <div class="settings-section">
        <h2 class="section-title">应用行为</h2>
        <div class="setting-item">
          <div class="setting-label">
            <span class="label-text">关闭窗口时</span>
            <span class="label-desc">选择点击关闭按钮时的行为</span>
          </div>
          <div class="close-action-options">
            <button 
              class="action-option"
              :class="{ active: themeStore.closeAction === 'quit' }"
              @click="themeStore.setCloseAction('quit')"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
              </svg>
              <span>关闭应用</span>
            </button>
            <button 
              class="action-option"
              :class="{ active: themeStore.closeAction === 'minimize-to-tray' }"
              @click="themeStore.setCloseAction('minimize-to-tray')"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="currentColor" d="M19,13H5V11H19V13Z"/>
              </svg>
              <span>最小化到托盘</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 关于和更新 -->
      <div class="settings-section">
        <h2 class="section-title">关于</h2>
        <div class="setting-item">
          <div class="setting-label">
            <span class="label-text">版本</span>
            <span class="label-desc">Smusic v{{ appVersion }}</span>
          </div>
          <button 
            class="check-update-btn"
            :class="{ checking: isCheckingUpdate }"
            :disabled="isCheckingUpdate"
            @click="checkForUpdate"
          >
            <svg v-if="!isCheckingUpdate" width="18" height="18" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12,18A6,6 0 0,1 6,12C6,11 6.25,10.03 6.7,9.2L5.24,7.74C4.46,8.97 4,10.43 4,12A8,8 0 0,0 12,20V23L16,19L12,15M12,4V1L8,5L12,9V6A6,6 0 0,1 18,12C18,13 17.75,13.97 17.3,14.8L18.76,16.26C19.54,15.03 20,13.57 20,12A8,8 0 0,0 12,4Z"/>
            </svg>
            <svg v-else class="spin" width="18" height="18" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z"/>
            </svg>
            <span>{{ isCheckingUpdate ? '检查中...' : '检查更新' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 快捷键编辑对话框 -->
    <div v-if="showShortcutDialog" class="shortcut-dialog-overlay" @click.self="cancelEditShortcut">
      <div class="shortcut-dialog">
        <div class="dialog-header">
          <h3>设置快捷键</h3>
          <button @click="cancelEditShortcut" class="close-btn">
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
            </svg>
          </button>
        </div>
        <div class="dialog-body">
          <div class="dialog-label">
            <span>{{ currentEditingAction ? shortcutsStore.shortcuts[currentEditingAction].label : '' }}</span>
          </div>
          
          <div class="recording-area" :class="{ recording: isRecording }">
            <div v-if="!isRecording && !recordedKey" class="recording-hint">
              <svg width="48" height="48" viewBox="0 0 24 24">
                <path fill="currentColor" d="M20,18H4V8H20M20,6H4C2.89,6 2,6.89 2,8V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V8C22,6.89 21.1,6 20,6M11,9H9V11H11M13,9H11V11H13M15,9H13V11H15M17,9H15V11H17M17,13H15V15H17M17,17H15V19H17M13,13H11V15H13M13,17H11V19H13M9,13H7V15H9M9,17H7V19H9Z"/>
              </svg>
              <p>点击下方按钮开始录制</p>
            </div>
            <div v-else-if="isRecording" class="recording-active">
              <div class="recording-pulse"></div>
              <p>请按下快捷键...</p>
              <span class="recording-tip">按 ESC 取消</span>
            </div>
            <div v-else class="recorded-key">
              <kbd>{{ formatShortcutKey(recordedKey) }}</kbd>
            </div>
          </div>
          
          <div v-if="shortcutError" class="dialog-error">{{ shortcutError }}</div>
        </div>
        <div class="dialog-footer">
          <button @click="cancelEditShortcut" class="dialog-btn cancel-btn">取消</button>
          <button v-if="recordedKey" @click="clearShortcut" class="dialog-btn clear-btn">清空</button>
          <button v-if="!isRecording" @click="startRecording" class="dialog-btn record-btn">
            {{ recordedKey ? '重新录制' : '开始录制' }}
          </button>
          <button v-if="recordedKey && !isRecording" @click="saveShortcut" class="dialog-btn save-btn">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useThemeStore } from '../stores/theme'
import { useShortcutsStore } from '../stores/shortcuts'

const themeStore = useThemeStore()
const shortcutsStore = useShortcutsStore()

// 从 package.json 读取配置
import packageJson from '../../package.json'

// 应用版本
const appVersion = ref(packageJson.version)

// 更新检查相关
const isCheckingUpdate = ref(false)
const UPDATE_CHECK_URL = packageJson.updateUrl

// 检查更新
const checkForUpdate = async () => {
  isCheckingUpdate.value = true

  try {
    const response = await fetch(UPDATE_CHECK_URL)
    if (!response.ok) {
      throw new Error('无法连接到更新服务器')
    }

    const data = await response.json()
    const latestVersion = data.version
    const currentVersion = appVersion.value

    // 比较版本号
    if (compareVersions(latestVersion, currentVersion) > 0) {
      // 有新版本
      const message = `发现新版本 v${latestVersion}\n\n${data.releaseNotes}\n\n是否前往下载？`
      if (confirm(message)) {
        // 获取发布页面 URL（去掉 version.json，保留基础 URL）
        const baseUrl = UPDATE_CHECK_URL.replace('/version.json', '')
        window.electron.openExternal(baseUrl)
      }
    } else {
      alert('当前已是最新版本')
    }
  } catch (error) {
    console.error('检查更新失败:', error)
    alert('检查更新失败: ' + error.message)
  } finally {
    isCheckingUpdate.value = false
  }
}

// 版本号比较函数
const compareVersions = (v1, v2) => {
  const parts1 = v1.split('.').map(Number)
  const parts2 = v2.split('.').map(Number)
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] || 0
    const part2 = parts2[i] || 0
    
    if (part1 > part2) return 1
    if (part1 < part2) return -1
  }
  
  return 0
}

// 视觉主题
const visualThemes = computed(() => themeStore.visualThemes)

// 获取主题预览样式
const getThemePreviewStyle = (theme) => {
  const colors = theme.bgColors
  return {
    background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]}, ${colors[2]})`
  }
}

// 主题色预设
const accentColorPresets = [
  { name: '紫色', value: '#667eea' },
  { name: '蓝色', value: '#4488ff' },
  { name: '青色', value: '#00bcd4' },
  { name: '绿色', value: '#4caf50' },
  { name: '橙色', value: '#ff9800' },
  { name: '红色', value: '#f44336' },
  { name: '粉色', value: '#e91e63' },
  { name: '深紫', value: '#9c27b0' },
  { name: '靛蓝', value: '#3f51b5' },
  { name: '深青', value: '#009688' },
  { name: '黄绿', value: '#8bc34a' },
  { name: '琥珀', value: '#ffc107' },
  { name: '深橙', value: '#ff5722' },
  { name: '棕色', value: '#795548' },
  { name: '灰色', value: '#607d8b' }
]

// 字体颜色预设
const colorPresets = [
  { name: '白色', value: '#ffffff' },
  { name: '浅灰', value: '#e6e6e6' },
  { name: '灰色', value: '#999999' },
  { name: '深灰', value: '#666666' },
  { name: '黑色', value: '#000000' },
  { name: '红色', value: '#ff4444' },
  { name: '橙色', value: '#ff9944' },
  { name: '黄色', value: '#ffdd44' },
  { name: '绿色', value: '#44ff88' },
  { name: '青色', value: '#44ddff' },
  { name: '蓝色', value: '#4488ff' },
  { name: '紫色', value: '#aa44ff' },
  { name: '粉色', value: '#ff44aa' },
  { name: '金色', value: '#ffd700' },
  { name: '银色', value: '#c0c0c0' }
]

const accentInputError = ref('')
const textInputError = ref('')

// 颜色选择器值 - 从 store 读取当前值
const accentColorPicker = ref(themeStore.customAccentColor || '#667eea')
const textColorPicker = ref(themeStore.customTextColor || '#ffffff')
const lyricColorPicker = ref(themeStore.desktopLyricColor || '#00ffcc')

// 桌面歌词自定义输入
const customLyricInput = ref(themeStore.desktopLyricColor || '')
const lyricInputError = ref('')

// 桌面歌词大小
const lyricSize = ref(themeStore.desktopLyricSize || 1.0)

// 初始化自定义输入框的值
const customAccentInput = ref(themeStore.customAccentColor || '')
const customTextInput = ref(themeStore.customTextColor || '')

// 处理主题色选择器变化
const handleAccentPickerChange = (event) => {
  const color = event.target.value
  themeStore.setCustomAccentColor(color)
  customAccentInput.value = color
  accentInputError.value = ''
}

// 处理字体颜色选择器变化
const handleTextPickerChange = (event) => {
  const color = event.target.value
  themeStore.setCustomTextColor(color)
  customTextInput.value = color
  textInputError.value = ''
}

// 验证并应用自定义主题色
const applyCustomAccent = () => {
  const input = customAccentInput.value.trim()
  if (!input) {
    accentInputError.value = '请输入颜色值'
    return
  }
  
  // 验证颜色格式
  if (isValidColor(input)) {
    themeStore.setCustomAccentColor(input)
    accentInputError.value = ''
  } else {
    accentInputError.value = '无效的颜色格式'
  }
}

// 验证并应用自定义字体颜色
const applyCustomText = () => {
  const input = customTextInput.value.trim()
  if (!input) {
    textInputError.value = '请输入颜色值'
    return
  }
  
  if (isValidColor(input)) {
    themeStore.setCustomTextColor(input)
    textInputError.value = ''
  } else {
    textInputError.value = '无效的颜色格式'
  }
}

// 处理桌面歌词颜色选择器变化
const handleLyricPickerChange = (event) => {
  const color = event.target.value
  console.log('设置桌面歌词颜色:', color)
  themeStore.setDesktopLyricColor(color)
  console.log('保存后 localStorage:', localStorage.getItem('desktop-lyric-color'))
  console.log('保存后 store:', themeStore.desktopLyricColor)
  customLyricInput.value = color
  lyricInputError.value = ''
  // 关闭桌面歌词窗口
  window.electron.closeDesktopLyric()
}

// 验证并应用自定义桌面歌词颜色
const applyCustomLyric = () => {
  const input = customLyricInput.value.trim()
  if (!input) {
    lyricInputError.value = '请输入颜色值'
    return
  }
  
  if (isValidColor(input)) {
    themeStore.setDesktopLyricColor(input)
    lyricInputError.value = ''
    // 关闭桌面歌词窗口
    window.electron.closeDesktopLyric()
  } else {
    lyricInputError.value = '无效的颜色格式'
  }
}

// 处理桌面歌词大小变化
const handleLyricSizeChange = (event) => {
  const size = parseFloat(event.target.value)
  console.log('设置桌面歌词大小:', size)
  themeStore.setDesktopLyricSize(size)
  console.log('保存后 localStorage:', localStorage.getItem('desktop-lyric-size'))
  console.log('保存后 store:', themeStore.desktopLyricSize)
  // 关闭桌面歌词窗口
  window.electron.closeDesktopLyric()
}

// 验证颜色格式
const isValidColor = (color) => {
  // 支持 hex, rgb, rgba, linear-gradient
  const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  const rgbPattern = /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/
  const rgbaPattern = /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/
  const gradientPattern = /^linear-gradient\(/
  
  return hexPattern.test(color) || 
         rgbPattern.test(color) || 
         rgbaPattern.test(color) || 
         gradientPattern.test(color)
}

// ==================== 快捷键设置 ====================
const editingShortcut = ref(null)
const recordingKeys = ref([])
const shortcutDialog = ref(null)
const showShortcutDialog = ref(false)
const recordedKey = ref('')
const shortcutError = ref('')
const currentEditingAction = ref(null)
const isRecording = ref(false)



// 格式化快捷键显示
const formatShortcutKey = (key) => {
  if (!key) return ''
  return key
    .replace('CommandOrControl', 'Ctrl')
    .replace('Command', 'Cmd')
    .replace('Control', 'Ctrl')
    .replace('Alt', 'Alt')
    .replace('Shift', 'Shift')
    .replace('Up', '↑')
    .replace('Down', '↓')
    .replace('Left', '←')
    .replace('Right', '→')
    .replace('+', ' + ')
}

// 开始编辑快捷键
const startEditShortcut = (action) => {
  currentEditingAction.value = action
  recordedKey.value = ''
  shortcutError.value = ''
  isRecording.value = false
  showShortcutDialog.value = true
}

// 开始录制快捷键
const startRecording = () => {
  isRecording.value = true
  recordedKey.value = ''
  shortcutError.value = ''
  
  // 添加键盘监听
  window.addEventListener('keydown', handleRecordKeyDown)
}

// 停止录制
const stopRecording = () => {
  isRecording.value = false
  window.removeEventListener('keydown', handleRecordKeyDown)
}

// 录制键盘按键
const handleRecordKeyDown = (event) => {
  event.preventDefault()
  event.stopPropagation()
  
  // 忽略单独的修饰键
  if (['Control', 'Alt', 'Shift', 'Meta'].includes(event.key)) {
    return
  }
  
  // 构建按键组合
  const keys = []
  if (event.ctrlKey || event.metaKey) keys.push('CommandOrControl')
  if (event.altKey) keys.push('Alt')
  if (event.shiftKey) keys.push('Shift')
  
  // 特殊键处理
  let keyName = event.key
  if (keyName === ' ') {
    keyName = 'Space'
  } else if (keyName === 'ArrowUp') {
    keyName = 'Up'
  } else if (keyName === 'ArrowDown') {
    keyName = 'Down'
  } else if (keyName === 'ArrowLeft') {
    keyName = 'Left'
  } else if (keyName === 'ArrowRight') {
    keyName = 'Right'
  } else if (keyName === 'Escape') {
    // ESC 键取消录制
    stopRecording()
    return
  } else {
    // 字母键统一转大写
    keyName = keyName.toUpperCase()
  }
  
  keys.push(keyName)
  recordedKey.value = keys.join('+')
  
  // 停止录制
  stopRecording()
}

// 保存快捷键
const saveShortcut = () => {
  const action = currentEditingAction.value
  const newKey = recordedKey.value.trim()
  
  if (!newKey) {
    shortcutError.value = '请先录制快捷键'
    return
  }
  
  // 检查冲突
  const conflict = shortcutsStore.checkConflict(newKey, action)
  if (conflict) {
    const conflictLabel = shortcutsStore.shortcuts[conflict].label
    shortcutError.value = `快捷键已被 "${conflictLabel}" 使用`
    return
  }
  
  // 更新快捷键
  shortcutsStore.updateShortcut(action, { key: newKey, enabled: true })
  registerShortcuts()
  showShortcutDialog.value = false
}

// 清空快捷键
const clearShortcut = () => {
  const action = currentEditingAction.value
  shortcutsStore.updateShortcut(action, { key: '', enabled: false })
  registerShortcuts()
  showShortcutDialog.value = false
}

// 取消编辑
const cancelEditShortcut = () => {
  stopRecording()
  showShortcutDialog.value = false
  recordedKey.value = ''
  shortcutError.value = ''
  currentEditingAction.value = null
}

// 切换快捷键启用状态
const toggleShortcut = (action) => {
  const config = shortcutsStore.shortcuts[action]
  shortcutsStore.updateShortcut(action, { enabled: !config.enabled })
  registerShortcuts()
}

// 重置所有快捷键
const resetAllShortcuts = () => {
  if (confirm('确定要重置所有快捷键到默认设置吗？')) {
    shortcutsStore.resetShortcuts()
    registerShortcuts()
  }
}

// 切换快捷键模式
const handleModeChange = async (mode) => {
  console.log('切换快捷键模式:', mode)
  shortcutsStore.setShortcutMode(mode)
  
  if (mode === 'global') {
    // 切换到全局模式，注册全局快捷键
    console.log('注册全局快捷键')
    await registerShortcuts()
  } else {
    // 切换到应用内模式，注销全局快捷键
    console.log('注销全局快捷键')
    await window.electron.unregisterShortcuts()
  }
}

// 注册快捷键到主进程
const registerShortcuts = async () => {
  try {
    // 将 shortcuts 转换为纯对象，避免 Proxy 导致的克隆问题
    const shortcutsData = JSON.parse(JSON.stringify(shortcutsStore.shortcuts))
    const result = await window.electron.registerShortcuts(shortcutsData)
    if (!result.success) {
      console.error('注册快捷键失败:', result.error)
    }
  } catch (error) {
    console.error('注册快捷键异常:', error)
  }
}

// 初始化
onMounted(() => {
  shortcutsStore.initShortcuts()
  registerShortcuts()
})

// 清理
onUnmounted(() => {
  window.electron.unregisterShortcuts()
})
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

.setting-item-vertical {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid var(--border-color);
}

.setting-item-vertical:last-child {
  border-bottom: none;
}

.setting-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.setting-label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
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

.close-action-options {
  display: flex;
  gap: 12px;
}

.action-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: var(--button-bg);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  color: var(--text-secondary);
}

.action-option:hover {
  background: var(--button-hover-bg);
  border-color: var(--primary-color);
}

.action-option.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.action-option svg {
  width: 20px;
  height: 20px;
}

.action-option span {
  font-size: 14px;
  font-weight: 500;
}

.color-options {
  display: flex;
  align-items: center;
  gap: 12px;
}

.color-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-width: 400px;
}

.color-preset {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 2px solid var(--border-color);
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.color-preset:hover {
  transform: scale(1.1);
  border-color: var(--primary-color);
}

.color-preset.active {
  border-color: var(--primary-color);
  border-width: 3px;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

.color-preset.reset {
  background: linear-gradient(135deg, 
    #ff0000 0%, #ff7f00 16.67%, #ffff00 33.33%, 
    #00ff00 50%, #0000ff 66.67%, #4b0082 83.33%, #9400d3 100%);
  position: relative;
}

.color-preset.reset::before {
  content: '';
  position: absolute;
  inset: 2px;
  background: var(--card-bg);
  border-radius: 6px;
}

.color-preset.reset svg {
  position: relative;
  z-index: 1;
}

.color-row {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.color-picker-section {
  flex: 0 0 30%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.custom-input-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.color-picker-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.color-picker {
  width: 60px;
  height: 40px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.color-picker:hover {
  border-color: var(--primary-color);
  transform: scale(1.05);
}

.picker-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.reset-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: var(--button-bg);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.reset-btn:hover {
  background: var(--button-hover-bg);
  border-color: var(--primary-color);
}

.reset-btn.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.reset-btn svg {
  width: 16px;
  height: 16px;
}

.reset-btn-top {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: var(--button-bg);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
  flex-shrink: 0;
}

.reset-btn-top:hover {
  background: var(--button-hover-bg);
  border-color: var(--primary-color);
}

.reset-btn-top.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.reset-btn-top svg {
  width: 16px;
  height: 16px;
}

.custom-input-wrapper {
  display: flex;
  gap: 8px;
  align-items: center;
}

.custom-input {
  flex: 1;
  padding: 10px 14px;
  background: var(--input-bg);
  border: 2px solid var(--input-border);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  transition: all 0.3s;
}

.custom-input:focus {
  outline: none;
  background: var(--input-focus-bg);
  border-color: var(--primary-color);
}

.custom-input::placeholder {
  color: var(--text-tertiary);
}

.apply-btn {
  padding: 10px 20px;
  background: var(--primary-color);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.apply-btn:hover {
  background: var(--primary-hover-color);
  transform: translateY(-1px);
}

.apply-btn:active {
  transform: translateY(0);
}

.error-msg {
  font-size: 12px;
  color: #ff4444;
  margin-top: -4px;
}

.hint-text {
  font-size: 12px;
  color: var(--text-tertiary);
  font-style: italic;
}

.size-control {
  display: flex;
  align-items: center;
  gap: 16px;
}

.size-slider {
  flex: 1;
  max-width: 200px;
  height: 8px;
  background: linear-gradient(to right, 
    #00ffcc 0%, 
    #00d4aa var(--slider-progress, 50%), 
    var(--input-bg) var(--slider-progress, 50%), 
    var(--input-bg) 100%);
  border-radius: 4px;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
  transition: all 0.3s;
}

.size-slider:hover {
  height: 10px;
}

.size-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #00ffcc, #00d4aa);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 255, 204, 0.3);
}

.size-slider::-webkit-slider-thumb:hover {
  transform: scale(1.3);
  box-shadow: 0 4px 16px rgba(0, 255, 204, 0.6);
}

.size-slider::-webkit-slider-thumb:active {
  transform: scale(1.1);
}

.size-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #00ffcc, #00d4aa);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 255, 204, 0.3);
}

.size-slider::-moz-range-thumb:hover {
  transform: scale(1.3);
  box-shadow: 0 4px 16px rgba(0, 255, 204, 0.6);
}

.size-slider::-moz-range-thumb:active {
  transform: scale(1.1);
}

.size-slider::-moz-range-track {
  background: transparent;
  border: none;
}

.size-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  min-width: 50px;
  text-align: right;
}

/* 视觉主题网格 */
.visual-theme-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.visual-theme-card {
  background: var(--card-bg);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
}

.visual-theme-card:hover {
  border-color: var(--primary-color);
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.visual-theme-card.active {
  border-color: var(--primary-color);
  border-width: 3px;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

.theme-preview {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.preview-text {
  font-size: 16px;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 8px;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
  z-index: 1;
}

.theme-info {
  padding: 12px;
  background: var(--button-bg);
}

.theme-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.theme-desc {
  font-size: 12px;
  color: var(--text-secondary);
}

.check-update-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--primary-color);
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.check-update-btn:hover:not(:disabled) {
  background: var(--primary-hover-color);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.check-update-btn:active:not(:disabled) {
  transform: translateY(0);
}

.check-update-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.check-update-btn svg {
  width: 18px;
  height: 18px;
}

.check-update-btn.checking {
  background: var(--button-bg);
  color: var(--text-secondary);
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.spin {
  animation: spin 1s linear infinite;
}

/* 快捷键设置样式 */
.shortcut-mode-options {
  display: flex;
  gap: 12px;
}

.mode-option {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--button-bg);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  color: var(--text-secondary);
}

.mode-option:hover {
  background: var(--button-hover-bg);
  border-color: var(--primary-color);
}

.mode-option.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.mode-option svg {
  flex-shrink: 0;
}

.mode-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  text-align: left;
}

.mode-name {
  font-size: 14px;
  font-weight: 500;
}

.mode-desc {
  font-size: 12px;
  opacity: 0.8;
}

.setting-header-with-action {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
}

.shortcuts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

@media (max-width: 768px) {
  .shortcuts-grid {
    grid-template-columns: 1fr;
  }
}

.shortcut-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--input-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  transition: all 0.3s;
}

.shortcut-item:hover {
  background: var(--button-hover-bg);
  border-color: var(--primary-color);
}

.shortcut-info {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.shortcut-label {
  font-size: 14px;
  color: var(--text-primary);
  min-width: 120px;
}

.shortcut-key-display {
  display: flex;
  gap: 4px;
}

.shortcut-key-display kbd {
  padding: 4px 8px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 12px;
  font-family: monospace;
  color: var(--text-primary);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.shortcut-key-display .no-key {
  font-size: 12px;
  color: var(--text-tertiary);
  font-style: italic;
}

.shortcut-actions {
  display: flex;
  gap: 8px;
}

.edit-btn,
.toggle-btn {
  padding: 6px;
  background: var(--button-bg);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

.edit-btn:hover {
  background: var(--button-hover-bg);
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.toggle-btn:hover {
  background: var(--button-hover-bg);
  border-color: var(--primary-color);
}

.toggle-btn.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.reset-all-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--button-bg);
  border: 2px solid var(--border-color);
  border-radius: 10px;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.reset-all-btn:hover {
  background: var(--button-hover-bg);
  border-color: var(--primary-color);
  color: var(--primary-color);
  transform: translateY(-1px);
}

.reset-all-btn svg {
  width: 18px;
  height: 18px;
}

.reset-all-btn-compact {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: var(--button-bg);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
  flex-shrink: 0;
}

.reset-all-btn-compact:hover {
  background: var(--button-hover-bg);
  border-color: var(--primary-color);
  color: var(--primary-color);
  transform: translateY(-1px);
}

.reset-all-btn-compact svg {
  width: 16px;
  height: 16px;
}

/* 快捷键编辑对话框 */
.shortcut-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(4px);
}

.shortcut-dialog {
  background: var(--card-bg);
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
}

.dialog-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.close-btn {
  padding: 4px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.3s;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: var(--button-hover-bg);
  color: var(--text-primary);
}

.dialog-body {
  padding: 24px;
}

.dialog-label {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.recording-area {
  min-height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--input-bg);
  border: 2px solid var(--input-border);
  border-radius: 12px;
  margin-bottom: 16px;
  transition: all 0.3s;
}

.recording-area.recording {
  border-color: var(--primary-color);
  background: rgba(102, 126, 234, 0.05);
}

.recording-hint {
  text-align: center;
  color: var(--text-secondary);
}

.recording-hint svg {
  opacity: 0.5;
  margin-bottom: 12px;
}

.recording-hint p {
  margin: 0;
  font-size: 14px;
}

.recording-active {
  text-align: center;
  color: var(--primary-color);
  position: relative;
}

.recording-pulse {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--primary-color);
  margin: 0 auto 16px;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.1);
  }
}

.recording-active p {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 500;
}

.recording-tip {
  font-size: 12px;
  opacity: 0.7;
}

.recorded-key {
  text-align: center;
}

.recorded-key kbd {
  padding: 12px 24px;
  background: var(--card-bg);
  border: 2px solid var(--primary-color);
  border-radius: 8px;
  font-size: 18px;
  font-family: monospace;
  color: var(--primary-color);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.dialog-error {
  margin-top: 12px;
  padding: 8px 12px;
  background: rgba(255, 68, 68, 0.1);
  border: 1px solid rgba(255, 68, 68, 0.3);
  border-radius: 6px;
  color: #ff4444;
  font-size: 13px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
}

.dialog-btn {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.cancel-btn {
  background: var(--button-bg);
  color: var(--text-secondary);
}

.cancel-btn:hover {
  background: var(--button-hover-bg);
  color: var(--text-primary);
}

.save-btn {
  background: var(--primary-color);
  color: white;
}

.save-btn:hover {
  background: var(--primary-hover-color);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.save-btn:active {
  transform: translateY(0);
}

.record-btn {
  background: var(--primary-color);
  color: white;
}

.record-btn:hover {
  background: var(--primary-hover-color);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.clear-btn {
  background: rgba(255, 68, 68, 0.1);
  color: #ff4444;
  border: 1px solid rgba(255, 68, 68, 0.3);
}

.clear-btn:hover {
  background: rgba(255, 68, 68, 0.2);
  border-color: #ff4444;
}
</style>

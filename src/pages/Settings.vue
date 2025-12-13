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
import { ref, computed } from 'vue'
import { useThemeStore } from '../stores/theme'

const themeStore = useThemeStore()

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
</style>

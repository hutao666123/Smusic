import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // 主题模式：'modern-purple' | 'dark' | 'light'
  const theme = ref('modern-purple')

  // 初始化主题
  const initTheme = () => {
    const savedTheme = localStorage.getItem('app-theme') || 'modern-purple'
    theme.value = savedTheme
    applyTheme(savedTheme)
  }

  // 应用主题到DOM
  const applyTheme = (themeName) => {
    document.documentElement.setAttribute('data-theme', themeName)
  }

  // 切换主题
  const setTheme = (themeName) => {
    theme.value = themeName
    localStorage.setItem('app-theme', themeName)
    applyTheme(themeName)
  }

  // 监听主题变化
  watch(theme, (newTheme) => {
    applyTheme(newTheme)
  })

  return {
    theme,
    initTheme,
    setTheme
  }
}, {
  persist: true
})

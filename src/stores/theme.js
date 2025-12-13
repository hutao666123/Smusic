import { defineStore } from 'pinia'
import { ref, watch, computed } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // 主题模式：'modern-purple' | 'dark' | 'light'
  const theme = ref('modern-purple')
  
  // 自定义字体颜色
  const customTextColor = ref(null)
  
  // 自定义主题色
  const customAccentColor = ref(null)

  // 桌面歌词颜色
  const desktopLyricColor = ref(null)
  
  // 桌面歌词大小 (0.5 - 2.0)
  const desktopLyricSize = ref(1.0)

  // 播放页面和专注模式共享的视觉主题
  const playbackVisualTheme = ref('deep-space')

  // 播放页面视觉主题配置
  const visualThemes = {
    'deep-space': {
      name: '深空漂浮',
      description: '神秘深邃的宇宙感',
      bgColors: ['#0f0c29', '#302b63', '#24243e'],
      effectType: 'particles',
      effectConfig: { count: 20, color: 'rgba(255, 255, 255, 0.6)', size: [2, 6], speed: [10, 20] },
      textColors: {
        songTitle: 'linear-gradient(135deg, #fff, #f093fb)',
        songArtist: 'rgba(255, 255, 255, 0.7)',
      },
      lyricColors: {
        active: 'linear-gradient(135deg, #fff, #f093fb)',
        activeBg: 'rgba(255, 255, 255, 0.1)',
        passed: 'rgba(255, 255, 255, 0.3)',
        upcoming: 'rgba(255, 255, 255, 0.5)',
      },
      vinylGlow: 'rgba(102, 126, 234, 0.6)',
      progressBar: {
        bg: 'rgba(255, 255, 255, 0.2)',
        fill: 'linear-gradient(90deg, #667eea, #764ba2)',
        thumb: '#667eea',
      }
    },
    'starry-ripple': {
      name: '星河涟漪',
      description: '平静流动的水面感',
      bgColors: ['#0a192f', '#1e3a5f', '#2c5f8d'],
      effectType: 'ripple',
      effectConfig: { interval: 2000, color: 'rgba(255, 255, 255, 0.3)', maxRadius: 500 },
      textColors: {
        songTitle: 'linear-gradient(135deg, #fff, #4fc3f7)',
        songArtist: 'rgba(79, 195, 247, 0.8)',
      },
      lyricColors: {
        active: 'linear-gradient(135deg, #fff, #4fc3f7)',
        activeBg: 'rgba(79, 195, 247, 0.15)',
        passed: 'rgba(79, 195, 247, 0.3)',
        upcoming: 'rgba(79, 195, 247, 0.5)',
      },
      vinylGlow: 'rgba(79, 195, 247, 0.6)',
      progressBar: {
        bg: 'rgba(79, 195, 247, 0.2)',
        fill: 'linear-gradient(90deg, #4fc3f7, #29b6f6)',
        thumb: '#4fc3f7',
      }
    },
    'aurora-dance': {
      name: '极光舞动',
      description: '梦幻流动的极光感',
      bgColors: ['#0a1f1f', '#1a3f3f', '#2a5f5f'],
      effectType: 'aurora',
      effectConfig: { count: 5, colors: ['#00ffcc', '#00d4aa', '#aa44ff'], width: 100 },
      textColors: {
        songTitle: 'linear-gradient(135deg, #00ffcc, #00d4aa)',
        songArtist: 'rgba(0, 255, 204, 0.7)',
      },
      lyricColors: {
        active: 'linear-gradient(135deg, #00ffcc, #00d4aa)',
        activeBg: 'rgba(0, 255, 204, 0.15)',
        passed: 'rgba(0, 255, 204, 0.3)',
        upcoming: 'rgba(0, 255, 204, 0.5)',
      },
      vinylGlow: 'rgba(0, 255, 204, 0.6)',
      progressBar: {
        bg: 'rgba(0, 255, 204, 0.2)',
        fill: 'linear-gradient(90deg, #00ffcc, #00d4aa)',
        thumb: '#00ffcc',
      }
    },
    'sunset-glow': {
      name: '日落余晖',
      description: '温暖柔和的黄昏感',
      bgColors: ['#2c1810', '#5c3a2e', '#8b5a3c'],
      effectType: 'glow',
      effectConfig: { count: 8, color: 'rgba(255, 154, 86, 0.4)', size: [80, 150], speed: 30 },
      textColors: {
        songTitle: 'linear-gradient(135deg, #ffd89b, #ff9a56)',
        songArtist: 'rgba(255, 216, 155, 0.8)',
      },
      lyricColors: {
        active: 'linear-gradient(135deg, #ffd89b, #ff9a56)',
        activeBg: 'rgba(255, 216, 155, 0.15)',
        passed: 'rgba(255, 216, 155, 0.3)',
        upcoming: 'rgba(255, 216, 155, 0.5)',
      },
      vinylGlow: 'rgba(255, 154, 86, 0.6)',
      progressBar: {
        bg: 'rgba(255, 216, 155, 0.2)',
        fill: 'linear-gradient(90deg, #ffd89b, #ff9a56)',
        thumb: '#ff9a56',
      }
    },
    'cyber-pulse': {
      name: '赛博脉冲',
      description: '科技未来的赛博朋克',
      bgColors: ['#0a0a0a', '#1a0a1a', '#2a0a2a'],
      effectType: 'cyber',
      effectConfig: { gridSize: 50, lineColor: 'rgba(255, 0, 255, 0.3)', scanSpeed: 3 },
      textColors: {
        songTitle: 'linear-gradient(135deg, #ff00ff, #00ffff)',
        songArtist: 'rgba(0, 255, 255, 0.8)',
      },
      lyricColors: {
        active: 'linear-gradient(135deg, #ff00ff, #00ffff)',
        activeBg: 'rgba(255, 0, 255, 0.15)',
        passed: 'rgba(0, 255, 255, 0.3)',
        upcoming: 'rgba(0, 255, 255, 0.5)',
      },
      vinylGlow: 'rgba(255, 0, 255, 0.8)',
      progressBar: {
        bg: 'rgba(255, 0, 255, 0.2)',
        fill: 'linear-gradient(90deg, #ff00ff, #00ffff)',
        thumb: '#ff00ff',
      }
    },
    'sakura-fall': {
      name: '樱花飘落',
      description: '浪漫柔美的日系风',
      bgColors: ['#2d1b2e', '#4a2d4a', '#6b3d6b'],
      effectType: 'sakura',
      effectConfig: { count: 15, color: '#ffb3d9', size: [8, 16], speed: [15, 25] },
      textColors: {
        songTitle: 'linear-gradient(135deg, #ffb3d9, #ff80bf)',
        songArtist: 'rgba(255, 179, 217, 0.8)',
      },
      lyricColors: {
        active: 'linear-gradient(135deg, #ffb3d9, #ff80bf)',
        activeBg: 'rgba(255, 179, 217, 0.15)',
        passed: 'rgba(255, 179, 217, 0.3)',
        upcoming: 'rgba(255, 179, 217, 0.5)',
      },
      vinylGlow: 'rgba(255, 128, 191, 0.6)',
      progressBar: {
        bg: 'rgba(255, 179, 217, 0.2)',
        fill: 'linear-gradient(90deg, #ffb3d9, #ff80bf)',
        thumb: '#ff80bf',
      }
    },
    'minimal-pure': {
      name: '简约纯净',
      description: '极简专注的纯粹感',
      bgColors: ['#000000', '#0a0a0a', '#1a1a1a'],
      effectType: 'none',
      effectConfig: null,
      textColors: {
        songTitle: '#ffffff',
        songArtist: 'rgba(255, 255, 255, 0.6)',
      },
      lyricColors: {
        active: '#ffffff',
        activeBg: 'rgba(255, 255, 255, 0.1)',
        passed: 'rgba(255, 255, 255, 0.3)',
        upcoming: 'rgba(255, 255, 255, 0.5)',
      },
      vinylGlow: 'rgba(255, 255, 255, 0.3)',
      progressBar: {
        bg: 'rgba(255, 255, 255, 0.2)',
        fill: '#ffffff',
        thumb: '#ffffff',
      }
    },
    'forest-mist': {
      name: '森林晨雾',
      description: '清新自然的森林感',
      bgColors: ['#0d1f1a', '#1a3a2e', '#2d5a4a'],
      effectType: 'mist',
      effectConfig: { count: 6, color: 'rgba(255, 255, 255, 0.2)', size: [100, 200], speed: 40 },
      textColors: {
        songTitle: 'linear-gradient(135deg, #a8e6cf, #56c596)',
        songArtist: 'rgba(168, 230, 207, 0.7)',
      },
      lyricColors: {
        active: 'linear-gradient(135deg, #a8e6cf, #56c596)',
        activeBg: 'rgba(168, 230, 207, 0.15)',
        passed: 'rgba(168, 230, 207, 0.3)',
        upcoming: 'rgba(168, 230, 207, 0.5)',
      },
      vinylGlow: 'rgba(86, 197, 150, 0.6)',
      progressBar: {
        bg: 'rgba(168, 230, 207, 0.2)',
        fill: 'linear-gradient(90deg, #a8e6cf, #56c596)',
        thumb: '#56c596',
      }
    }
  }

  // 获取当前视觉主题配置(播放页面和专注模式共享)
  const currentVisualTheme = computed(() => visualThemes[playbackVisualTheme.value] || visualThemes['deep-space'])

  // 初始化主题
  const initTheme = () => {
    const savedTheme = localStorage.getItem('app-theme') || 'modern-purple'
    const savedTextColor = localStorage.getItem('custom-text-color')
    const savedAccentColor = localStorage.getItem('custom-accent-color')
    const savedLyricColor = localStorage.getItem('desktop-lyric-color')
    const savedLyricSize = localStorage.getItem('desktop-lyric-size')
    const savedVisualTheme = localStorage.getItem('playback-visual-theme') || 'deep-space'
    theme.value = savedTheme
    customTextColor.value = savedTextColor
    customAccentColor.value = savedAccentColor
    desktopLyricColor.value = savedLyricColor
    desktopLyricSize.value = savedLyricSize ? parseFloat(savedLyricSize) : 1.0
    playbackVisualTheme.value = savedVisualTheme
    applyTheme(savedTheme)
    if (savedTextColor) {
      applyCustomTextColor(savedTextColor)
    }
    if (savedAccentColor) {
      applyCustomAccentColor(savedAccentColor)
    }
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

  // 应用自定义字体颜色
  const applyCustomTextColor = (color) => {
    if (color) {
      document.documentElement.style.setProperty('--text-primary', color)
      document.documentElement.style.setProperty('--text-color', color)
    } else {
      document.documentElement.style.removeProperty('--text-primary')
      document.documentElement.style.removeProperty('--text-color')
    }
  }

  // 设置自定义字体颜色
  const setCustomTextColor = (color) => {
    customTextColor.value = color
    if (color) {
      localStorage.setItem('custom-text-color', color)
      applyCustomTextColor(color)
    } else {
      localStorage.removeItem('custom-text-color')
      applyCustomTextColor(null)
      // 重新应用主题的默认颜色
      applyTheme(theme.value)
    }
  }

  // 应用自定义主题色
  const applyCustomAccentColor = (color) => {
    if (color) {
      // 如果是渐变色，直接设置
      if (color.startsWith('linear-gradient')) {
        console.log('应用渐变色:', color)
        document.documentElement.style.setProperty('--accent-gradient', color)
        // 尝试从渐变中提取第一个颜色作为单色
        const firstColor = extractFirstColor(color)
        console.log('提取的第一个颜色:', firstColor)
        if (firstColor) {
          document.documentElement.style.setProperty('--accent-color', firstColor)
          const rgb = colorToRgb(firstColor)
          console.log('转换的RGB:', rgb)
          document.documentElement.style.setProperty('--accent-color-rgb', rgb)
        } else {
          // 如果提取失败，使用默认颜色
          console.warn('提取颜色失败，使用默认值')
          document.documentElement.style.setProperty('--accent-color', '#667eea')
          document.documentElement.style.setProperty('--accent-color-rgb', '102, 126, 234')
        }
        console.log('设置后的值:', {
          gradient: getComputedStyle(document.documentElement).getPropertyValue('--accent-gradient'),
          color: getComputedStyle(document.documentElement).getPropertyValue('--accent-color')
        })
      } else {
        // 单色：设置主题色变量
        document.documentElement.style.setProperty('--accent-color', color)
        document.documentElement.style.setProperty('--accent-color-rgb', colorToRgb(color))
        // 自动生成渐变
        const gradient = generateGradient(color)
        document.documentElement.style.setProperty('--accent-gradient', gradient)
      }
    } else {
      document.documentElement.style.removeProperty('--accent-color')
      document.documentElement.style.removeProperty('--accent-color-rgb')
      document.documentElement.style.removeProperty('--accent-gradient')
    }
  }

  // 设置自定义主题色
  const setCustomAccentColor = (color) => {
    customAccentColor.value = color
    if (color) {
      localStorage.setItem('custom-accent-color', color)
      applyCustomAccentColor(color)
    } else {
      localStorage.removeItem('custom-accent-color')
      applyCustomAccentColor(null)
      // 重新应用主题的默认颜色
      applyTheme(theme.value)
    }
  }

  // 辅助函数：将hex颜色转换为rgb
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result 
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : '102, 126, 234'
  }

  // 辅助函数：将任意颜色格式转换为rgb
  const colorToRgb = (color) => {
    // 如果是hex格式
    if (color.startsWith('#')) {
      return hexToRgb(color)
    }
    // 如果是rgb或rgba格式，提取数字
    const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
    if (rgbMatch) {
      return `${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}`
    }
    return '102, 126, 234'
  }

  // 辅助函数：从渐变中提取第一个颜色
  const extractFirstColor = (gradient) => {
    // 匹配 hex 或 rgb/rgba 颜色
    const colorMatch = gradient.match(/#[a-f\d]{6}|#[a-f\d]{3}|rgba?\([^)]+\)/i)
    if (colorMatch) {
      const color = colorMatch[0].trim()
      // 如果是hex，直接返回
      if (color.startsWith('#')) {
        return color
      }
      // 如果是rgb/rgba，返回
      return color
    }
    return null
  }

  // 辅助函数：根据单色生成渐变
  const generateGradient = (color) => {
    // 简单的渐变生成：从原色到稍深的色
    return `linear-gradient(135deg, ${color}, ${darkenColor(color, 20)})`
  }

  // 辅助函数：加深颜色
  const darkenColor = (color, percent) => {
    if (color.startsWith('#')) {
      const rgb = hexToRgb(color).split(',').map(n => parseInt(n.trim()))
      const darkened = rgb.map(n => Math.max(0, Math.floor(n * (1 - percent / 100))))
      return `rgb(${darkened.join(', ')})`
    }
    return color
  }

  // 设置桌面歌词颜色
  const setDesktopLyricColor = (color) => {
    desktopLyricColor.value = color
    if (color) {
      localStorage.setItem('desktop-lyric-color', color)
    } else {
      localStorage.removeItem('desktop-lyric-color')
    }
  }

  // 设置桌面歌词大小
  const setDesktopLyricSize = (size) => {
    desktopLyricSize.value = size
    localStorage.setItem('desktop-lyric-size', size.toString())
  }

  // 设置播放页面和专注模式的视觉主题
  const setPlaybackVisualTheme = (themeName) => {
    playbackVisualTheme.value = themeName
    localStorage.setItem('playback-visual-theme', themeName)
  }

  // 监听主题变化
  watch(theme, (newTheme) => {
    applyTheme(newTheme)
    // 如果有自定义字体颜色，重新应用
    if (customTextColor.value) {
      applyCustomTextColor(customTextColor.value)
    }
    // 如果有自定义主题色，重新应用
    if (customAccentColor.value) {
      applyCustomAccentColor(customAccentColor.value)
    }
  })

  return {
    theme,
    customTextColor,
    customAccentColor,
    desktopLyricColor,
    desktopLyricSize,
    playbackVisualTheme,
    visualThemes,
    currentVisualTheme,
    initTheme,
    setTheme,
    setCustomTextColor,
    setCustomAccentColor,
    setDesktopLyricColor,
    setDesktopLyricSize,
    setPlaybackVisualTheme
  }
}, {
  persist: true
})

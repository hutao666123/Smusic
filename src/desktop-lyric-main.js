import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import DesktopLyric from './components/DesktopLyric.vue'
import { useThemeStore } from './stores/theme'

const app = createApp(DesktopLyric)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.mount('#app')

// 初始化主题设置（从 localStorage 加载）
const themeStore = useThemeStore()
themeStore.initTheme()

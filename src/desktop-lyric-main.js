import { createApp } from 'vue'
import { createPinia } from 'pinia'
import DesktopLyric from './components/DesktopLyric.vue'

const app = createApp(DesktopLyric)
const pinia = createPinia()

app.use(pinia)
app.mount('#app')

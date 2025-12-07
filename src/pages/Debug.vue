<template>
  <div class="debug">
    <h2>🔧 服务诊断</h2>
    
    <div class="status-grid">
      <div class="status-card">
        <h3>api-enhanced (端口 3000)</h3>
        <div :class="['status', apiStatus]">
          {{ apiStatus === 'connected' ? '✓ 已连接' : '✗ 未连接' }}
        </div>
        <button @click="testApiEnhanced" class="test-btn">测试连接</button>
      </div>

      <div class="status-card">
        <h3>解灰功能（内置于 api-enhanced）</h3>
        <div :class="['status', unblockStatus]">
          {{ unblockStatus === 'connected' ? '✓ 正常' : unblockStatus === 'disconnected' ? '✗ 异常' : '⏳ 未测试' }}
        </div>
        <button @click="testUnblock" class="test-btn">测试解灰</button>
      </div>
    </div>

    <div class="test-section">
      <h3>🎵 测试搜索</h3>
      <div class="search-box">
        <input v-model="testKeyword" placeholder="输入歌曲名称..." />
        <button @click="testSearch" class="test-btn">搜索</button>
      </div>
      <div v-if="searchResult" class="result">
        <pre>{{ JSON.stringify(searchResult, null, 2) }}</pre>
      </div>
    </div>

    <div class="test-section">
      <h3>🔗 测试播放 URL</h3>
      <div class="search-box">
        <input v-model="testSongId" placeholder="输入歌曲 ID..." />
        <button @click="testPlayUrl" class="test-btn">获取 URL</button>
      </div>
      <div v-if="urlResult" class="result">
        <pre>{{ JSON.stringify(urlResult, null, 2) }}</pre>
      </div>
    </div>

    <div class="log-section">
      <h3>📋 日志</h3>
      <div class="log">
        <div v-for="(log, index) in logs" :key="index" class="log-item">
          {{ log }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { apiRequest } from '../api/request'
import { searchSongs, getMusicUrl } from '../api/music'

const apiStatus = ref('unknown')
const unblockStatus = ref('unknown')
const testKeyword = ref('周杰伦')
const testSongId = ref('1901371647') // 一首灰度歌曲用于测试
const searchResult = ref(null)
const urlResult = ref(null)
const logs = ref([])

const addLog = (msg) => {
  const time = new Date().toLocaleTimeString()
  logs.value.unshift(`[${time}] ${msg}`)
  if (logs.value.length > 50) {
    logs.value.pop()
  }
}

const testApiEnhanced = async () => {
  try {
    addLog('正在测试 api-enhanced...')
    const res = await apiRequest.get('/search/suggest', {
      params: { keywords: '周杰伦' }
    })
    apiStatus.value = 'connected'
    addLog('✓ api-enhanced 连接成功')
  } catch (error) {
    apiStatus.value = 'disconnected'
    addLog(`✗ api-enhanced 连接失败: ${error.message}`)
  }
}

const testUnblock = async () => {
  try {
    addLog('正在测试 api-enhanced 内置解灰功能...')
    const res = await apiRequest.get('/song/url/match', {
      params: { id: 1901371647, source: 'kuwo,kugou' }
    })
    if (res.data?.data?.url) {
      unblockStatus.value = 'connected'
      addLog(`✓ 解灰功能正常，音源：${res.data.data.source}`)
    } else {
      unblockStatus.value = 'disconnected'
      addLog('✗ 解灰功能异常')
    }
  } catch (error) {
    unblockStatus.value = 'disconnected'
    addLog(`✗ 解灰功能测试失败: ${error.message}`)
  }
}

const testSearch = async () => {
  try {
    addLog(`正在搜索: ${testKeyword.value}...`)
    const res = await searchSongs(testKeyword.value, 5)
    searchResult.value = res.data
    addLog(`✓ 搜索成功，找到 ${res.data.result?.songs?.length || 0} 首歌曲`)
  } catch (error) {
    searchResult.value = { error: error.message }
    addLog(`✗ 搜索失败: ${error.message}`)
  }
}

const testPlayUrl = async () => {
  try {
    addLog(`正在获取播放 URL: ${testSongId.value}...`)
    const url = await getMusicUrl(testSongId.value)
    urlResult.value = { url, success: !!url }
    addLog(`${url ? '✓' : '✗'} ${url ? '获取成功' : '获取失败'}`)
  } catch (error) {
    urlResult.value = { error: error.message }
    addLog(`✗ 获取失败: ${error.message}`)
  }
}

// 自动测试
const autoTest = async () => {
  addLog('=== 开始自动诊断 ===')
  await testApiEnhanced()
  await testUnblock()
}

autoTest()
</script>

<style scoped>
.debug {
  color: white;
  padding: 20px;
}

h2 {
  margin-bottom: 30px;
  font-size: 28px;
}

h3 {
  margin: 20px 0 15px 0;
  font-size: 18px;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.status-card {
  background: rgba(0, 0, 0, 0.3);
  padding: 20px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.status-card h3 {
  margin: 0 0 15px 0;
  font-size: 16px;
}

.status {
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
  font-weight: bold;
  text-align: center;
}

.status.connected {
  background: rgba(76, 175, 80, 0.3);
  color: #4caf50;
  border: 1px solid #4caf50;
}

.status.disconnected {
  background: rgba(244, 67, 54, 0.3);
  color: #f44336;
  border: 1px solid #f44336;
}

.status.unknown {
  background: rgba(255, 193, 7, 0.3);
  color: #ffc107;
  border: 1px solid #ffc107;
}

.test-btn {
  width: 100%;
  padding: 10px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.3s;
}

.test-btn:hover {
  transform: scale(1.02);
}

.test-section {
  background: rgba(0, 0, 0, 0.3);
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.search-box {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.search-box input {
  flex: 1;
  padding: 10px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: white;
}

.search-box input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.search-box .test-btn {
  flex: 0 0 100px;
}

.result {
  background: rgba(0, 0, 0, 0.5);
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
  max-height: 300px;
  overflow-y: auto;
}

.result pre {
  margin: 0;
  font-size: 12px;
  color: #4caf50;
  font-family: 'Courier New', monospace;
}

.log-section {
  background: rgba(0, 0, 0, 0.3);
  padding: 20px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.log {
  background: rgba(0, 0, 0, 0.5);
  padding: 15px;
  border-radius: 4px;
  max-height: 300px;
  overflow-y: auto;
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.log-item {
  color: #4caf50;
  margin-bottom: 5px;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>

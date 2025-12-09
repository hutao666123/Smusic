const FileManager = require('../FileManager')
const PlaylistManager = require('../PlaylistManager')
const fs = require('fs').promises
const path = require('path')
const os = require('os')

// 测试用的临时目录
let tempDir
let fileManager
let playlistManager

// 辅助函数：创建测试用的 FileManager（禁用防抖）
function createTestFileManager(userDataPath) {
  return new FileManager(userDataPath, { debounceDelay: 0 })
}

beforeEach(async () => {
  // 为每个测试创建独立的临时目录
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'data-init-test-'))
  fileManager = createTestFileManager(tempDir)
  playlistManager = new PlaylistManager(fileManager)
})

afterEach(async () => {
  // 清理临时目录
  try {
    await fs.rm(tempDir, { recursive: true, force: true })
  } catch (error) {
    // 忽略清理错误
  }
})

describe('数据初始化逻辑', () => {
  test('应用启动时应该初始化数据目录', async () => {
    // 初始化数据目录
    const result = await fileManager.initDataDirectory()
    
    expect(result.success).toBe(true)
    
    // 验证目录是否创建
    const dataDir = path.join(tempDir, 'data')
    const downloadsDir = path.join(tempDir, 'downloads')
    const songsDir = path.join(tempDir, 'downloads', 'songs')
    const coversDir = path.join(tempDir, 'downloads', 'covers')
    
    const dataDirExists = await fs.access(dataDir).then(() => true).catch(() => false)
    const downloadsDirExists = await fs.access(downloadsDir).then(() => true).catch(() => false)
    const songsDirExists = await fs.access(songsDir).then(() => true).catch(() => false)
    const coversDirExists = await fs.access(coversDir).then(() => true).catch(() => false)
    
    expect(dataDirExists).toBe(true)
    expect(downloadsDirExists).toBe(true)
    expect(songsDirExists).toBe(true)
    expect(coversDirExists).toBe(true)
  })

  test('文件不存在时应该返回默认数据结构', async () => {
    await fileManager.initDataDirectory()
    
    // 获取 favorites（文件不存在）
    const favoritesResult = await playlistManager.getFavorites()
    expect(favoritesResult.success).toBe(true)
    expect(favoritesResult.data).toHaveProperty('version', '1.0')
    expect(favoritesResult.data).toHaveProperty('id', 'local-favorites')
    expect(favoritesResult.data).toHaveProperty('name', '我喜欢的音乐')
    expect(favoritesResult.data).toHaveProperty('songs')
    expect(Array.isArray(favoritesResult.data.songs)).toBe(true)
    expect(favoritesResult.data.songs.length).toBe(0)
    
    // 获取 downloads（文件不存在）
    const downloadsResult = await playlistManager.getDownloads()
    expect(downloadsResult.success).toBe(true)
    expect(downloadsResult.data).toHaveProperty('version', '1.0')
    expect(downloadsResult.data).toHaveProperty('id', 'local-downloads')
    expect(downloadsResult.data).toHaveProperty('name', '已下载')
    expect(downloadsResult.data).toHaveProperty('songs')
    expect(Array.isArray(downloadsResult.data.songs)).toBe(true)
    expect(downloadsResult.data.songs.length).toBe(0)
    
    // 获取自定义歌单（文件不存在）
    const customPlaylistsResult = await playlistManager.getCustomPlaylists()
    expect(customPlaylistsResult.success).toBe(true)
    expect(Array.isArray(customPlaylistsResult.data)).toBe(true)
    expect(customPlaylistsResult.data.length).toBe(0)
    
    // 获取收藏的歌单（文件不存在）
    const collectedPlaylistsResult = await playlistManager.getCollectedPlaylists()
    expect(collectedPlaylistsResult.success).toBe(true)
    expect(Array.isArray(collectedPlaylistsResult.data)).toBe(true)
    expect(collectedPlaylistsResult.data.length).toBe(0)
  })

  test('文件损坏时应该创建新的默认数据文件', async () => {
    await fileManager.initDataDirectory()
    
    // 创建一个损坏的 JSON 文件
    const corruptedData = '{ invalid json content'
    const favoritesPath = path.join(tempDir, 'data', 'favorites.json')
    await fs.writeFile(favoritesPath, corruptedData, 'utf-8')
    
    // 尝试获取 favorites
    const result = await playlistManager.getFavorites()
    
    // 应该返回默认数据
    expect(result.success).toBe(true)
    expect(result.data).toHaveProperty('version', '1.0')
    expect(result.data).toHaveProperty('id', 'local-favorites')
    expect(result.data).toHaveProperty('songs')
    expect(Array.isArray(result.data.songs)).toBe(true)
    
    // 验证新文件已经被创建
    const fileContent = await fs.readFile(favoritesPath, 'utf-8')
    const parsedData = JSON.parse(fileContent)
    expect(parsedData).toHaveProperty('version', '1.0')
    expect(parsedData).toHaveProperty('id', 'local-favorites')
  })

  test('应该能够创建默认数据文件', async () => {
    await fileManager.initDataDirectory()
    
    // 创建默认的 favorites.json
    const defaultFavorites = {
      version: '1.0',
      id: 'local-favorites',
      name: '我喜欢的音乐',
      createTime: Date.now(),
      updateTime: Date.now(),
      songs: []
    }
    
    const writeResult = await fileManager.writeJSON('favorites.json', defaultFavorites)
    expect(writeResult.success).toBe(true)
    
    // 验证文件是否存在
    const existsResult = await fileManager.fileExists('favorites.json')
    expect(existsResult.success).toBe(true)
    expect(existsResult.data).toBe(true)
    
    // 读取并验证内容
    const readResult = await fileManager.readJSON('favorites.json')
    expect(readResult.success).toBe(true)
    expect(readResult.data).toHaveProperty('version', '1.0')
    expect(readResult.data).toHaveProperty('id', 'local-favorites')
  })

  test('多次初始化应该是幂等的', async () => {
    // 第一次初始化
    const result1 = await fileManager.initDataDirectory()
    expect(result1.success).toBe(true)
    
    // 第二次初始化
    const result2 = await fileManager.initDataDirectory()
    expect(result2.success).toBe(true)
    
    // 第三次初始化
    const result3 = await fileManager.initDataDirectory()
    expect(result3.success).toBe(true)
    
    // 验证目录仍然存在
    const dataDir = path.join(tempDir, 'data')
    const dataDirExists = await fs.access(dataDir).then(() => true).catch(() => false)
    expect(dataDirExists).toBe(true)
  })
})

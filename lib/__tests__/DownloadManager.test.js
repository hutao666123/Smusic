const fc = require('fast-check')
const FileManager = require('../FileManager')
const PlaylistManager = require('../PlaylistManager')
const DownloadManager = require('../DownloadManager')
const fs = require('fs').promises
const path = require('path')
const os = require('os')
const http = require('http')

// 测试用的临时目录
let tempDir
let fileManager
let playlistManager
let downloadManager
let testServer
let testServerPort

// 歌曲生成�?
const songArbitrary = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  artists: fc.array(
    fc.record({
      id: fc.string({ minLength: 1, maxLength: 20 }),
      name: fc.string({ minLength: 1, maxLength: 50 })
    }),
    { minLength: 1, maxLength: 5 }
  ),
  album: fc.record({
    id: fc.string({ minLength: 1, maxLength: 20 }),
    name: fc.string({ minLength: 1, maxLength: 100 }),
    picUrl: fc.webUrl()
  }),
  duration: fc.integer({ min: 1000, max: 600000 }),
  quality: fc.constantFrom('standard', '320000', 'lossless')
})

// 创建测试 HTTP 服务�?
function createTestServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      // 模拟音频文件下载
      const fileContent = Buffer.from('fake audio content for testing')
      
      res.writeHead(200, {
        'Content-Type': 'audio/mpeg',
        'Content-Length': fileContent.length
      })
      
      res.end(fileContent)
    })
    
    server.listen(0, () => {
      const port = server.address().port
      resolve({ server, port })
    })
  })
}

beforeAll(async () => {
  // 启动测试服务�?
  const serverInfo = await createTestServer()
  testServer = serverInfo.server
  testServerPort = serverInfo.port
})

afterAll(async () => {
  // 关闭测试服务�?
  if (testServer) {
    await new Promise((resolve) => testServer.close(resolve))
  }
})

// 辅助函数：创建测试用�?FileManager（禁用防抖）
function createTestFileManager(userDataPath) {
  return new FileManager(userDataPath, { debounceDelay: 0 })
}

beforeEach(async () => {
  // 为每个测试创建独立的临时目录
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'download-test-'))
  fileManager = createTestFileManager(tempDir)
  await fileManager.initDataDirectory()
  playlistManager = new PlaylistManager(fileManager)
  downloadManager = new DownloadManager(fileManager, playlistManager)
})

afterEach(async () => {
  // 清理临时目录
  try {
    await fs.rm(tempDir, { recursive: true, force: true })
  } catch (error) {
    // 忽略清理错误
  }
})

describe('DownloadManager - 下载功能', () => {
  // **Feature: local-music-management, Property 21: 下载完成后的自动添加**
  test('属�?21：下载完成的歌曲应该自动添加�?已下�?歌单', async () => {
    await fc.assert(
      fc.asyncProperty(songArbitrary, async (song) => {
        // 为每次属性测试创建新的临时目录和管理�?
        const testTempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'download-prop21-'))
        const testFileManager = createTestFileManager(testTempDir)
        await testFileManager.initDataDirectory()
        const testPlaylistManager = new PlaylistManager(testFileManager)
        const testDownloadManager = new DownloadManager(testFileManager, testPlaylistManager)
        
        try {
          // 构造测�?URL
          const songUrl = `http://localhost:${testServerPort}/test.mp3`
          
          // 开始下�?
          const downloadResult = await testDownloadManager.downloadSong(song.id, songUrl, song)
          expect(downloadResult.success).toBe(true)
          
          const taskId = downloadResult.data.taskId
          
          // 等待下载完成（轮询任务状态）
          let completed = false
          let attempts = 0
          const maxAttempts = 50 // 最多等�?5 �?
          
          while (!completed && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100))
            const progressResult = testDownloadManager.getDownloadProgress(taskId)
            
            if (progressResult.success) {
              if (progressResult.data.status === 'completed') {
                completed = true
              } else if (progressResult.data.status === 'failed') {
                throw new Error(`下载失败: ${progressResult.data.error}`)
              }
            }
            
            attempts++
          }
          
          expect(completed).toBe(true)
          
          // 查询"已下�?歌单
          const downloadsResult = await testPlaylistManager.getDownloads()
          expect(downloadsResult.success).toBe(true)
          
          // 验证歌曲�?已下�?歌单�?
          const foundSong = downloadsResult.data.songs.find(s => s.id === song.id)
          expect(foundSong).toBeDefined()
          expect(foundSong.name).toBe(song.name)
          expect(foundSong.localPath).toBeDefined()
          expect(foundSong.fileSize).toBeGreaterThan(0)
        } finally {
          // 清理临时目录
          await fs.rm(testTempDir, { recursive: true, force: true })
        }
      }),
      { numRuns: 10 }
    )
  }, 60000)

  // **Feature: local-music-management, Property 22: 下载取消的清理�?*
  test('属�?22：取消下载后未完成的文件应该被删�?, async () => {
    await fc.assert(
      fc.asyncProperty(songArbitrary, async (song) => {
        // 为每次属性测试创建新的临时目录和管理�?
        const testTempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'download-prop22-'))
        const testFileManager = createTestFileManager(testTempDir)
        await testFileManager.initDataDirectory()
        const testPlaylistManager = new PlaylistManager(testFileManager)
        const testDownloadManager = new DownloadManager(testFileManager, testPlaylistManager)
        
        try {
          // 构造测�?URL
          const songUrl = `http://localhost:${testServerPort}/test.mp3`
          
          // 开始下�?
          const downloadResult = await testDownloadManager.downloadSong(song.id, songUrl, song)
          expect(downloadResult.success).toBe(true)
          
          const taskId = downloadResult.data.taskId
          
          // 等待一小段时间让下载开�?
          await new Promise(resolve => setTimeout(resolve, 50))
          
          // 取消下载
          const cancelResult = await testDownloadManager.cancelDownload(taskId)
          expect(cancelResult.success).toBe(true)
          expect(cancelResult.data.status).toBe('cancelled')
          
          // 验证任务状�?
          const progressResult = testDownloadManager.getDownloadProgress(taskId)
          expect(progressResult.success).toBe(true)
          expect(progressResult.data.status).toBe('cancelled')
          
          // 验证文件不存在（如果有创建的话）
          const expectedFilePath = path.join(testFileManager.songsDir, `${song.id}.mp3`)
          try {
            await fs.access(expectedFilePath)
            // 如果文件存在，测试失�?
            expect(true).toBe(false) // 强制失败
          } catch (error) {
            // 文件不存在，符合预期
            expect(error.code).toBe('ENOENT')
          }
        } finally {
          // 清理临时目录
          await fs.rm(testTempDir, { recursive: true, force: true })
        }
      }),
      { numRuns: 10 }
    )
  }, 60000)

  // **Feature: local-music-management, Property 23: 重复下载的幂等�?*
  test('属�?23：已下载的歌曲再次下载应该被跳过', async () => {
    await fc.assert(
      fc.asyncProperty(songArbitrary, async (song) => {
        // 为每次属性测试创建新的临时目录和管理�?
        const testTempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'download-prop23-'))
        const testFileManager = createTestFileManager(testTempDir)
        await testFileManager.initDataDirectory()
        const testPlaylistManager = new PlaylistManager(testFileManager)
        const testDownloadManager = new DownloadManager(testFileManager, testPlaylistManager)
        
        try {
          // 构造测�?URL
          const songUrl = `http://localhost:${testServerPort}/test.mp3`
          
          // 第一次下�?
          const downloadResult1 = await testDownloadManager.downloadSong(song.id, songUrl, song)
          expect(downloadResult1.success).toBe(true)
          
          const taskId1 = downloadResult1.data.taskId
          
          // 等待第一次下载完�?
          let completed = false
          let attempts = 0
          const maxAttempts = 50
          
          while (!completed && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100))
            const progressResult = testDownloadManager.getDownloadProgress(taskId1)
            
            if (progressResult.success) {
              if (progressResult.data.status === 'completed') {
                completed = true
              } else if (progressResult.data.status === 'failed') {
                throw new Error(`下载失败: ${progressResult.data.error}`)
              }
            }
            
            attempts++
          }
          
          expect(completed).toBe(true)
          
          // 获取第一次下载后�?已下�?歌单
          const downloadsResult1 = await testPlaylistManager.getDownloads()
          expect(downloadsResult1.success).toBe(true)
          const countAfterFirst = downloadsResult1.data.songs.length
          
          // 第二次下载相同歌�?
          const downloadResult2 = await testDownloadManager.downloadSong(song.id, songUrl, song)
          expect(downloadResult2.success).toBe(true)
          
          // 验证第二次下载被跳过
          expect(downloadResult2.message).toBe('歌曲已下载，跳过')
          expect(downloadResult2.data).toBeNull()
          
          // 获取第二次下载后�?已下�?歌单
          const downloadsResult2 = await testPlaylistManager.getDownloads()
          expect(downloadsResult2.success).toBe(true)
          
          // 验证歌单长度没有增加
          expect(downloadsResult2.data.songs.length).toBe(countAfterFirst)
        } finally {
          // 清理临时目录
          await fs.rm(testTempDir, { recursive: true, force: true })
        }
      }),
      { numRuns: 10 }
    )
  }, 60000)

  // **Feature: local-music-management, Property 24: 批量下载的完整�?*
  test('属�?24：批量下载应该处理所有歌曲（成功或失败）', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(songArbitrary, { minLength: 1, maxLength: 10 }),
        async (songs) => {
          // 为每次属性测试创建新的临时目录和管理�?
          const testTempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'download-prop24-'))
          const testFileManager = createTestFileManager(testTempDir)
          await testFileManager.initDataDirectory()
          const testPlaylistManager = new PlaylistManager(testFileManager)
          const testDownloadManager = new DownloadManager(testFileManager, testPlaylistManager)
          
          try {
            // 为每首歌曲添�?URL
            const songsWithUrl = songs.map(song => ({
              ...song,
              url: `http://localhost:${testServerPort}/test.mp3`
            }))
            
            // 批量下载
            const batchResult = await testDownloadManager.downloadPlaylist(songsWithUrl)
            expect(batchResult.success).toBe(true)
            
            const results = batchResult.data
            
            // 验证所有歌曲都被处理了
            const processedCount = results.success + results.failed + results.skipped
            expect(processedCount).toBe(results.total)
            expect(results.total).toBe(songs.length)
          } finally {
            // 清理临时目录
            await fs.rm(testTempDir, { recursive: true, force: true })
          }
        }
      ),
      { numRuns: 10 }
    )
  }, 120000)

  // **Feature: local-music-management, Property 25: 批量下载的错误隔�?*
  test('属�?25：批量下载中部分歌曲失败不应该阻止其他歌曲下�?, async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(songArbitrary, { minLength: 3, maxLength: 10 }),
        async (songs) => {
          // 为每次属性测试创建新的临时目录和管理�?
          const testTempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'download-prop25-'))
          const testFileManager = createTestFileManager(testTempDir)
          await testFileManager.initDataDirectory()
          const testPlaylistManager = new PlaylistManager(testFileManager)
          const testDownloadManager = new DownloadManager(testFileManager, testPlaylistManager)
          
          try {
            // 为歌曲添�?URL，其中一些使用无�?URL
            const songsWithUrl = songs.map((song, index) => ({
              ...song,
              // 每隔一首歌曲使用无�?URL
              url: index % 2 === 0 
                ? `http://localhost:${testServerPort}/test.mp3`
                : 'http://invalid-host-that-does-not-exist-12345.com/test.mp3'
            }))
            
            // 批量下载
            const batchResult = await testDownloadManager.downloadPlaylist(songsWithUrl)
            expect(batchResult.success).toBe(true)
            
            const results = batchResult.data
            
            // 验证有成功和失败的歌�?
            // 至少应该有一些成功的（使用有�?URL 的）
            const validUrlCount = Math.ceil(songs.length / 2)
            
            // 所有歌曲都应该被处�?
            const processedCount = results.success + results.failed + results.skipped
            expect(processedCount).toBe(results.total)
            
            // 应该有成功的下载（有�?URL 的歌曲）
            expect(results.success).toBeGreaterThan(0)
            
            // 应该有失败的下载（无�?URL 的歌曲）
            expect(results.failed).toBeGreaterThan(0)
          } finally {
            // 清理临时目录
            await fs.rm(testTempDir, { recursive: true, force: true })
          }
        }
      ),
      { numRuns: 5 }
    )
  }, 180000)

  // **Feature: local-music-management, Property 26: 批量下载统计的准确�?*
  test('属�?26：批量下载统计中成功数量 + 失败数量 + 跳过数量应该等于总歌曲数�?, async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(songArbitrary, { minLength: 1, maxLength: 10 }),
        async (songs) => {
          // 为每次属性测试创建新的临时目录和管理�?
          const testTempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'download-prop26-'))
          const testFileManager = createTestFileManager(testTempDir)
          await testFileManager.initDataDirectory()
          const testPlaylistManager = new PlaylistManager(testFileManager)
          const testDownloadManager = new DownloadManager(testFileManager, testPlaylistManager)
          
          try {
            // 为每首歌曲添�?URL
            const songsWithUrl = songs.map(song => ({
              ...song,
              url: `http://localhost:${testServerPort}/test.mp3`
            }))
            
            // 批量下载
            const batchResult = await testDownloadManager.downloadPlaylist(songsWithUrl)
            expect(batchResult.success).toBe(true)
            
            const results = batchResult.data
            
            // 验证统计准确�?
            const sum = results.success + results.failed + results.skipped
            expect(sum).toBe(results.total)
            expect(results.total).toBe(songs.length)
            
            // 验证统计数字都是非负�?
            expect(results.success).toBeGreaterThanOrEqual(0)
            expect(results.failed).toBeGreaterThanOrEqual(0)
            expect(results.skipped).toBeGreaterThanOrEqual(0)
          } finally {
            // 清理临时目录
            await fs.rm(testTempDir, { recursive: true, force: true })
          }
        }
      ),
      { numRuns: 10 }
    )
  }, 120000)
})

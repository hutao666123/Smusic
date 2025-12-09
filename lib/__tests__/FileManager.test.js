const fc = require('fast-check')
const FileManager = require('../FileManager')
const fs = require('fs').promises
const path = require('path')
const os = require('os')

// 测试用的临时目录
let tempDir
let fileManager

beforeEach(async () => {
  // 为每个测试创建独立的临时目录
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'filemanager-test-'))
  fileManager = new FileManager(tempDir)
})

afterEach(async () => {
  // 清理临时目录
  try {
    await fs.rm(tempDir, { recursive: true, force: true })
  } catch (error) {
    // 忽略清理错误
  }
})

describe('FileManager - 基本功能', () => {
  // **Feature: local-music-management, Property 4: 数据持久化的往返性**
  test('属性 4：写入然后读取应该返回相同的数据', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.stringMatching(/^[a-zA-Z0-9_-]+\.json$/),
        fc.record({
          version: fc.constant('1.0'),
          data: fc.array(fc.string(), { maxLength: 10 })
        }),
        async (fileName, data) => {
          // 初始化目录
          await fileManager.initDataDirectory()
          
          // 写入数据（使用 immediate 参数跳过防抖，确保测试快速完成）
          const writeResult = await fileManager.writeJSON(fileName, data, true)
          expect(writeResult.success).toBe(true)
          
          // 读取数据
          const readResult = await fileManager.readJSON(fileName)
          expect(readResult.success).toBe(true)
          
          // 验证数据一致
          expect(readResult.data).toEqual(data)
        }
      ),
      { numRuns: 100 }
    )
  })
})

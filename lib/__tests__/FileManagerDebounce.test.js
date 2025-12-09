const FileManager = require('../FileManager')
const fs = require('fs').promises
const path = require('path')
const os = require('os')

describe('FileManager 防抖功能测试', () => {
  let fileManager
  let testDir

  beforeEach(async () => {
    // 创建临时测试目录
    testDir = path.join(os.tmpdir(), `test-filemanager-debounce-${Date.now()}`)
    await fs.mkdir(testDir, { recursive: true })
    
    fileManager = new FileManager(testDir)
    await fileManager.initDataDirectory()
  })

  afterEach(async () => {
    // 清理测试目录
    try {
      await fs.rm(testDir, { recursive: true, force: true })
    } catch (error) {
      console.error('清理测试目录失败:', error)
    }
  })

  test('防抖写入应该延迟执行', async () => {
    const testData = { test: 'data', timestamp: Date.now() }
    
    // 启动写入（不等待）
    const writePromise = fileManager.writeJSON('test.json', testData)
    
    // 立即检查文件是否存在（应该不存在，因为还在防抖延迟中）
    const existsResult = await fileManager.fileExists('test.json')
    expect(existsResult.data).toBe(false)
    
    // 等待写入完成
    await writePromise
    
    // 现在文件应该存在
    const existsAfter = await fileManager.fileExists('test.json')
    expect(existsAfter.data).toBe(true)
    
    // 验证数据正确
    const readResult = await fileManager.readJSON('test.json')
    expect(readResult.success).toBe(true)
    expect(readResult.data).toEqual(testData)
  })

  test('多次快速写入应该只执行最后一次', async () => {
    const data1 = { version: 1 }
    const data2 = { version: 2 }
    const data3 = { version: 3 }
    
    // 快速连续写入三次
    fileManager.writeJSON('test.json', data1)
    fileManager.writeJSON('test.json', data2)
    const finalPromise = fileManager.writeJSON('test.json', data3)
    
    // 等待最后一次写入完成
    await finalPromise
    
    // 读取文件，应该是最后一次写入的数据
    const readResult = await fileManager.readJSON('test.json')
    expect(readResult.success).toBe(true)
    expect(readResult.data.version).toBe(3)
  })

  test('立即写入应该跳过防抖', async () => {
    const testData = { immediate: true, timestamp: Date.now() }
    
    // 使用 immediate 参数立即写入
    await fileManager.writeJSON('test.json', testData, true)
    
    // 文件应该立即存在
    const existsResult = await fileManager.fileExists('test.json')
    expect(existsResult.data).toBe(true)
    
    // 验证数据正确
    const readResult = await fileManager.readJSON('test.json')
    expect(readResult.success).toBe(true)
    expect(readResult.data).toEqual(testData)
  })

  test('flush 应该立即写入所有待处理的数据', async () => {
    const data1 = { file: 'file1', value: 1 }
    const data2 = { file: 'file2', value: 2 }
    const data3 = { file: 'file3', value: 3 }
    
    // 启动多个写入（不等待）
    fileManager.writeJSON('file1.json', data1)
    fileManager.writeJSON('file2.json', data2)
    fileManager.writeJSON('file3.json', data3)
    
    // 立即检查待写入数量
    expect(fileManager.getPendingWriteCount()).toBe(3)
    
    // 执行 flush
    const flushResult = await fileManager.flush()
    expect(flushResult.success).toBe(true)
    expect(flushResult.data.flushedCount).toBe(3)
    
    // 待写入队列应该为空
    expect(fileManager.getPendingWriteCount()).toBe(0)
    
    // 所有文件应该存在且数据正确
    const read1 = await fileManager.readJSON('file1.json')
    expect(read1.data).toEqual(data1)
    
    const read2 = await fileManager.readJSON('file2.json')
    expect(read2.data).toEqual(data2)
    
    const read3 = await fileManager.readJSON('file3.json')
    expect(read3.data).toEqual(data3)
  })

  test('shutdown 应该保存所有未写入的数据', async () => {
    const data1 = { shutdown: 'test1' }
    const data2 = { shutdown: 'test2' }
    
    // 启动写入（不等待）
    fileManager.writeJSON('shutdown1.json', data1)
    fileManager.writeJSON('shutdown2.json', data2)
    
    // 执行 shutdown
    const shutdownResult = await fileManager.shutdown()
    expect(shutdownResult.success).toBe(true)
    expect(shutdownResult.data.flushedCount).toBe(2)
    
    // 验证数据已写入
    const read1 = await fileManager.readJSON('shutdown1.json')
    expect(read1.data).toEqual(data1)
    
    const read2 = await fileManager.readJSON('shutdown2.json')
    expect(read2.data).toEqual(data2)
  })

  test('shutdown 后的写入应该立即执行', async () => {
    // 先执行 shutdown
    await fileManager.shutdown()
    
    const testData = { after: 'shutdown' }
    
    // shutdown 后写入应该立即执行
    await fileManager.writeJSON('after-shutdown.json', testData)
    
    // 文件应该立即存在
    const existsResult = await fileManager.fileExists('after-shutdown.json')
    expect(existsResult.data).toBe(true)
    
    const readResult = await fileManager.readJSON('after-shutdown.json')
    expect(readResult.data).toEqual(testData)
  })

  test('getPendingWriteCount 应该返回正确的待写入数量', async () => {
    expect(fileManager.getPendingWriteCount()).toBe(0)
    
    // 添加一些待写入的操作
    fileManager.writeJSON('pending1.json', { test: 1 })
    expect(fileManager.getPendingWriteCount()).toBe(1)
    
    fileManager.writeJSON('pending2.json', { test: 2 })
    expect(fileManager.getPendingWriteCount()).toBe(2)
    
    fileManager.writeJSON('pending3.json', { test: 3 })
    expect(fileManager.getPendingWriteCount()).toBe(3)
    
    // 等待所有写入完成
    await new Promise(resolve => setTimeout(resolve, 600))
    
    // 待写入队列应该为空
    expect(fileManager.getPendingWriteCount()).toBe(0)
  })

  test('对同一文件的多次写入应该只保留最后一次', async () => {
    // 快速写入同一文件多次
    fileManager.writeJSON('same-file.json', { version: 1 })
    fileManager.writeJSON('same-file.json', { version: 2 })
    fileManager.writeJSON('same-file.json', { version: 3 })
    fileManager.writeJSON('same-file.json', { version: 4 })
    const finalPromise = fileManager.writeJSON('same-file.json', { version: 5 })
    
    // 待写入队列中应该只有一个条目（同一文件）
    expect(fileManager.getPendingWriteCount()).toBe(1)
    
    // 等待写入完成
    await finalPromise
    
    // 读取文件，应该是最后一次写入的数据
    const readResult = await fileManager.readJSON('same-file.json')
    expect(readResult.data.version).toBe(5)
  })
})

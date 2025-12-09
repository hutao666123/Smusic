const fc = require('fast-check')

/**
 * 路径安全验证函数（从 preload.js 复制）
 * @param {string} filePath - 要验证的文件路径
 * @returns {boolean} - 路径是否安全
 */
function isPathSafe(filePath) {
  if (!filePath || typeof filePath !== 'string') {
    return false
  }
  
  // 检查是否包含路径遍历字符
  const dangerousPatterns = [
    '../',
    '..\\',
    '..',
    '%2e%2e',
    '%252e%252e',
    '..%2f',
    '..%5c'
  ]
  
  const lowerPath = filePath.toLowerCase()
  return !dangerousPatterns.some(pattern => lowerPath.includes(pattern))
}

describe('PathSecurity', () => {
  describe('isPathSafe', () => {
    // **Feature: local-music-management, Property 31: 路径验证的安全性**
    // **Validates: Requirements 10.5**
    test('should reject paths containing path traversal characters', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            // 生成包含危险模式的路径
            fc.string().map(s => `${s}../${s}`),
            fc.string().map(s => `${s}..\\${s}`),
            fc.string().map(s => `${s}..${s}`),
            fc.string().map(s => `${s}%2e%2e${s}`),
            fc.string().map(s => `${s}%252e%252e${s}`),
            fc.string().map(s => `${s}..%2f${s}`),
            fc.string().map(s => `${s}..%5c${s}`),
            // 大小写变体
            fc.string().map(s => `${s}../${s}`.toUpperCase()),
            fc.string().map(s => `${s}..\\${s}`.toUpperCase()),
            fc.string().map(s => `${s}%2E%2E${s}`),
            fc.string().map(s => `${s}%252E%252E${s}`)
          ),
          (dangerousPath) => {
            // 对于任何包含路径遍历字符的路径，系统应该拒绝操作
            const result = isPathSafe(dangerousPath)
            return result === false
          }
        ),
        { numRuns: 100 }
      )
    })

    test('should accept safe paths without traversal characters', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 })
            .filter(s => {
              // 过滤掉包含危险模式的字符串
              const lowerS = s.toLowerCase()
              return !lowerS.includes('..') && 
                     !lowerS.includes('%2e%2e') && 
                     !lowerS.includes('%252e%252e') &&
                     !lowerS.includes('..%2f') &&
                     !lowerS.includes('..%5c')
            }),
          (safePath) => {
            // 对于任何不包含路径遍历字符的路径，系统应该接受
            const result = isPathSafe(safePath)
            return result === true
          }
        ),
        { numRuns: 100 }
      )
    })

    test('should reject null or undefined paths', () => {
      expect(isPathSafe(null)).toBe(false)
      expect(isPathSafe(undefined)).toBe(false)
    })

    test('should reject non-string paths', () => {
      expect(isPathSafe(123)).toBe(false)
      expect(isPathSafe({})).toBe(false)
      expect(isPathSafe([])).toBe(false)
      expect(isPathSafe(true)).toBe(false)
    })

    test('should reject empty string', () => {
      expect(isPathSafe('')).toBe(false)
    })

    // 具体的危险路径示例测试
    test('should reject common path traversal attacks', () => {
      const dangerousPaths = [
        '../etc/passwd',
        '..\\windows\\system32',
        'songs/../../../etc/passwd',
        'downloads\\..\\..\\sensitive',
        'file..txt',
        '%2e%2e/etc/passwd',
        '%252e%252e/etc/passwd',
        '..%2fetc/passwd',
        '..%5cwindows',
        '../',
        '..\\',
        '..',
        'SONGS/../SYSTEM',
        'Downloads\\..\\..\\System'
      ]

      dangerousPaths.forEach(path => {
        expect(isPathSafe(path)).toBe(false)
      })
    })

    // 安全路径示例测试
    test('should accept safe file paths', () => {
      const safePaths = [
        'songs/123456.mp3',
        'downloads/music/song.mp3',
        'playlist-data.json',
        'covers/album-cover.jpg',
        'data/favorites.json',
        '123456',
        'custom-1701234567890',
        'local-favorites',
        'local-downloads'
      ]

      safePaths.forEach(path => {
        expect(isPathSafe(path)).toBe(true)
      })
    })
  })
})

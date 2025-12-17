import { onMounted, onUnmounted } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { showSuccess, showError, showWarning } from '@/utils/notification'

/**
 * 处理外部文件打开的组合式函数
 * 用于处理双击 MP3 文件打开应用的场景
 * @param {Object} options - 配置选项
 * @param {Object} options.dialog - naive-ui 的 dialog 实例
 */
export function useFileOpen({ dialog }) {
  const playerStore = usePlayerStore()

  /**
   * 生成本地文件的唯一 ID
   * @param {string} filePath - 文件路径
   * @returns {string} - 唯一 ID
   */
  const generateLocalFileId = (filePath) => {
    // 使用文件路径的简单 hash + 时间戳
    const hash = filePath.split('').reduce((acc, char) => {
      return ((acc << 5) - acc) + char.charCodeAt(0)
    }, 0)
    return `local-file-${Math.abs(hash)}-${Date.now()}`
  }

  /**
   * 处理打开音频文件
   * @param {string} filePath - 文件路径
   */
  const handleOpenAudioFile = async (filePath) => {
    try {      
      if (!dialog) {
        console.error('dialog 未注入')
        return
      }

      // 1. 读取文件元数据
      const metadataResult = await window.electron.getAudioMetadata(filePath)
      
      if (!metadataResult.success) {
        throw new Error(metadataResult.error?.message || '读取文件元数据失败')
      }

      const metadata = metadataResult.data

      // 2. 生成歌曲对象
      const song = {
        id: generateLocalFileId(filePath),
        name: metadata.name,
        artists: metadata.artists,
        album: metadata.album,
        duration: metadata.duration,
        localPath: filePath, // 重要：保存本地路径
        fileSize: metadata.fileSize,
        isLocalFile: true, // 标记为本地文件
        addTime: Date.now()
      }

      // 3. 询问用户是否导入到本地音乐
      const shouldImport = await new Promise((resolve) => {
        dialog.create({
          title: '打开音频文件',
          content: `是否将《${song.name}》导入到本地音乐库？\n\n导入后可以在"本地音乐"中管理此文件。`,
          positiveText: '导入并播放',
          negativeText: '仅播放',
          onPositiveClick: () => {
            resolve(true)
          },
          onNegativeClick: () => {
            resolve(false)
          },
          onClose: () => {
            resolve(false)
          }
        })
      })

      // 4. 如果选择导入，添加到本地音乐
      if (shouldImport) {
        try {
          const importResult = await window.electron.addLocalSong(song)
          if (importResult.success) {
            showSuccess('已导入到本地音乐并开始播放')
          } else {
            console.warn('导入失败，但继续播放:', importResult.error)
            showWarning('导入失败，但可以播放')
          }
        } catch (error) {
          console.error('导入到本地音乐失败:', error)
          showWarning('导入失败，但可以播放')
        }
      } else {
        showSuccess('开始播放')
      }

      // 5. 添加到播放列表
      playerStore.playlist = [song]
      playerStore.currentIndex = 0
      playerStore.forceLocalMode = true // 强制使用本地模式

      // 6. 自动播放
      setTimeout(() => {
        playerStore.play()
      }, 100)

    } catch (error) {
      showError(`打开文件失败: ${error.message}`)
    }
  }

  // 监听文件打开事件
  let unsubscribe = null

  onMounted(() => {
    if (window.electron && window.electron.onOpenAudioFile) {
      unsubscribe = window.electron.onOpenAudioFile(handleOpenAudioFile)
    }
  })

  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe()
    }
  })

  return {
    handleOpenAudioFile
  }
}

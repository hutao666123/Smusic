import { getLyric } from '../api/music'
import { usePlayerStore } from '../stores/player'

/**
 * 加载歌词 - 根据播放模式决定使用本地还是在线歌词
 * @param {string|number} songId - 歌曲 ID
 * @returns {Promise<string|null>} 歌词内容
 */
export async function loadLyric(songId) {
  if (!songId) return null

  try {
    const playerStore = usePlayerStore()
    
    // 如果是强制本地模式（已下载歌单），尝试读取本地歌词
    if (playerStore.forceLocalMode) {
      if (window.electron && window.electron.getLocalLyric) {
        try {
          const localLyricRes = await window.electron.getLocalLyric(songId)
          if (localLyricRes.success && localLyricRes.data) {
            return localLyricRes.data
          }
        } catch (error) {
          console.error('本地歌词读取失败:', error)
        }
      }
    }

    // 其他情况，从在线获取
    const lyricRes = await getLyric(songId)
    if (lyricRes.data.lrc && lyricRes.data.lrc.lyric) {
      return lyricRes.data.lrc.lyric
    }

    return null
  } catch (error) {
    console.error('加载歌词失败:', error)
    return null
  }
}

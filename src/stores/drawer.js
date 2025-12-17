import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useDrawerStore = defineStore('drawer', () => {
  const frames = ref([])

  // 从 localStorage 加载抽屉帧
  const loadFrames = () => {
    try {
      const stored = localStorage.getItem('drawerFrames')
      if (stored) {
        frames.value = JSON.parse(stored)
      }
    } catch (error) {
      console.error('加载抽屉帧失败:', error)
      frames.value = []
    }
  }

  // 保存抽屉帧到 localStorage
  const saveFrames = () => {
    try {
      localStorage.setItem('drawerFrames', JSON.stringify(frames.value))
    } catch (error) {
      console.error('保存抽屉帧失败:', error)
    }
  }

  // 创建抽屉帧
  const createFrame = (remark, songId, songName, playlistId, playlistName) => {
    const frame = {
      id: Date.now().toString(),
      remark: remark.slice(0, 30), // 限制备注长度
      songId,
      songName: songName.slice(0, 20), // 限制歌曲名长度
      playlistId,
      playlistName: playlistName.slice(0, 20), // 限制歌单名长度
      createdAt: Date.now()
    }
    
    frames.value.unshift(frame) // 添加到开头（最新在前）
    saveFrames()
    return frame
  }

  // 更新抽屉帧备注
  const updateFrameRemark = (frameId, newRemark) => {
    const frame = frames.value.find(f => f.id === frameId)
    if (frame) {
      frame.remark = newRemark.slice(0, 30)
      saveFrames()
      return true
    }
    return false
  }

  // 删除抽屉帧
  const deleteFrame = (frameId) => {
    const index = frames.value.findIndex(f => f.id === frameId)
    if (index !== -1) {
      frames.value.splice(index, 1)
      saveFrames()
      return true
    }
    return false
  }

  // 初始化时加载数据
  loadFrames()

  return {
    frames,
    createFrame,
    updateFrameRemark,
    deleteFrame
  }
})

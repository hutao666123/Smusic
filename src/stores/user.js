import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  loginByPhone,
  loginByEmail,
  checkLoginStatus,
  logout,
  getUserInfo,
  getUserDetail,
  getUserPlaylist,
  getUserLikeSongs
} from '../api/music'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref(null)
  const isLoggedIn = ref(false)
  const loading = ref(false)
  const error = ref(null)

  const userId = computed(() => userInfo.value?.account?.id)
  const nickname = computed(() => userInfo.value?.profile?.nickname)
  const avatarUrl = computed(() => userInfo.value?.profile?.avatarUrl)

  // 手机号登录
  const loginPhone = async (phone, password) => {
    loading.value = true
    error.value = null
    try {
      const res = await loginByPhone(phone, password)
      if (res.data.code === 200) {
        userInfo.value = res.data
        isLoggedIn.value = true
        // 保存 cookie
        if (res.data.cookie) {
          localStorage.setItem('neteaseCookie', res.data.cookie)
        }
        return true
      } else {
        error.value = res.data.message || '登录失败'
        return false
      }
    } catch (err) {
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  // 邮箱登录
  const loginEmail = async (email, password) => {
    loading.value = true
    error.value = null
    try {
      const res = await loginByEmail(email, password)
      if (res.data.code === 200) {
        userInfo.value = res.data
        isLoggedIn.value = true
        if (res.data.cookie) {
          localStorage.setItem('neteaseCookie', res.data.cookie)
        }
        return true
      } else {
        error.value = res.data.message || '登录失败'
        return false
      }
    } catch (err) {
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  // 检查登录状态
  const checkStatus = async () => {
    try {
      const res = await checkLoginStatus()
      if (res.data.data?.account) {
        userInfo.value = res.data.data
        isLoggedIn.value = true
        return true
      } else {
        isLoggedIn.value = false
        return false
      }
    } catch (err) {
      isLoggedIn.value = false
      return false
    }
  }

  // 获取用户信息
  const fetchUserInfo = async () => {
    if (!isLoggedIn.value) return false
    loading.value = true
    try {
      const res = await getUserInfo()
      if (res.data.code === 200) {
        userInfo.value = res.data
        return true
      }
      return false
    } catch (err) {
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  // 获取用户歌单
  const fetchUserPlaylists = async () => {
    if (!userId.value) return []
    try {
      const res = await getUserPlaylist(userId.value, 100)
      return res.data.playlist || []
    } catch (err) {
      console.error('获取用户歌单失败:', err)
      return []
    }
  }

  // 获取用户喜欢的歌曲
  const fetchLikeSongs = async () => {
    if (!userId.value) return []
    try {
      const res = await getUserLikeSongs(userId.value)
      return res.data.ids || []
    } catch (err) {
      console.error('获取喜欢的歌曲失败:', err)
      return []
    }
  }

  // 登出
  const logoutUser = async () => {
    try {
      await logout()
    } catch (err) {
      console.error('登出失败:', err)
    } finally {
      userInfo.value = null
      isLoggedIn.value = false
      localStorage.removeItem('neteaseCookie')
    }
  }

  // 清除错误
  const clearError = () => {
    error.value = null
  }

  return {
    userInfo,
    isLoggedIn,
    loading,
    error,
    userId,
    nickname,
    avatarUrl,
    loginPhone,
    loginEmail,
    checkStatus,
    fetchUserInfo,
    fetchUserPlaylists,
    fetchLikeSongs,
    logoutUser,
    clearError
  }
}, {
  persist: true
})

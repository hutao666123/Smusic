import { apiRequest } from './request'

// ==================== 搜索功能 ====================

// 搜索歌曲/歌手/歌单
export const search = (keywords, type = 1, limit = 30, offset = 0) => {
  return apiRequest.get('/cloudsearch', {
    params: {
      keywords,
      type, // 1=歌曲, 10=歌手, 100=歌手, 1000=歌单, 1002=用户, 1004=MV, 1006=歌词, 1009=电台
      limit,
      offset
    }
  })
}

// 搜索歌曲
export const searchSongs = (keywords, limit = 30, offset = 0) => {
  return search(keywords, 1, limit, offset)
}

// 搜索歌手
export const searchArtists = (keywords, limit = 30, offset = 0) => {
  return search(keywords, 100, limit, offset)
}

// 搜索歌单
export const searchPlaylists = (keywords, limit = 30, offset = 0) => {
  return search(keywords, 1000, limit, offset)
}

// 搜索用户
export const searchUsers = (keywords, limit = 30, offset = 0) => {
  return search(keywords, 1002, limit, offset)
}

// 搜索 MV
export const searchMV = (keywords, limit = 30, offset = 0) => {
  return search(keywords, 1004, limit, offset)
}

// 搜索建议
export const getSearchSuggests = (keywords) => {
  return apiRequest.get('/search/suggest', {
    params: { keywords }
  })
}

// ==================== 播放功能 ====================

// 获取播放 URL（带灰色歌曲解灰）
export const getMusicUrl = async (id) => {
  try {
    // 1. 先尝试获取官方 URL
    const res = await apiRequest.get('/song/url/v1', {
      params: { 
        id, 
        level: 'exhigh' // 极高音质
      }
    })
    
    const songData = res.data.data?.[0]
    
    // 检查是否为灰度歌曲
    // 判断条件：
    // 1. 没有 URL
    // 2. 或者有 freeTrialInfo 且不为 null（表示试听）
    // 3. 或者 fee 为 1（VIP歌曲）且没有 URL
    const isGray = !songData?.url || 
                   (songData?.freeTrialInfo && songData.freeTrialInfo !== null)
    
    if (songData?.url && !isGray) {
      console.log('✅ 使用官方 URL')
      return songData.url
    }

    // 2. 灰度歌曲，使用 api-enhanced 内置的 UnblockNeteaseMusic 多音源匹配
    console.log('🔓 检测到灰度歌曲，使用多音源解灰...')
    const matchRes = await apiRequest.get('/song/url/match', {
      params: { 
        id,
        // 优先使用质量好的音源： bodian  > qq > migu > kugou > pyncmd 
        // 移除 kuwo（酷我），因为这个源经常不可用
        source: 'bodian,qq,migu,kugou,pyncmd'
      }
    })
    
    const matchUrl = matchRes.data?.data?.url
    if (matchUrl) {
      console.log(`✅ 解灰成功，音源：${matchRes.data?.data?.source || '未知'}`)
      return matchUrl
    }

    console.error('❌ 无法获取播放 URL，所有音源均无法匹配')
    return null
  } catch (error) {
    console.error('❌ 获取播放 URL 失败:', error)
    return null
  }
}

// 获取多个歌曲的播放 URL
export const getMusicUrls = (ids) => {
  return apiRequest.get('/song/url', {
    params: { id: ids.join(',') }
  })
}

// 获取歌曲详情
export const getSongDetail = (ids) => {
  const idStr = Array.isArray(ids) ? ids.join(',') : ids
  return apiRequest.get('/song/detail', {
    params: { ids: idStr }
  })
}

// ==================== 歌词功能 ====================

// 获取歌词
export const getLyric = (id) => {
  return apiRequest.get('/lyric', {
    params: { id }
  })
}

// 获取逐字歌词
export const getWordLyric = (id) => {
  return apiRequest.get('/lyric/new', {
    params: { id }
  })
}

// ==================== 歌单功能 ====================

// 热门歌单
export const getTopPlaylist = (limit = 30, offset = 0, order = 'hot') => {
  return apiRequest.get('/top/playlist', {
    params: { limit, offset, order }
  })
}

// 精品歌单
export const getHighQualityPlaylist = (limit = 30, offset = 0, cat = '全部') => {
  return apiRequest.get('/top/playlist/highquality', {
    params: { limit, offset, cat }
  })
}

// 歌单详情
export const getPlaylistDetail = (id) => {
  return apiRequest.get('/playlist/detail', {
    params: { id }
  })
}

// 歌单所有歌曲（分页）
export const getPlaylistTracks = (id, limit = 50, offset = 0) => {
  return apiRequest.get('/playlist/track/all', {
    params: { id, limit, offset }
  })
}

// 推荐歌单
export const getPersonalizedPlaylist = (limit = 30) => {
  return apiRequest.get('/personalized', {
    params: { limit }
  })
}

// 推荐新歌
export const getPersonalizedNewSong = (limit = 10) => {
  return apiRequest.get('/personalized/newsong', {
    params: { limit }
  })
}

// 推荐 MV
export const getPersonalizedMV = (limit = 10) => {
  return apiRequest.get('/personalized/mv', {
    params: { limit }
  })
}

// 推荐歌曲（需登录）
export const getRecommendSongs = (limit = 30) => {
  return apiRequest.get('/recommend/songs', {
    params: { limit }
  })
}

// ==================== 排行榜功能 ====================

// 热门单曲
export const getTopSongs = (type = 0, limit = 30) => {
  return apiRequest.get('/top/song', {
    params: { type, limit }
  })
}

// 排行榜列表
export const getTopList = () => {
  return apiRequest.get('/toplist')
}

// 排行榜详情
export const getTopListDetail = (id) => {
  return apiRequest.get('/toplist/detail', {
    params: { id }
  })
}

// ==================== 用户功能 ====================

// 手机号登录
export const loginByPhone = (phone, password) => {
  return apiRequest.get('/login/cellphone', {
    params: { phone, password }
  })
}

// 邮箱登录
export const loginByEmail = (email, password) => {
  return apiRequest.get('/login', {
    params: { email, password }
  })
}

// 二维码登录 - 获取 key
export const getQRKey = () => {
  return apiRequest.get('/login/qr/key', {
    params: { qrimg: true }
  })
}

// 二维码登录 - 检查状态
export const checkQRStatus = (key) => {
  return apiRequest.get('/login/qr/check', {
    params: { key }
  })
}

// 检查登录状态
export const checkLoginStatus = () => {
  return apiRequest.get('/login/status')
}

// 登出
export const logout = () => {
  return apiRequest.get('/logout')
}

// 获取用户详情
export const getUserDetail = (uid) => {
  return apiRequest.get('/user/detail', {
    params: { uid }
  })
}

// 获取用户歌单
export const getUserPlaylist = (uid, limit = 30, offset = 0) => {
  return apiRequest.get('/user/playlist', {
    params: { uid, limit, offset }
  })
}

// 获取用户信息
export const getUserInfo = () => {
  return apiRequest.get('/user/account')
}

// 获取用户喜欢的歌曲
export const getUserLikeSongs = (uid) => {
  return apiRequest.get('/likelist', {
    params: { uid }
  })
}

// ==================== 私人 FM ====================

// 私人 FM（需登录）
export const getPersonalFM = () => {
  return apiRequest.get('/personal_fm')
}

// ==================== 评论功能 ====================

// 获取评论
export const getComments = (id, limit = 20, offset = 0, type = 0) => {
  return apiRequest.get('/comment/music', {
    params: { id, limit, offset, type }
  })
}

// 发送评论
export const postComment = (id, content, type = 0) => {
  return apiRequest.get('/comment', {
    params: { id, content, type }
  })
}

// 删除评论
export const deleteComment = (id, commentId, type = 0) => {
  return apiRequest.get('/comment/remove', {
    params: { id, commentId, type }
  })
}

// 评论点赞
export const likeComment = (id, commentId, type = 0) => {
  return apiRequest.get('/comment/like', {
    params: { id, commentId, type }
  })
}

// ==================== 收藏功能 ====================

// 添加到喜欢
export const likeMusic = (id) => {
  return apiRequest.get('/like', {
    params: { id }
  })
}

// 取消喜欢
export const unlikeMusic = (id) => {
  return apiRequest.get('/like', {
    params: { id, like: false }
  })
}

// 创建歌单
export const createPlaylist = (name, privacy = 0, type = 'NORMAL') => {
  return apiRequest.get('/playlist/create', {
    params: { name, privacy, type }
  })
}

// 删除歌单
export const deletePlaylist = (id) => {
  return apiRequest.get('/playlist/delete', {
    params: { id }
  })
}

// 编辑歌单
export const updatePlaylist = (id, name, desc = '') => {
  return apiRequest.get('/playlist/update', {
    params: { id, name, desc }
  })
}

// 添加歌曲到歌单
export const addTracksToPlaylist = (playlistId, trackIds) => {
  const ids = Array.isArray(trackIds) ? trackIds.join(',') : trackIds
  return apiRequest.get('/playlist/tracks', {
    params: { op: 'add', pid: playlistId, tracks: ids }
  })
}

// 从歌单删除歌曲
export const removeTracksFromPlaylist = (playlistId, trackIds) => {
  const ids = Array.isArray(trackIds) ? trackIds.join(',') : trackIds
  return apiRequest.get('/playlist/tracks', {
    params: { op: 'del', pid: playlistId, tracks: ids }
  })
}

// ==================== 歌手功能 ====================

// 获取歌手详情
export const getArtistDetail = (id) => {
  return apiRequest.get('/artist/detail', {
    params: { id }
  })
}

// 获取歌手歌曲
export const getArtistSongs = (id, limit = 50, offset = 0) => {
  return apiRequest.get('/artist/songs', {
    params: { id, limit, offset }
  })
}

// 获取歌手专辑
export const getArtistAlbums = (id, limit = 30, offset = 0) => {
  return apiRequest.get('/artist/album', {
    params: { id, limit, offset }
  })
}

// 获取歌手 MV
export const getArtistMV = (id, limit = 30, offset = 0) => {
  return apiRequest.get('/artist/mv', {
    params: { id, limit, offset }
  })
}

// ==================== 专辑功能 ====================

// 获取专辑详情
export const getAlbumDetail = (id) => {
  return apiRequest.get('/album', {
    params: { id }
  })
}

// 获取专辑动态
export const getAlbumDynamic = (id) => {
  return apiRequest.get('/album/detail/dynamic', {
    params: { id }
  })
}

// ==================== MV 功能 ====================

// 获取 MV 详情
export const getMVDetail = (mvid) => {
  return apiRequest.get('/mv/detail', {
    params: { mvid }
  })
}

// 获取 MV URL
export const getMVUrl = (id, r = 1080) => {
  return apiRequest.get('/mv/url', {
    params: { id, r }
  })
}

// 热门 MV
export const getHotMV = (limit = 30, offset = 0) => {
  return apiRequest.get('/mv/exclusive/rcmd', {
    params: { limit, offset }
  })
}

// ==================== 其他功能 ====================

// 获取每日推荐歌曲
export const getDailyRecommendSongs = () => {
  return apiRequest.get('/recommend/songs')
}

// 获取每日推荐歌单
export const getDailyRecommendPlaylists = () => {
  return apiRequest.get('/recommend/resource')
}

// 获取新碟上架
export const getNewAlbums = (limit = 30, offset = 0) => {
  return apiRequest.get('/album/new', {
    params: { limit, offset }
  })
}

// 获取电台分类
export const getRadioCategories = () => {
  return apiRequest.get('/dj/catelist')
}

// 获取电台列表
export const getRadioList = (cateId, limit = 30, offset = 0) => {
  return apiRequest.get('/dj/recommend/type', {
    params: { type: cateId, limit, offset }
  })
}

// 获取电台详情
export const getRadioDetail = (rid) => {
  return apiRequest.get('/dj/detail', {
    params: { rid }
  })
}

// 获取电台节目
export const getRadioPrograms = (rid, limit = 30, offset = 0) => {
  return apiRequest.get('/dj/program', {
    params: { rid, limit, offset }
  })
}

// 获取云盘歌曲
export const getCloudDiskSongs = (limit = 30, offset = 0) => {
  return apiRequest.get('/user/cloud', {
    params: { limit, offset }
  })
}

// 上传歌曲到云盘
export const uploadToCloud = (file) => {
  const formData = new FormData()
  formData.append('songFile', file)
  return apiRequest.post('/cloud/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

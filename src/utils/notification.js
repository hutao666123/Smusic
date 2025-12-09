/**
 * 全局通知和对话框工具
 * 使用 Naive UI 的 useMessage 和 useDialog
 */

let messageApi = null
let dialogApi = null
let notificationApi = null

/**
 * 初始化通知 API
 * 需要在 setup 中调用
 */
export function setupNotification(message, dialog, notification) {
  messageApi = message
  dialogApi = dialog
  notificationApi = notification
}

/**
 * 显示成功消息
 * @param {string} content - 消息内容
 * @param {number} duration - 持续时间（毫秒），默认 3000
 */
export function showSuccess(content, duration = 3000) {
  if (messageApi) {
    messageApi.success(content, { duration })
  } else {
    console.warn('Message API 未初始化')
  }
}

/**
 * 显示错误消息
 * @param {string} content - 消息内容
 * @param {number} duration - 持续时间（毫秒），默认 5000
 */
export function showError(content, duration = 5000) {
  if (messageApi) {
    messageApi.error(content, { duration })
  } else {
    console.error(content)
  }
}

/**
 * 显示警告消息
 * @param {string} content - 消息内容
 * @param {number} duration - 持续时间（毫秒），默认 4000
 */
export function showWarning(content, duration = 4000) {
  if (messageApi) {
    messageApi.warning(content, { duration })
  } else {
    console.warn(content)
  }
}

/**
 * 显示信息消息
 * @param {string} content - 消息内容
 * @param {number} duration - 持续时间（毫秒），默认 3000
 */
export function showInfo(content, duration = 3000) {
  if (messageApi) {
    messageApi.info(content, { duration })
  } else {
    console.info(content)
  }
}

/**
 * 显示加载消息
 * @param {string} content - 消息内容
 * @param {number} duration - 持续时间（毫秒），默认 0（不自动关闭）
 * @returns {Function} 关闭函数
 */
export function showLoading(content, duration = 0) {
  if (messageApi) {
    return messageApi.loading(content, { duration })
  } else {
    console.info(content)
    return () => {}
  }
}

/**
 * 显示确认对话框
 * @param {Object} options - 对话框选项
 * @param {string} options.title - 标题
 * @param {string} options.content - 内容
 * @param {string} options.positiveText - 确认按钮文本，默认"确定"
 * @param {string} options.negativeText - 取消按钮文本，默认"取消"
 * @param {Function} options.onPositiveClick - 确认回调
 * @param {Function} options.onNegativeClick - 取消回调
 * @returns {Promise<boolean>} 返回用户选择
 */
export function showConfirm(options) {
  return new Promise((resolve) => {
    if (dialogApi) {
      dialogApi.warning({
        title: options.title || '确认',
        content: options.content || '确定要执行此操作吗？',
        positiveText: options.positiveText || '确定',
        negativeText: options.negativeText || '取消',
        onPositiveClick: () => {
          if (options.onPositiveClick) {
            options.onPositiveClick()
          }
          resolve(true)
        },
        onNegativeClick: () => {
          if (options.onNegativeClick) {
            options.onNegativeClick()
          }
          resolve(false)
        },
        onClose: () => {
          resolve(false)
        }
      })
    } else {
      console.warn('Dialog API 未初始化')
      // 降级到原生 confirm
      const result = window.confirm(options.content || '确定要执行此操作吗？')
      resolve(result)
    }
  })
}

/**
 * 显示删除确认对话框
 * @param {string} itemName - 要删除的项目名称
 * @param {string} itemType - 项目类型（如"歌单"、"歌曲"等）
 * @returns {Promise<boolean>}
 */
export function showDeleteConfirm(itemName, itemType = '项目') {
  return showConfirm({
    title: `删除${itemType}`,
    content: `确定要删除${itemType}"${itemName}"吗？此操作无法撤销。`,
    positiveText: '删除',
    negativeText: '取消'
  })
}

/**
 * 显示删除下载文件确认对话框
 * @param {string} songName - 歌曲名称
 * @returns {Promise<boolean>}
 */
export function showDeleteDownloadConfirm(songName) {
  return showConfirm({
    title: '删除下载文件',
    content: `确定要删除"${songName}"的下载文件吗？本地文件将被永久删除。`,
    positiveText: '删除',
    negativeText: '取消'
  })
}

/**
 * 显示磁盘空间不足警告
 * @param {number} requiredSpace - 需要的空间（字节）
 * @param {number} availableSpace - 可用空间（字节）
 */
export function showDiskSpaceWarning(requiredSpace, availableSpace) {
  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
  }

  if (dialogApi) {
    dialogApi.error({
      title: '磁盘空间不足',
      content: `下载需要 ${formatSize(requiredSpace)}，但可用空间仅有 ${formatSize(availableSpace)}。请清理磁盘空间后重试。`,
      positiveText: '知道了'
    })
  } else {
    showError(`磁盘空间不足：需要 ${formatSize(requiredSpace)}，可用 ${formatSize(availableSpace)}`)
  }
}

/**
 * 显示通知（右上角通知）
 * @param {Object} options - 通知选项
 * @param {string} options.title - 标题
 * @param {string} options.content - 内容
 * @param {string} options.type - 类型：success, error, warning, info
 * @param {number} options.duration - 持续时间（毫秒），默认 4500
 */
export function showNotification(options) {
  if (notificationApi) {
    const type = options.type || 'info'
    notificationApi[type]({
      title: options.title,
      content: options.content,
      duration: options.duration || 4500
    })
  } else {
    console.warn('Notification API 未初始化')
    showInfo(options.content || options.title)
  }
}

/**
 * 处理 API 错误响应
 * @param {Object} result - API 响应结果
 * @param {string} defaultMessage - 默认错误消息
 * @returns {boolean} 是否成功
 */
export function handleApiError(result, defaultMessage = '操作失败') {
  if (!result.success) {
    const errorMessage = result.error?.message || defaultMessage
    showError(errorMessage)
    return false
  }
  return true
}

/**
 * 处理异步操作并显示加载和结果提示
 * @param {Function} asyncFn - 异步函数
 * @param {Object} options - 选项
 * @param {string} options.loadingText - 加载提示文本
 * @param {string} options.successText - 成功提示文本
 * @param {string} options.errorText - 错误提示文本
 * @returns {Promise<any>} 返回异步函数的结果
 */
export async function handleAsyncOperation(asyncFn, options = {}) {
  const {
    loadingText = '处理中...',
    successText = '操作成功',
    errorText = '操作失败'
  } = options

  const loading = showLoading(loadingText)

  try {
    const result = await asyncFn()
    loading.destroy()

    if (result && result.success === false) {
      showError(result.error?.message || errorText)
      return result
    }

    if (successText) {
      showSuccess(successText)
    }

    return result
  } catch (error) {
    loading.destroy()
    showError(error.message || errorText)
    throw error
  }
}

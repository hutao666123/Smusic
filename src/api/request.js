import axios from 'axios'

// api-enhanced 实例（内置多音源解灰功能）
export const apiRequest = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 10000
})

// 添加请求拦截器
apiRequest.interceptors.request.use(config => {
  const cookie = localStorage.getItem('neteaseCookie')
  if (cookie) {
    config.params = config.params || {}
    config.params.cookie = cookie
  }
  return config
})

// 添加响应拦截器
apiRequest.interceptors.response.use(
  response => response,
  error => {
    console.error('API 错误:', error)
    return Promise.reject(error)
  }
)

export default apiRequest

// import cache from "@/utils/cache";
// import { tansParams } from "@/utils/effyic";
import axios from 'axios'
import { showToast } from 'vant'

// 创建axios实例
const service = axios.create({
  baseURL: '/api/',
  // timeout: 1000 * 60 * 60,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// request拦截器
service.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token !== null)
      config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => {
    Promise.reject(error)
  },
)

// 响应拦截器
service.interceptors.response.use(
  (res) => {
    const code = res.data.code || 0
    if (code === 0) {
      return res.data
    }
    else {
      showToast({
        message: res.data.message,
        className: 'custom-toast',
      })
      return Promise.reject(res.data)
    }
  },
  (error) => {
    // 获取错误信息，优先从响应数据中获取
    const message = error.response?.data?.message || error.message || '请求失败'
    showToast({
      message,
      className: 'custom-toast',
    })
    return Promise.reject(error)
  },
)

export default service

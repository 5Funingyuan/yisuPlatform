import axios from 'axios'
import { message } from 'antd'

// 扩展 Axios 的返回类型
declare module 'axios' {
  export interface AxiosResponse<T = any> extends Promise<T> {}
}
const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    console.log(`🚀 发送请求: ${config.method?.toUpperCase()} ${config.url}`, config.data || config.params)
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器 - 处理后端的统一返回格式
request.interceptors.response.use(
  (response) => {
    console.log(`✅ 收到响应: ${response.config.url}`, response.data)
    // 后端返回格式: { success: boolean, data: any, message?: string }
    const res = response.data
    
    if (res.success === false) {
      message.error(res.message || '请求失败')
      return Promise.reject(res)
    }
    
    // 如果成功，直接返回 data 字段
    return res.data
  },
  (error) => {
    console.error('响应错误:', error)
    
    if (error.response) {
      console.log('错误状态:', error.response.status)
      console.log('错误数据:', error.response.data)
      
      switch (error.response.status) {
        case 401:
          message.error('登录已过期，请重新登录')
          localStorage.removeItem('token')
          localStorage.removeItem('userInfo')
          window.location.href = '/login'
          break
        case 403:
          message.error('没有权限访问')
          break
        case 404:
          message.error('请求的资源不存在')
          break
        case 500:
          message.error('服务器错误')
          break
        default:
          message.error(error.response.data?.message || '请求失败')
      }
    } else if (error.request) {
      console.log('没有收到响应:', error.request)
      message.error('服务器无响应，请检查后端是否启动')
    } else {
      message.error(error.message || '请求失败')
    }
    return Promise.reject(error)
  }
)

export default request
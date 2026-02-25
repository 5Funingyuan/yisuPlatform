import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { message } from 'antd';

// 创建 axios 实例
const request = axios.create({
  baseURL: '/api', // 通过 Vite 代理转发
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`🚀 发送请求: ${config.method?.toUpperCase()} ${config.url}`, config.data || config.params);
    return config;
  },
  (error) => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`✅ 响应成功: ${response.config.url}`, response.data);
    
    // 根据后端统一响应格式处理
    const { success, message: msg, data } = response.data;
    
    if (success === false) {
      // 业务逻辑错误
      message.error(msg || '操作失败');
      return Promise.reject(new Error(msg || '操作失败'));
    }
    
    return response.data;
  },
  (error: AxiosError) => {
    console.error('❌ 响应错误:', error);
    
    if (error.response) {
      const { status, data } = error.response as any;
      console.log('错误状态:', status);
      console.log('错误数据:', data);
      
      switch (status) {
        case 400:
          message.error(data?.message || '请求参数错误');
          break;
        case 401:
          message.error('登录已过期，请重新登录');
          // 清除本地 token
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // 跳转到登录页
          setTimeout(() => {
            window.location.href = '/login';
          }, 1500);
          break;
        case 403:
          message.error('没有权限执行此操作');
          break;
        case 404:
          message.error('请求的资源不存在');
          break;
        case 500:
          message.error('服务器内部错误');
          break;
        default:
          message.error(data?.message || '网络错误');
      }
    } else if (error.request) {
      message.error('网络连接失败，请检查网络');
    } else {
      message.error('请求配置错误');
    }
    
    return Promise.reject(error);
  }
);

export default request;
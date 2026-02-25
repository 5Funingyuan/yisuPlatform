import request from '@/utils/request'

export interface LoginParams {
  username: string
  password: string
}

export interface UserInfo {
  id: number
  username: string
  role: string
}

export interface LoginResult {
  token: string
  user: UserInfo  // 注意：后端返回的是 user 不是 userInfo
}

// 登录
export const login = (data: LoginParams) => {
  console.log('调用登录API，参数:', data)
  return request.post<LoginResult>('/auth/login', data)
}

// 注册
export const register = (data: LoginParams) => {
  return request.post<LoginResult>('/auth/register', data)
}

// 获取当前用户信息
export const getProfile = () => {
  return request.get<UserInfo>('/auth/profile')
}
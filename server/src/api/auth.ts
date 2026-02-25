import request from './request';

export interface LoginParams {
  username: string;
  password: string;
}

export interface RegisterParams {
  username: string;
  password: string;
}

export interface UserInfo {
  id: number;
  username: string;
  role: 'USER' | 'ADMIN';
  createdAt?: string;
}

export interface LoginResponse {
  token: string;
  user: UserInfo;
}

/**
 * 用户登录
 */
export const login = (data: LoginParams) => {
  return request.post<LoginResponse>('/auth/login', data);
};

/**
 * 用户注册
 */
export const register = (data: RegisterParams) => {
  return request.post<LoginResponse>('/auth/register', data);
};

/**
 * 获取当前用户信息
 */
export const getProfile = () => {
  return request.get<UserInfo>('/auth/profile');
};

/**
 * 退出登录（前端清除 token）
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};
import request from '../utils/request'

// 酒店状态类型
export type HotelStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED'

// 酒店接口定义
export interface Hotel {
  id: string
  name: string
  star: string
  address: string
  description?: string
  tags: string[]
  price: number
  promo?: string
  intro?: string
  coverImage?: string
  city: string
  status: HotelStatus
  ownerId: number
  createdAt?: string
  updatedAt?: string
}

// 酒店列表查询参数
export interface HotelListParams {
  city?: string
  keyword?: string
  minPrice?: number
  maxPrice?: number
  tags?: string
  ownerId?: number
  page?: number
  pageSize?: number
}

// 酒店列表返回结果
export interface HotelListResult {
  success: boolean
  data: Hotel[]
  total: number
}

// 创建酒店参数
export interface CreateHotelParams {
  name: string
  city: string
  address: string
  description?: string
  star?: string
  tags?: string[]
  price?: number
  promo?: string
  coverImage?: string
  intro?: string
  status?:string
}

// 更新酒店参数
export interface UpdateHotelParams extends Partial<CreateHotelParams> {}

// 获取酒店列表（公开）
export const getHotelList = async (params?: HotelListParams) => {
  const response = await request.get('/hotels', { params })
  console.log('API原始响应:', response) // 添加日志查看原始数据
  return response
}

// 获取酒店详情（公开）
export const getHotelDetail = (id: string) => {
  console.log('调用 getHotelDetail, id:', id)
  return request.get(`/hotels/${id}`)
}

// 创建酒店（需登录）
export const createHotel = (data: CreateHotelParams) => {
  return request.post<{ data: Hotel }>('/hotels', data)
}

// 更新酒店（需登录且有权限）
export const updateHotel = (id: string, data: UpdateHotelParams) => {
  return request.put<{ data: Hotel }>(`/hotels/${id}`, data)
}

// 删除酒店（需登录且有权限）
export const deleteHotel = (id: number) => {
  return request.delete(`/hotels/${id}`)
}

// 提交审核（酒店所有者）
export const submitHotelForReview = (id: string) => {
  return request.post(`/hotels/${id}/submit`, {})
}

// 审核通过（管理员）
export const approveHotel = (id: string) => {
  return request.post<{ data: Hotel }>(`/admin/hotels/${id}/approve`, {})
}

// 审核拒绝（管理员）
export const rejectHotel = (id: string) => {
  return request.post<{ data: Hotel }>(`/admin/hotels/${id}/reject`, {})
}

// 发布酒店（酒店所有者）
export const publishHotel = (id: number) => {
  return request.post(`/hotels/${id}/publish`, {})
}

// 下线酒店（酒店所有者）
export const offlineHotel = (id: number) => {
  return request.post(`/hotels/${id}/offline`, {})
}

// 获取我的酒店（当前用户创建的所有酒店）
export const getMyHotels = (params?: HotelListParams) => {
  return request.get<{ data: Hotel[] }>('/hotels/my/list', { params })
}

// 获取所有酒店（管理员专用）
export const getAdminHotelList = () => {
  return request.get<{ data: Hotel[] }>('/admin/hotels')
}


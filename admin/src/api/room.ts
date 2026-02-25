import request from '../utils/request'

// 房间状态
export type RoomStatus = 'ON' | 'OFF'

// 房间接口定义
export interface Room {
  id: number
  hotelId: number
  name: string
  price: number
  stock: number
  description?: string
  facilities: string[]
  status: RoomStatus
  createdAt?: string
  updatedAt?: string
}

// 创建房间参数
export interface CreateRoomParams {
  name: string
  price: number
  stock: number
  description?: string
  facilities?: string[]
  status?: RoomStatus
}

// 更新房间参数
export interface UpdateRoomParams extends Partial<CreateRoomParams> {}

// 为酒店创建房型
export const createRoom = (hotelId: string, data: CreateRoomParams) => {
  return request.post<{ data: Room }>(`/hotels/${hotelId}/rooms`, data)
}

// 更新房型
export const updateRoom = (id: number, data: UpdateRoomParams) => {
  return request.put<{ data: Room }>(`/rooms/${id}`, data)
}

// 获取房型详情
export const getRoomDetail = (id: number) => {
  return request.get<{ data: Room }>(`/rooms/${id}`)
}

// 获取酒店的所有房型
export const getRoomsByHotel = (hotelId: string) => {
  console.log('调用 getRoomsByHotel, hotelId:', hotelId)
  return request.get(`/hotels/${hotelId}/rooms`)
}

// 删除房型
export const deleteRoom = (id: number) => {
  return request.delete(`/rooms/${id}`)
}

// 更新房型库存
export const updateRoomStock = (id: number, quantity: number) => {
  return request.patch(`/rooms/${id}/stock`, { quantity })
}
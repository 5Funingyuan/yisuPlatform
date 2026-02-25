import request from './request';

// 房型类型
export interface Room {
  id: number;
  hotelId: number;
  name: string;
  price: number;
  stock: number;
  description?: string;
  facilities?: string[];
  status: 'ON' | 'OFF';
  createdAt: string;
  updatedAt: string;
}

// 创建房型参数
export interface CreateRoomParams {
  name: string;
  price: number;
  stock: number;
  description?: string;
  facilities?: string[];
}

// 更新房型参数
export interface UpdateRoomParams extends Partial<CreateRoomParams> {
  status?: 'ON' | 'OFF';
}

// 更新库存参数
export interface UpdateStockParams {
  quantity: number; // 正数增加，负数减少
}

/**
 * 获取酒店房型列表
 */
export const getRoomsByHotel = (hotelId: number) => {
  return request.get<Room[]>(`/hotels/${hotelId}/rooms`);
};

/**
 * 获取房型详情
 */
export const getRoomById = (id: number) => {
  return request.get<Room>(`/rooms/${id}`);
};

/**
 * 创建房型
 */
export const createRoom = (hotelId: number, data: CreateRoomParams) => {
  return request.post<Room>(`/hotels/${hotelId}/rooms`, data);
};

/**
 * 更新房型
 */
export const updateRoom = (id: number, data: UpdateRoomParams) => {
  return request.put<Room>(`/rooms/${id}`, data);
};

/**
 * 删除房型
 */
export const deleteRoom = (id: number) => {
  return request.delete(`/rooms/${id}`);
};

/**
 * 更新房型库存（管理员）
 */
export const updateRoomStock = (id: number, data: UpdateStockParams) => {
  return request.patch<{ stock: number }>(`/rooms/${id}/stock`, data);
};
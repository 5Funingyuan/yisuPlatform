import request from './request';

// 酒店状态类型
export type HotelStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'OFFLINE';

// 酒店接口返回类型
export interface Hotel {
  id: number;
  name: string;
  city: string;
  address: string;
  description?: string;
  star?: string;
  tags?: string[];
  price?: number;
  promo?: string;
  status: HotelStatus;
  ownerId?: number;
  coverImage?: string;
  intro?: string;
  createdAt: string;
  updatedAt: string;
  rooms?: Room[];
}

// 房型类型（用于酒店详情）
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
}

// 创建酒店参数
export interface CreateHotelParams {
  name: string;
  city: string;
  address: string;
  description?: string;
  star?: string;
  tags?: string[];
  price?: number;
  promo?: string;
  coverImage?: string;
  intro?: string;
}

// 更新酒店参数
export interface UpdateHotelParams extends Partial<CreateHotelParams> {}

// 查询酒店列表参数
export interface HotelQueryParams {
  city?: string;
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string;
  page?: number;
  limit?: number;
}

// 分页响应
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * 获取酒店列表（公开）
 */
export const getHotelList = (params?: HotelQueryParams) => {
  return request.get<PaginatedResponse<Hotel>>('/hotels', { params });
};

/**
 * 获取我的酒店（需登录）
 */
export const getMyHotels = (params?: Omit<HotelQueryParams, 'ownerId'>) => {
  return request.get<PaginatedResponse<Hotel>>('/hotels/my/list', { params });
};

/**
 * 获取酒店详情
 */
export const getHotelById = (id: number) => {
  return request.get<Hotel>(`/hotels/${id}`);
};

/**
 * 创建酒店
 */
export const createHotel = (data: CreateHotelParams) => {
  return request.post<Hotel>('/hotels', data);
};

/**
 * 更新酒店
 */
export const updateHotel = (id: number, data: UpdateHotelParams) => {
  return request.put<Hotel>(`/hotels/${id}`, data);
};

/**
 * 删除酒店
 */
export const deleteHotel = (id: number) => {
  return request.delete(`/hotels/${id}`);
};

/**
 * 提交酒店审核
 */
export const submitHotelForReview = (id: number) => {
  return request.post(`/hotels/${id}/submit`);
};

/**
 * 发布酒店
 */
export const publishHotel = (id: number) => {
  return request.post(`/hotels/${id}/publish`);
};

/**
 * 下线酒店
 */
export const offlineHotel = (id: number) => {
  return request.post(`/hotels/${id}/offline`);
};
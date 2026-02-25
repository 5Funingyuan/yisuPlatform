import request from './request';
import { Hotel, HotelQueryParams, PaginatedResponse } from './hotel';

/**
 * 获取所有酒店（管理员）
 */
export const getAllHotels = (params?: HotelQueryParams) => {
  return request.get<PaginatedResponse<Hotel>>('/admin/hotels', { params });
};

/**
 * 审核通过酒店
 */
export const approveHotel = (id: number) => {
  return request.post(`/admin/hotels/${id}/approve`);
};

/**
 * 审核拒绝酒店
 */
export const rejectHotel = (id: number) => {
  return request.post(`/admin/hotels/${id}/reject`);
};
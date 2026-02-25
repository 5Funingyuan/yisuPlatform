import request from './request';

// 订单状态
export type OrderStatus = 'PENDING' | 'PAID' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

// 订单类型
export interface Order {
  id: number;
  orderNo: string;
  userId: number;
  hotelId: number;
  roomId: number;
  checkIn: string;
  checkOut: string;
  nights: number;
  roomCount: number;
  totalPrice: number;
  status: OrderStatus;
  guestName: string;
  guestPhone: string;
  remark?: string;
  createdAt: string;
}

// 创建订单参数
export interface CreateOrderParams {
  hotelId: number;
  roomId: number;
  checkIn: string;
  checkOut: string;
  roomCount: number;
  guestName: string;
  guestPhone: string;
  remark?: string;
}

// 查询订单参数
export interface OrderQueryParams {
  status?: OrderStatus;
  page?: number;
  limit?: number;
}

/**
 * 创建订单
 */
export const createOrder = (data: CreateOrderParams) => {
  return request.post<Order>('/orders', data);
};

/**
 * 获取订单列表
 */
export const getOrderList = (params?: OrderQueryParams) => {
  return request.get<{
    items: Order[];
    total: number;
    page: number;
    limit: number;
  }>('/orders', { params });
};

/**
 * 获取订单详情
 */
export const getOrderById = (id: number) => {
  return request.get<Order>(`/orders/${id}`);
};

/**
 * 取消订单
 */
export const cancelOrder = (id: number) => {
  return request.post(`/orders/${id}/cancel`);
};

/**
 * 支付订单
 */
export const payOrder = (id: number) => {
  return request.post(`/orders/${id}/pay`);
};
import request from '../utils/request'

// 订单状态类型
export type OrderStatus = 'pending' | 'paid' | 'completed' | 'cancelled'

// 订单接口定义
export interface Order {
  id: string
  orderNo: string
  hotelId: string
  hotelName: string
  hotelImage?: string
  roomId: string
  roomName: string
  guestName: string
  guestPhone: string
  checkInDate: string
  checkOutDate: string
  nights: number
  roomCount: number
  totalAmount: number
  status: OrderStatus
  createTime: string
  remark?: string
}

// 订单列表查询参数
export interface OrderListParams {
  page?: number
  pageSize?: number
  status?: OrderStatus
  keyword?: string
  startDate?: string
  endDate?: string
}

// 订单列表返回结果
export interface OrderListResult {
  list: Order[]
  total: number
  page: number
  pageSize: number
}

// 创建订单参数
export interface CreateOrderParams {
  hotelId: string
  roomId: string
  checkInDate: string
  checkOutDate: string
  roomCount: number
  guestName: string
  guestPhone: string
  remark?: string
}

// 更新订单状态参数
export interface UpdateOrderStatusParams {
  status: OrderStatus
}

// 获取订单列表
export const getOrderList = (params?: OrderListParams) => {
  return request.get<OrderListResult>('/orders', { params })
}

// 获取订单详情
export const getOrderDetail = (id: string) => {
  return request.get<Order>(`/orders/${id}`)
}

// 创建订单
export const createOrder = (data: CreateOrderParams) => {
  return request.post<Order>('/orders', data)
}

// 更新订单状态
export const updateOrderStatus = (id: string, data: UpdateOrderStatusParams) => {
  return request.patch<Order>(`/orders/${id}/status`, data)
}

// 取消订单
export const cancelOrder = (id: string) => {
  return request.post<Order>(`/orders/${id}/cancel`)
}

// 获取订单统计数据
export const getOrderStats = () => {
  return request.get('/orders/stats')
}
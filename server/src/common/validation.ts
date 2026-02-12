import { z } from 'zod';

// 认证相关校验
export const registerSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6).max(100),
});

export const loginSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6).max(100),
});

// 酒店相关校验
export const createHotelSchema = z.object({
  name: z.string().min(2).max(100),
  city: z.string().min(1).max(50),
  address: z.string().min(5).max(200),
  description: z.string().optional(),
  star: z.string().optional(),
  tags: z.array(z.string()).optional(),
  price: z.number().min(0).optional(),
  promo: z.string().optional(),
});

export const updateHotelSchema = createHotelSchema.partial();

export const hotelQuerySchema = z.object({
  city: z.string().optional(),
  keyword: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  tags: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

// 房型相关校验
export const createRoomSchema = z.object({
  name: z.string().min(2).max(100),
  price: z.number().min(0),
  stock: z.number().int().min(0),
  description: z.string().optional(),
  facilities: z.array(z.string()).optional(),
});

export const updateRoomSchema = createRoomSchema.partial();
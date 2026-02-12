export interface CreateHotelDto {
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

export interface UpdateHotelDto extends Partial<CreateHotelDto> {}

export interface HotelQueryDto {
  city?: string;
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string;
  page?: number;
  limit?: number;
}

export interface HotelResponse {
  id: number;
  name: string;
  city: string;
  address: string;
  description?: string;
  star?: string;
  tags?: string[];
  price?: number;
  promo?: string;
  status: string;
  coverImage?: string;
  intro?: string;
  createdAt: Date;
  updatedAt: Date;
}
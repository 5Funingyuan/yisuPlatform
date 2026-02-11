export interface CreateRoomDto {
  name: string;
  price: number;
  stock: number;
  description?: string;
  facilities?: string[];
}

export interface UpdateRoomDto extends Partial<CreateRoomDto> {
  status?: 'ON' | 'OFF';
}

export interface RoomResponse {
  id: number;
  hotelId: number;
  name: string;
  price: number;
  stock: number;
  description?: string;
  facilities?: string[];
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
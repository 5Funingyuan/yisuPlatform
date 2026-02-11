import { AppDataSource } from '../../database/connection';
import { Room } from './room.model';
import { Hotel } from '../hotel/hotel.model';
import { CreateRoomDto, UpdateRoomDto } from './room.dto';
import { ApiResponse } from '../../common/response';

const roomRepository = AppDataSource.getRepository(Room);
const hotelRepository = AppDataSource.getRepository(Hotel);

export class RoomService {
  static async createRoom(hotelId: number, data: CreateRoomDto, userId: number, role: string): Promise<ApiResponse> {
    try {
      // 检查酒店是否存在且用户有权操作
      const hotel = await hotelRepository.findOne({ where: { id: hotelId } });
      
      if (!hotel) {
        return ApiResponse.error('酒店不存在');
      }

      // 权限检查：只有管理员或酒店所有者可以添加房型
      if (role !== 'ADMIN' && hotel.ownerId !== userId) {
        return ApiResponse.error('无权为此酒店添加房型');
      }

      // 检查酒店状态，只有已审核的酒店才能添加房型
      if (hotel.status !== 'APPROVED') {
        return ApiResponse.error('酒店未通过审核，无法添加房型');
      }

      const room = new Room();
      Object.assign(room, data);
      room.hotelId = hotelId;

      const savedRoom = await roomRepository.save(room);
      return ApiResponse.success(savedRoom, '房型创建成功');
    } catch (error) {
      console.error('创建房型失败:', error);
      return ApiResponse.error('创建房型失败');
    }
  }

  static async updateRoom(id: number, data: UpdateRoomDto, userId: number, role: string): Promise<ApiResponse> {
    try {
      const room = await roomRepository.findOne({ 
        where: { id },
        relations: ['hotel']
      });
      
      if (!room) {
        return ApiResponse.error('房型不存在');
      }

      // 权限检查：只有管理员或酒店所有者可以修改
      if (role !== 'ADMIN' && room.hotel.ownerId !== userId) {
        return ApiResponse.error('无权修改此房型');
      }

      Object.assign(room, data);
      const updatedRoom = await roomRepository.save(room);
      
      return ApiResponse.success(updatedRoom, '房型更新成功');
    } catch (error) {
      console.error('更新房型失败:', error);
      return ApiResponse.error('更新房型失败');
    }
  }

  static async getRoomById(id: number): Promise<ApiResponse> {
    try {
      const room = await roomRepository.findOne({ 
        where: { id },
        relations: ['hotel']
      });

      if (!room) {
        return ApiResponse.error('房型不存在');
      }

      return ApiResponse.success(room);
    } catch (error) {
      console.error('获取房型失败:', error);
      return ApiResponse.error('获取房型失败');
    }
  }

  static async getRoomsByHotel(hotelId: number): Promise<ApiResponse> {
    try {
      const rooms = await roomRepository.find({ 
        where: { 
          hotelId,
          status: 'ON' // 只返回可用的房型
        },
        order: { price: 'ASC' }
      });

      return ApiResponse.success(rooms);
    } catch (error) {
      console.error('获取酒店房型失败:', error);
      return ApiResponse.error('获取酒店房型失败');
    }
  }

  static async deleteRoom(id: number, userId: number, role: string): Promise<ApiResponse> {
    try {
      const room = await roomRepository.findOne({ 
        where: { id },
        relations: ['hotel']
      });
      
      if (!room) {
        return ApiResponse.error('房型不存在');
      }

      // 权限检查：只有管理员或酒店所有者可以删除
      if (role !== 'ADMIN' && room.hotel.ownerId !== userId) {
        return ApiResponse.error('无权删除此房型');
      }

      await roomRepository.remove(room);
      return ApiResponse.success(null, '房型删除成功');
    } catch (error) {
      console.error('删除房型失败:', error);
      return ApiResponse.error('删除房型失败');
    }
  }

  static async updateRoomStock(id: number, quantity: number): Promise<ApiResponse> {
    try {
      const room = await roomRepository.findOne({ where: { id } });
      
      if (!room) {
        return ApiResponse.error('房型不存在');
      }

      const newStock = room.stock + quantity;
      if (newStock < 0) {
        return ApiResponse.error('库存不足');
      }

      room.stock = newStock;
      await roomRepository.save(room);
      
      return ApiResponse.success({ stock: room.stock }, '库存更新成功');
    } catch (error) {
      console.error('更新库存失败:', error);
      return ApiResponse.error('更新库存失败');
    }
  }
}
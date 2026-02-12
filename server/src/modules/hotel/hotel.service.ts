import { AppDataSource } from '../../database/connection';
import { Hotel } from './hotel.model';
import { CreateHotelDto, UpdateHotelDto, HotelQueryDto, HotelResponse } from './hotel.dto';
import { ApiResponse } from '../../common/response';
import { Like, Between, In } from 'typeorm';

const hotelRepository = AppDataSource.getRepository(Hotel);

export class HotelService {
  static async createHotel(data: CreateHotelDto, ownerId: number): Promise<ApiResponse> {
    try {
      const hotel = new Hotel();
      Object.assign(hotel, data);
      hotel.ownerId = ownerId;
      hotel.status = 'DRAFT';

      const savedHotel = await hotelRepository.save(hotel);
      return ApiResponse.success(savedHotel, '酒店创建成功');
    } catch (error) {
      console.error('创建酒店失败:', error);
      return ApiResponse.error('创建酒店失败');
    }
  }

  static async updateHotel(id: number, data: UpdateHotelDto, userId: number, role: string): Promise<ApiResponse> {
    try {
      const hotel = await hotelRepository.findOne({ where: { id } });
      
      if (!hotel) {
        return ApiResponse.error('酒店不存在');
      }

      // 权限检查：只有管理员或酒店所有者可以修改
      if (role !== 'ADMIN' && hotel.ownerId !== userId) {
        return ApiResponse.error('无权修改此酒店');
      }

      Object.assign(hotel, data);
      
      // 如果修改了基本信息，状态重置为待审核
      if (data.name || data.city || data.address) {
        hotel.status = 'PENDING';
      }

      const updatedHotel = await hotelRepository.save(hotel);
      return ApiResponse.success(updatedHotel, '酒店更新成功');
    } catch (error) {
      console.error('更新酒店失败:', error);
      return ApiResponse.error('更新酒店失败');
    }
  }

  static async getHotelById(id: number): Promise<ApiResponse> {
    try {
      const hotel = await hotelRepository.findOne({ 
        where: { id },
        relations: ['rooms']
      });

      if (!hotel) {
        return ApiResponse.error('酒店不存在');
      }

      return ApiResponse.success(hotel);
    } catch (error) {
      console.error('获取酒店失败:', error);
      return ApiResponse.error('获取酒店失败');
    }
  }

  static async getHotels(query: HotelQueryDto, isAdmin = false): Promise<ApiResponse> {
    try {
      const {
        city,
        keyword,
        minPrice,
        maxPrice,
        tags,
        page = 1,
        limit = 10
      } = query;

      const where: any = {};

      // 用户端只能看到已审核且上线的酒店
      if (!isAdmin) {
        where.status = In(['APPROVED']);
      }

      if (city) {
        where.city = city;
      }

      if (keyword) {
        where.name = Like(`%${keyword}%`);
      }

      if (minPrice !== undefined || maxPrice !== undefined) {
        where.price = Between(minPrice || 0, maxPrice || 999999);
      }

      if (tags) {
        const tagArray = tags.split(',');
        where.tags = In(tagArray);
      }

      const [hotels, total] = await hotelRepository.findAndCount({
        where,
        skip: (page - 1) * limit,
        take: limit,
        order: { createdAt: 'DESC' }
      });

      return ApiResponse.success({
        items: hotels,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      });
    } catch (error) {
      console.error('查询酒店列表失败:', error);
      return ApiResponse.error('查询酒店列表失败');
    }
  }

  static async deleteHotel(id: number, userId: number, role: string): Promise<ApiResponse> {
    try {
      const hotel = await hotelRepository.findOne({ where: { id } });
      
      if (!hotel) {
        return ApiResponse.error('酒店不存在');
      }

      // 权限检查：只有管理员或酒店所有者可以删除
      if (role !== 'ADMIN' && hotel.ownerId !== userId) {
        return ApiResponse.error('无权删除此酒店');
      }

      await hotelRepository.remove(hotel);
      return ApiResponse.success(null, '酒店删除成功');
    } catch (error) {
      console.error('删除酒店失败:', error);
      return ApiResponse.error('删除酒店失败');
    }
  }

  static async submitForReview(id: number, userId: number): Promise<ApiResponse> {
    try {
      const hotel = await hotelRepository.findOne({ where: { id, ownerId: userId } });
      
      if (!hotel) {
        return ApiResponse.error('酒店不存在或无权限');
      }

      if (hotel.status !== 'DRAFT') {
        return ApiResponse.error('只有草稿状态的酒店可以提交审核');
      }

      hotel.status = 'PENDING';
      await hotelRepository.save(hotel);
      
      return ApiResponse.success(null, '已提交审核');
    } catch (error) {
      console.error('提交审核失败:', error);
      return ApiResponse.error('提交审核失败');
    }
  }

  // 管理员审核接口
  static async approveHotel(id: number): Promise<ApiResponse> {
    try {
      const hotel = await hotelRepository.findOne({ where: { id } });
      
      if (!hotel) {
        return ApiResponse.error('酒店不存在');
      }

      if (hotel.status !== 'PENDING') {
        return ApiResponse.error('只有待审核状态的酒店可以审核');
      }

      hotel.status = 'APPROVED';
      await hotelRepository.save(hotel);
      
      return ApiResponse.success(null, '酒店审核通过');
    } catch (error) {
      console.error('审核酒店失败:', error);
      return ApiResponse.error('审核酒店失败');
    }
  }

  static async rejectHotel(id: number): Promise<ApiResponse> {
    try {
      const hotel = await hotelRepository.findOne({ where: { id } });
      
      if (!hotel) {
        return ApiResponse.error('酒店不存在');
      }

      if (hotel.status !== 'PENDING') {
        return ApiResponse.error('只有待审核状态的酒店可以拒绝');
      }

      hotel.status = 'DRAFT';
      await hotelRepository.save(hotel);
      
      return ApiResponse.success(null, '酒店审核已拒绝');
    } catch (error) {
      console.error('拒绝酒店失败:', error);
      return ApiResponse.error('拒绝酒店失败');
    }
  }

  static async publishHotel(id: number, userId: number): Promise<ApiResponse> {
    try {
      const hotel = await hotelRepository.findOne({ 
        where: { id, ownerId: userId } 
      });
      
      if (!hotel) {
        return ApiResponse.error('酒店不存在或无权限');
      }

      if (hotel.status !== 'APPROVED') {
        return ApiResponse.error('只有已审核通过的酒店可以发布');
      }

      // 在实际项目中，这里可能会设置发布状态
      // 我们这里用状态转换来表示
      return ApiResponse.success(null, '酒店已发布');
    } catch (error) {
      console.error('发布酒店失败:', error);
      return ApiResponse.error('发布酒店失败');
    }
  }

  static async offlineHotel(id: number, userId: number): Promise<ApiResponse> {
    try {
      const hotel = await hotelRepository.findOne({ 
        where: { id, ownerId: userId } 
      });
      
      if (!hotel) {
        return ApiResponse.error('酒店不存在或无权限');
      }

      hotel.status = 'OFFLINE';
      await hotelRepository.save(hotel);
      
      return ApiResponse.success(null, '酒店已下线');
    } catch (error) {
      console.error('下线酒店失败:', error);
      return ApiResponse.error('下线酒店失败');
    }
  }
}
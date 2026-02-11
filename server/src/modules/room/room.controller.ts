import { Router, Response } from 'express';
import { RoomService } from './room.service';
import { createRoomSchema, updateRoomSchema } from '../../common/validation';
import { authMiddleware, AuthRequest } from '../../common/auth.middleware';
import { requireRole } from '../../common/role.guard';
import { ApiResponse } from '../../common/response';

const router = Router();

// 为酒店创建房型
router.post('/hotels/:hotelId/rooms', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(ApiResponse.error('未认证'));
    }

    const hotelId = parseInt(req.params.hotelId);
    const validatedData = createRoomSchema.parse(req.body);
    
    const result = await RoomService.createRoom(
      hotelId, 
      validatedData, 
      req.user.uid, 
      req.user.role
    );
    
    res.status(201).json(result);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json(ApiResponse.error('参数校验失败', error.errors[0].message));
    } else {
      console.error('创建房型错误:', error);
      res.status(500).json(ApiResponse.error('服务器内部错误'));
    }
  }
});

// 更新房型
router.put('/rooms/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(ApiResponse.error('未认证'));
    }

    const roomId = parseInt(req.params.id);
    const validatedData = updateRoomSchema.parse(req.body);
    
    const result = await RoomService.updateRoom(
      roomId, 
      validatedData, 
      req.user.uid, 
      req.user.role
    );
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(result.message?.includes('无权') ? 403 : 404).json(result);
    }
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json(ApiResponse.error('参数校验失败', error.errors[0].message));
    } else {
      console.error('更新房型错误:', error);
      res.status(500).json(ApiResponse.error('服务器内部错误'));
    }
  }
});

// 获取房型详情
router.get('/rooms/:id', async (req: AuthRequest, res: Response) => {
  try {
    const roomId = parseInt(req.params.id);
    const result = await RoomService.getRoomById(roomId);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('获取房型详情错误:', error);
    res.status(500).json(ApiResponse.error('服务器内部错误'));
  }
});

// 获取酒店的所有房型
router.get('/hotels/:hotelId/rooms', async (req: AuthRequest, res: Response) => {
  try {
    const hotelId = parseInt(req.params.hotelId);
    const result = await RoomService.getRoomsByHotel(hotelId);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('获取酒店房型列表错误:', error);
    res.status(500).json(ApiResponse.error('服务器内部错误'));
  }
});

// 删除房型
router.delete('/rooms/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(ApiResponse.error('未认证'));
    }

    const roomId = parseInt(req.params.id);
    const result = await RoomService.deleteRoom(
      roomId, 
      req.user.uid, 
      req.user.role
    );
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(result.message?.includes('无权') ? 403 : 404).json(result);
    }
  } catch (error) {
    console.error('删除房型错误:', error);
    res.status(500).json(ApiResponse.error('服务器内部错误'));
  }
});

// 更新房型库存（用于预订/取消预订）
router.patch('/rooms/:id/stock', authMiddleware, requireRole(['ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const roomId = parseInt(req.params.id);
    const { quantity } = req.body;
    
    if (typeof quantity !== 'number') {
      return res.status(400).json(ApiResponse.error('数量必须为数字'));
    }

    const result = await RoomService.updateRoomStock(roomId, quantity);
    res.status(200).json(result);
  } catch (error) {
    console.error('更新库存错误:', error);
    res.status(500).json(ApiResponse.error('服务器内部错误'));
  }
});

export const roomController = router;
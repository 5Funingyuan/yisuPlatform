import { Router, Response } from 'express';
import { HotelService } from './hotel.service';
import { 
  createHotelSchema, 
  updateHotelSchema, 
  hotelQuerySchema 
} from '../../common/validation';
import { authMiddleware, AuthRequest } from '../../common/auth.middleware';
import { requireRole } from '../../common/role.guard';
import { ApiResponse } from '../../common/response';

const router = Router();

// 创建酒店（需要登录）
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(ApiResponse.error('未认证'));
    }

    const validatedData = createHotelSchema.parse(req.body);
    const result = await HotelService.createHotel(validatedData, req.user.uid);
    
    res.status(201).json(result);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json(ApiResponse.error('参数校验失败', error.errors[0].message));
    } else {
      console.error('创建酒店错误:', error);
      res.status(500).json(ApiResponse.error('服务器内部错误'));
    }
  }
});

// 更新酒店（需要是酒店所有者或管理员）
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(ApiResponse.error('未认证'));
    }

    const hotelId = parseInt(req.params.id);
    const validatedData = updateHotelSchema.parse(req.body);
    const result = await HotelService.updateHotel(
      hotelId, 
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
      console.error('更新酒店错误:', error);
      res.status(500).json(ApiResponse.error('服务器内部错误'));
    }
  }
});

// 获取酒店详情（公开接口）
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const hotelId = parseInt(req.params.id);
    const result = await HotelService.getHotelById(hotelId);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('获取酒店详情错误:', error);
    res.status(500).json(ApiResponse.error('服务器内部错误'));
  }
});

// 查询酒店列表（公开接口）
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const validatedQuery = hotelQuerySchema.parse(req.query);
    
    // 检查是否是管理员（管理员可以看到所有状态的酒店）
    const isAdmin = req.user?.role === 'ADMIN';
    const result = await HotelService.getHotels(validatedQuery, isAdmin);
    
    res.status(200).json(result);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json(ApiResponse.error('参数校验失败', error.errors[0].message));
    } else {
      console.error('查询酒店列表错误:', error);
      res.status(500).json(ApiResponse.error('服务器内部错误'));
    }
  }
});

// 删除酒店（需要是酒店所有者或管理员）
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(ApiResponse.error('未认证'));
    }

    const hotelId = parseInt(req.params.id);
    const result = await HotelService.deleteHotel(
      hotelId, 
      req.user.uid, 
      req.user.role
    );
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(result.message?.includes('无权') ? 403 : 404).json(result);
    }
  } catch (error) {
    console.error('删除酒店错误:', error);
    res.status(500).json(ApiResponse.error('服务器内部错误'));
  }
});

// 提交审核（酒店所有者）
router.post('/:id/submit', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(ApiResponse.error('未认证'));
    }

    const hotelId = parseInt(req.params.id);
    const result = await HotelService.submitForReview(hotelId, req.user.uid);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('提交审核错误:', error);
    res.status(500).json(ApiResponse.error('服务器内部错误'));
  }
});

// 审核通过（管理员）
router.post('/:id/approve', authMiddleware, requireRole(['ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const hotelId = parseInt(req.params.id);
    const result = await HotelService.approveHotel(hotelId);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('审核通过错误:', error);
    res.status(500).json(ApiResponse.error('服务器内部错误'));
  }
});

// 审核拒绝（管理员）
router.post('/:id/reject', authMiddleware, requireRole(['ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const hotelId = parseInt(req.params.id);
    const result = await HotelService.rejectHotel(hotelId);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('审核拒绝错误:', error);
    res.status(500).json(ApiResponse.error('服务器内部错误'));
  }
});

// 发布酒店（酒店所有者）
router.post('/:id/publish', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(ApiResponse.error('未认证'));
    }

    const hotelId = parseInt(req.params.id);
    const result = await HotelService.publishHotel(hotelId, req.user.uid);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('发布酒店错误:', error);
    res.status(500).json(ApiResponse.error('服务器内部错误'));
  }
});

// 下线酒店（酒店所有者）
router.post('/:id/offline', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(ApiResponse.error('未认证'));
    }

    const hotelId = parseInt(req.params.id);
    const result = await HotelService.offlineHotel(hotelId, req.user.uid);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('下线酒店错误:', error);
    res.status(500).json(ApiResponse.error('服务器内部错误'));
  }
});

// 获取我的酒店（酒店所有者）
router.get('/my/list', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(ApiResponse.error('未认证'));
    }

    const result = await HotelService.getHotels(
      { ...req.query, ownerId: req.user.uid } as any,
      true // 所有者可以看到自己所有状态的酒店
    );
    
    res.status(200).json(result);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json(ApiResponse.error('参数校验失败', error.errors[0].message));
    } else {
      console.error('获取我的酒店错误:', error);
      res.status(500).json(ApiResponse.error('服务器内部错误'));
    }
  }
});

export const hotelController = router;
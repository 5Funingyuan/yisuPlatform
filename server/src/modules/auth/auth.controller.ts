import { Router, Request, Response } from 'express';
import { AuthService } from './auth.service';
import { registerSchema, loginSchema } from '../../common/validation';
import { authMiddleware, AuthRequest } from '../../common/auth.middleware';
import { ApiResponse } from '../../common/response';

const router = Router();

// 注册
router.post('/register', async (req: Request, res: Response) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const result = await AuthService.register(validatedData);
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json(ApiResponse.error('参数校验失败', error.errors[0].message));
    } else {
      console.error('注册错误:', error);
      res.status(500).json(ApiResponse.error('服务器内部错误'));
    }
  }
});

// 登录
router.post('/login', async (req: Request, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const result = await AuthService.login(validatedData);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(401).json(result);
    }
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json(ApiResponse.error('参数校验失败', error.errors[0].message));
    } else {
      console.error('登录错误:', error);
      res.status(500).json(ApiResponse.error('服务器内部错误'));
    }
  }
});

// 获取当前用户信息
router.get('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(ApiResponse.error('未认证'));
    }
    
    const result = await AuthService.getProfile(req.user.uid);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json(ApiResponse.error('服务器内部错误'));
  }
});

export const authController = router;
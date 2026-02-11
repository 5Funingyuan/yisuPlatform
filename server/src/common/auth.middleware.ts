import { Request, Response, NextFunction } from 'express';
import { JwtService } from './jwt';

export interface AuthRequest extends Request {
  user?: {
    uid: number;
    role: string;
  };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: '未提供认证令牌'
    });
  }

  const token = authHeader.substring(7);
  const payload = JwtService.verifyToken(token);

  if (!payload) {
    return res.status(401).json({
      success: false,
      message: '认证令牌无效或已过期'
    });
  }

  req.user = payload;
  next();
};
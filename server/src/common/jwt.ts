import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface JwtPayload {
  uid: number;
  role: string;
}

export class JwtService {
  static generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  }

  static verifyToken(token: string): JwtPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch (error) {
      return null;
    }
  }
}
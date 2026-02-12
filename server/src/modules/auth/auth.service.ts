import bcrypt from 'bcryptjs';
import { AppDataSource } from '../../database/connection';
import { User } from './auth.model';
import { RegisterDto, LoginDto, LoginResponse } from './auth.dto';
import { JwtService } from '../../common/jwt';
import { ApiResponse } from '../../common/response';

const userRepository = AppDataSource.getRepository(User);

export class AuthService {
  static async register(data: RegisterDto): Promise<ApiResponse> {
    try {
      // 检查用户名是否存在
      const existingUser = await userRepository.findOne({
        where: { username: data.username }
      });

      if (existingUser) {
        return ApiResponse.error('用户名已存在');
      }

      // 加密密码
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(data.password, salt);

      // 创建用户
      const user = new User();
      user.username = data.username;
      user.passwordHash = passwordHash;
      user.role = 'USER';

      const savedUser = await userRepository.save(user);

      // 生成JWT
      const token = JwtService.generateToken({
        uid: savedUser.id,
        role: savedUser.role
      });

      return ApiResponse.success({
        token,
        user: {
          id: savedUser.id,
          username: savedUser.username,
          role: savedUser.role
        }
      }, '注册成功');
    } catch (error) {
      console.error('注册失败:', error);
      return ApiResponse.error('注册失败');
    }
  }

  static async login(data: LoginDto): Promise<ApiResponse<LoginResponse>> {
    try {
      // 查找用户
      const user = await userRepository.findOne({
        where: { username: data.username }
      });

      if (!user) {
        return ApiResponse.error('用户名或密码错误');
      }

      // 验证密码
      const isValidPassword = await bcrypt.compare(data.password, user.passwordHash);
      if (!isValidPassword) {
        return ApiResponse.error('用户名或密码错误');
      }

      // 生成JWT
      const token = JwtService.generateToken({
        uid: user.id,
        role: user.role
      });

      return ApiResponse.success({
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        }
      }, '登录成功');
    } catch (error) {
      console.error('登录失败:', error);
      return ApiResponse.error('登录失败');
    }
  }

  static async getProfile(userId: number): Promise<ApiResponse> {
    try {
      const user = await userRepository.findOne({
        where: { id: userId },
        select: ['id', 'username', 'role', 'createdAt']
      });

      if (!user) {
        return ApiResponse.error('用户不存在');
      }

      return ApiResponse.success(user);
    } catch (error) {
      console.error('获取用户信息失败:', error);
      return ApiResponse.error('获取用户信息失败');
    }
  }
}
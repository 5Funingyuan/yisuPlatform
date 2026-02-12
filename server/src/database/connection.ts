import { DataSource } from 'typeorm';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: process.env.DATABASE_PATH || './data/yisu.db',
  synchronize: true, // 开发环境用，生产环境要禁用
  logging: true,
  entities: [path.join(__dirname, '..', '**', '*.model.{js,ts}')],
  migrations: [],
  subscribers: [],
});
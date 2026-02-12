import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  username: string;

  @Column({ type: 'varchar',name: 'password_hash', length: 255 })
  passwordHash: string;

  @Column({ type: 'varchar', length: 20, default: 'USER' })
  role: 'USER' | 'ADMIN';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
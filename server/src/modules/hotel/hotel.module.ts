import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany
} from 'typeorm';
import { User } from '../auth/auth.model';
import { Room } from '../room/room.model';

export type HotelStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'OFFLINE';

@Entity('hotels')
export class Hotel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 50 })
  city: string;

  @Column({ length: 200 })
  address: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  star: string;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

  @Column({ length: 200, nullable: true })
  promo: string;

  @Column({ 
    type: 'varchar', 
    length: 20, 
    default: 'DRAFT' 
  })
  status: HotelStatus;

  @Column({ name: 'owner_id' })
  ownerId: number;

  @Column({ name: 'cover_image', nullable: true })
  coverImage: string;

  @Column({ name: 'intro', length: 200, nullable: true })
  intro: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // 关系
  @ManyToOne(() => User, user => user.id)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @OneToMany(() => Room, room => room.hotel)
  rooms: Room[];
}
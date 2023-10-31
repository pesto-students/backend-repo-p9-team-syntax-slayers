import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { BaseEntity } from '../../common/BaseEntity';
import { Salon } from './Salon.entity';
import { User } from './User.entity';

@Entity({ name: 'bookmarked' })
export class Bookmarked extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Salon, (salon) => salon.bookmarkes)
  @JoinColumn({ name: 'salon_id' })
  salon!: Salon;

  @ManyToOne(() => User, (user) => user.bookmarkes)
  @JoinColumn({ name: 'user_id' })
  user!: User;
}

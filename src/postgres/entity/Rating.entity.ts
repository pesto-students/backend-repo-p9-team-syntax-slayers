import {
  Entity,
  Column,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../common/BaseEntity';
import { Salon } from './Salon.entity';
import { User } from './User.entity';

@Entity({ name: 'rating' })
// Add the @Index decorator to create a composite index on user_id and salon_id
//  one user to give only one rating for a particular salon.
@Index(['user', 'salon'], { unique: true })
export class Rating extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Salon, (salon) => salon.ratings) // Many Ratings can belong to one salon
  @JoinColumn({ name: 'salon_id' })
  salon!: Salon;

  @ManyToOne(() => User, (user) => user.ratings) // Many Ratings Can belong to one user for a salon
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'int', nullable: true })
  rating!: number;

  @Column({ type: 'text', nullable: true })
  feedback!: string;

  @Column({ type: 'integer', nullable: false, default: 1 })
  is_active!: number;
}

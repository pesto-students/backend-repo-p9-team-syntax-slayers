import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../common/BaseEntity';
import { User } from './User.entity';
import { Salon } from './Salon.entity';
import { BookingService } from './BookingService.entity';

@Entity({ name: 'booking', schema: 'public' })
export class Booking extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', nullable: true })
  order_id!: string;

  @ManyToOne(() => User, (user) => user.bookings)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Salon, (salon) => salon.bookings)
  @JoinColumn({ name: 'salon_id' })
  salon!: Salon;

  @OneToMany(() => BookingService, (bookingService) => bookingService.booking)
  bookingService!: BookingService[];

  @Column({ type: 'timestamp' })
  start_time!: Date;

  @Column({ type: 'timestamp' })
  end_time!: Date;
}

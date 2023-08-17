import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/BaseEntity';
import { Salon } from './Salon.entity';
import { Booking } from './Booking.entity';

@Entity({ name: 'time_slot' })
export class TimeSlots extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: false })
  @ManyToOne(() => Salon, (salon) => salon.id)
  salon_id!: string;

  @Column({ type: 'uuid', nullable: false })
  @ManyToOne(() => Booking, (booking) => booking.id)
  booking_id!: string;

  @CreateDateColumn({ type: 'date' })
  date!: Date;

  @Column({ type: 'timestamp' })
  start_time!: Date;

  @Column({ type: 'timestamp' })
  end_time!: Date;
}

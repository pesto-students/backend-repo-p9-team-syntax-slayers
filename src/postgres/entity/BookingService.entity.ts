import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/BaseEntity';
import { Booking } from './Booking.entity';
import { Service } from './Service.entity';

@Entity({ name: 'booking_service' })
export class BookingService extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Booking, (booking) => booking.bookingService)
  @JoinColumn({ name: 'booking_id' })
  booking!: Booking;

  @ManyToOne(() => Service, (service) => service.bookingService)
  @JoinColumn({ name: 'service_id' })
  service!: Service;
}

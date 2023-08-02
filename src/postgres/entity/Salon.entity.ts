import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/BaseEntity';
import { Service } from './Service.entity';
import { Bookmarked } from './Bookmarked.entity';
import { Booking } from './Booking.entity';
import { Rating } from './Rating.entity';

@Entity({ name: 'salon' })
export class Salon extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 255 })
  address!: string;

  @Column({ type: 'varchar', length: 20 })
  contact_number!: string;

  @Column({ type: 'double precision', default: 0 })
  rating!: number;

  @Column({ type: 'bigint', default: 0 })
  rating_count!: number;

  @Column({ type: 'enum', enum: ['male', 'female', 'unisex'] })
  gender!: string;

  @Column({ type: 'time', nullable: false })
  open_untill!: Date;

  @Column({ type: 'time', nullable: false })
  open_from!: Date;

  @Column({ type: 'integer', default: 0 })
  temp_inactive!: number;

  @Column({ type: 'jsonb', nullable: true })
  banner!: Record<string, any>;

  @Column({ type: 'integer', default: 0 })
  kyc_completed!: number;

  @Column({ type: 'integer', default: 0 })
  is_active!: number;

  @OneToMany(() => Service, (service) => service.salon) // One salon can have many services
  services!: Service[];

  @OneToMany(() => Rating, (rating) => rating.salon) // One salon can have many ratings
  ratings!: Rating[];

  @OneToMany(() => Bookmarked, (bookmarked) => bookmarked.salon) // One salon can have many bookmarks
  bookmarkes!: Bookmarked[];

  @OneToMany(() => Booking, (booking) => booking.salon) // One salon can have many bookings
  bookings!: Booking[];
}

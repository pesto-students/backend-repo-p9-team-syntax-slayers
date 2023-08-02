import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  OneToMany,
} from 'typeorm';
import { IsEmail } from 'class-validator';
import { BaseEntity } from '../../common/BaseEntity';
import { Booking } from './Booking.entity';
import { Rating } from './Rating.entity';
import { Bookmarked } from './Bookmarked.entity';

@Entity({ name: 'user' }) // Set the table name explicitly to 'user'
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 40, unique: true }) // Set the maximum length to 255 characters
  @IsEmail()
  @Index()
  email!: string;

  @Column({ type: 'varchar', length: 100 }) // Set the maximum length to 100 characters
  password!: string;

  @Column({ type: 'text', nullable: true })
  profile_pic_url!: string;

  @Column({ type: 'varchar', length: 50, nullable: false }) // Set the maximum length to 50 characters
  firstname!: string;

  @Column({ type: 'varchar', length: 50, nullable: false }) // Set the maximum length to 50 characters
  lastname!: string;

  @Column({ type: 'integer', default: 1 })
  is_active!: number;

  @Column({
    type: 'enum',
    enum: ['salon_admin', 'user'],
    default: 'user',
    nullable: false,
  })
  type!: string;

  @OneToMany(() => Booking, (booking) => booking.user)
  bookings!: Booking[];

  @OneToMany(() => Rating, (rating) => rating.user)
  ratings!: Rating[];

  @OneToMany(() => Bookmarked, (bookmarked) => bookmarked.user)
  bookmarkes!: Bookmarked[];
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
  JoinColumn,
  ManyToOne,
  Point,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { BaseEntity } from '../../common/BaseEntity';
import { Service } from './Service.entity';
import { Bookmarked } from './Bookmarked.entity';
import { Booking } from './Booking.entity';
import { Rating } from './Rating.entity';
import { User } from './User.entity';
import { City } from './City.entity';
import { TreatmentTag } from './TreatmentTag.entity';
import { Cart } from './Cart.entity';

@Entity({ name: 'salon' })
export class Salon extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 255 })
  address!: string;

  @Column({ type: 'text', nullable: true, name: 'description' })
  description!: string;

  @Column({ type: 'varchar', length: 20 })
  contact_number!: string;

  @Column({ type: 'double precision', default: 0 })
  rating!: number;

  @Column({ type: 'tsvector', nullable: true })
  search_vector: any;

  @Column({ type: 'bigint', default: 0 })
  rating_count!: number;

  @Column({ type: 'enum', enum: ['male', 'female', 'unisex'] })
  gender!: string;

  @Column({ type: 'time', nullable: false })
  open_untill!: Date;

  // Add the spatial column for the salon's location
  // ST_MakePoint(latitude, longitude) Ex: For Banglore= lat = 12.971599 long = 77.594566
  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: false,
  })
  location!: Point;

  @Column({ type: 'time', nullable: false })
  open_from!: Date;

  @Column({ type: 'integer', default: 0 })
  temp_inactive!: number;

  @Column({ type: 'jsonb', nullable: true })
  banner!: Record<string, any>;

  @Column({ type: 'integer', default: 0 })
  kyc_completed!: number;

  @Column({ type: 'integer', default: 1 })
  is_active!: number;

  @OneToMany(() => Service, (service) => service.salon) // One salon can have many services
  services!: Service[];

  @OneToMany(() => Rating, (rating) => rating.salon) // One salon can have many ratings
  ratings!: Rating[];

  @OneToMany(() => Bookmarked, (bookmarked) => bookmarked.salon) // One salon can have many bookmarks
  bookmarkes!: Bookmarked[];

  @OneToMany(() => Booking, (booking) => booking.salon) // One salon can have many bookings
  bookings!: Booking[];

  @ManyToOne(() => City, (city) => city.salon)
  @JoinColumn({ name: 'city_id' })
  city!: City;

  @OneToOne(() => User, (user) => user.salon)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToMany(() => TreatmentTag, (treatmentTag) => treatmentTag.salons)
  @JoinTable({
    name: 'treatment_tag_salon',
    joinColumn: { name: 'salon_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'treatment_tag_id', referencedColumnName: 'id' },
  })
  treatment_tags!: TreatmentTag[];

  @ManyToMany(() => Cart, (cart) => cart.services)
  @JoinTable({
    name: 'cart_service', // Replace 'cart_service' with the actual join table name
    joinColumn: { name: 'service_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'cart_id', referencedColumnName: 'id' },
  })
  carts!: Cart[];
}

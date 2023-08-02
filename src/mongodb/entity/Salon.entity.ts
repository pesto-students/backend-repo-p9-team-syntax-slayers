import { Entity, ObjectIdColumn, ObjectId, Column } from 'typeorm';

@Entity({ name: 'salon' })
export class Salon {
  @ObjectIdColumn()
  id!: ObjectId;

  @Column({ type: 'varchar', length: 50 })
  name!: string;

  @Column({ type: 'varchar', length: 50 })
  address!: string;

  @Column({
    type: 'json',
    select: false, // Exclude coordinates from query results by default
  })
  coordinates!: {
    type: {
      type: string;
      enum: ['Point'];
      required: true;
    };
    coordinates: [number, number];
    geohash: string;
  };

  @Column({ type: 'varchar', length: 20 })
  contact_number!: string;

  @Column({ type: 'double precision' })
  rating!: number;

  @Column({ type: 'bigint' })
  rating_count!: number;

  @Column({ type: 'timestamp' })
  created_at!: Date;

  @Column({ type: 'timestamp' })
  updated_at!: Date;

  @Column({ type: 'enum', enum: ['male', 'female'] })
  gender!: string;

  @Column({ type: 'time' })
  open_untill!: string;

  @Column({ type: 'time' })
  open_from!: string;

  @Column({ type: 'integer' })
  temp_inactive!: number;

  @Column({ type: 'jsonb' })
  banner: any;

  @Column({ type: 'integer' })
  kyc_completed!: number;

  @Column({ type: 'integer' })
  is_active!: number;
}

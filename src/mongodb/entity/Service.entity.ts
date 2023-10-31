import { Entity, ObjectIdColumn, ObjectId, Column } from 'typeorm';

@Entity({ name: 'service' })
export class Service {
  @ObjectIdColumn()
  id!: ObjectId;

  @Column({ type: 'uuid' })
  salon_id!: string;

  @Column({ type: 'varchar', length: 30 })
  name!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'int' })
  price!: number;

  @Column({ type: 'int' })
  duration!: number;

  @Column({ type: 'timestamp' })
  created_at!: Date;

  @Column({ type: 'timestamp' })
  updated_at!: Date;

  @Column({ type: 'integer' })
  is_active!: number;

  @Column({ type: 'integer' })
  featured!: number;
}

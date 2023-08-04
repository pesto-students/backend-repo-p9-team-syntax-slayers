import {
  Entity,
  JoinColumn,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../common/BaseEntity';
import { Salon } from './Salon.entity';

@Entity({ name: 'city' })
export class City extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: false })
  name!: string;

  @Column({ type: 'integer', default: 1 })
  is_active!: number;

  @OneToMany(() => Salon, (salon) => salon.city)
  salon!: Salon[];
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from './User.entity';
import { Salon } from './Salon.entity';
import { Service } from './Service.entity';

@Entity()
export class Cart {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.carts)
  user!: User;

  @ManyToOne(() => Salon, (salon) => salon.carts)
  salon!: Salon;

  @ManyToMany(() => Service)
  @JoinTable()
  services!: Service[];
}

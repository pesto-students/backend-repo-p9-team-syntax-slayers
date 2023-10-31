import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { BaseEntity } from '../../common/BaseEntity';
import { Salon } from './Salon.entity';
import { BookingService } from './BookingService.entity';
import { TreatmentTag } from './TreatmentTag.entity';

@Entity({ name: 'service' })
export class Service extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'int' })
  price!: number;

  @Column({ type: 'int' })
  duration!: number;

  @Column({ type: 'integer', default: 1 })
  is_active!: number;

  @Column({ type: 'integer', default: 0 })
  featured!: number;

  @ManyToOne(() => Salon, (salon) => salon.services)
  @JoinColumn({ name: 'salon_id' })
  salon!: Salon;

  @OneToMany(() => BookingService, (bookingService) => bookingService.service)
  bookingService!: BookingService[];

  @ManyToMany(
    () => TreatmentTag,
    (treatmentTag) => treatmentTag.treatmentTagServices,
  )
  @JoinTable({
    name: 'treatment_tag_service',
    joinColumn: { name: 'service_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'treatment_tag_id', referencedColumnName: 'id' },
  })
  treatment_tags!: TreatmentTag[];
}

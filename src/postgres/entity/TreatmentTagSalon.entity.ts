import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../../common/BaseEntity';
import { Salon } from './Salon.entity';
import { TreatmentTag } from './TreatmentTag.entity';

@Entity({ name: 'Treatment_tag_salon' })
export class TreatmentTagSalon extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: false })
  @ManyToOne(() => Salon, (salon) => salon.id)
  salon_id!: string;

  @Column({ type: 'uuid', nullable: false })
  @ManyToOne(() => TreatmentTag, (treatmentTag) => treatmentTag.id)
  treatment_tag_id!: string;
}

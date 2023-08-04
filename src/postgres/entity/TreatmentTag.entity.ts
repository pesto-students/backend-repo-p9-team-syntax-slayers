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
import { Service } from './Service.entity';
// import { TreatmentTagService } from './TreatmentTagService.entity';

@Entity({ name: 'treatment_tag' })
export class TreatmentTag extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: false })
  name!: string;

  @Column({ type: 'text', nullable: true, name: 'description' })
  description!: string;

  @Column({ type: 'text', nullable: true })
  treatment_pic_url!: string;

  @ManyToMany(() => Salon, (salon) => salon.treatment_tags)
  @JoinTable({
    name: 'treatment_tag_salon',
    joinColumn: { name: 'treatment_tag_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'salon_id', referencedColumnName: 'id' },
  })
  salons!: Salon[];

  @ManyToMany(() => Service, (service) => service.treatment_tags)
  @JoinTable({
    name: 'treatment_tag_service',
    joinColumn: { name: 'treatment_tag_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'service_id', referencedColumnName: 'id' },
  })
  treatmentTagServices!: Service[];
}

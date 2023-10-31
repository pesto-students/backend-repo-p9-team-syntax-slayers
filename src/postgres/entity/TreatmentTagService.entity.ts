// import {
//   Entity,
//   Column,
//   ManyToOne,
//   PrimaryGeneratedColumn,
//   JoinColumn,
// } from 'typeorm';
// import { BaseEntity } from '../../common/BaseEntity';
// import { Salon } from './Salon.entity';
// import { TreatmentTag } from './TreatmentTag.entity';
// import { Service } from './Service.entity';

// @Entity({ name: 'treatment_tag_service' })
// export class TreatmentTagService extends BaseEntity {
//   @PrimaryGeneratedColumn('uuid')
//   id!: string;

//   @ManyToOne(() => Service, (service) => service.id)
//   @JoinColumn({ name: 'service_id' })
//   service_id!: string;

//   @ManyToOne(() => TreatmentTag, (treatmentTag) => treatmentTag.id)
//   @JoinColumn({ name: 'treatment_tag_id' })
//   treatment_tag_id!: string;
// }

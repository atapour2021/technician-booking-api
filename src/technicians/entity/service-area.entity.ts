import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Technician } from './technician.entity';

@Entity()
export class ServiceArea {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  city: string;

  @Column()
  district: string;

  @ManyToOne(() => Technician, (technician) => technician.serviceAreas, {
    onDelete: 'CASCADE',
  })
  technician: Technician;
}

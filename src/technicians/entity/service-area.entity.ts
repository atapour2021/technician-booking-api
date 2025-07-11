import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Technician } from './technician.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class ServiceArea {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @ApiProperty()
  city: string;

  @Column()
  @ApiProperty()
  district: string;

  @ManyToOne(() => Technician, (technician) => technician.serviceAreas, {
    onDelete: 'CASCADE',
  })
  technician: Technician;
}

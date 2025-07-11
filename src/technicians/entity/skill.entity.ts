import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Technician } from './technician.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Skill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @ApiProperty()
  title: string;

  @ManyToOne(() => Technician, (technician) => technician.skills, {
    onDelete: 'CASCADE',
  })
  technician: Technician;
}

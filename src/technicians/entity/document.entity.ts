import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Technician } from './technician.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Document {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @ApiProperty()
  title: string;

  @Column()
  @ApiProperty()
  fileUrl: string;

  @ManyToOne(() => Technician, (technician) => technician.documents, {
    onDelete: 'CASCADE',
  })
  technician: Technician;
}

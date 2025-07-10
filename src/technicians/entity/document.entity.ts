import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Technician } from './technician.entity';

@Entity()
export class Document {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string; // مثلاً: "مدرک فنی حرفه‌ای"

  @Column()
  fileUrl: string;

  @ManyToOne(() => Technician, (technician) => technician.documents, {
    onDelete: 'CASCADE',
  })
  technician: Technician;
}

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Technician } from './technician.entity';

@Entity()
export class Skill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string; // مثلاً: "برق‌کاری"

  @ManyToOne(() => Technician, (technician) => technician.skills, {
    onDelete: 'CASCADE',
  })
  technician: Technician;
}

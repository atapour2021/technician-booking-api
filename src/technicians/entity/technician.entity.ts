import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Document } from './document.entity';
import { ServiceArea } from './service-area.entity';
import { Skill } from './skill.entity';

@Entity()
export class Technician {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fullName: string;

  @Column({ unique: true })
  phone: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true, unique: true })
  avatarUrl: string;

  @OneToMany(() => Skill, (skill) => skill.technician, { cascade: true })
  skills: Skill[];

  @OneToMany(() => ServiceArea, (area) => area.technician, { cascade: true })
  serviceAreas: ServiceArea[];

  @OneToMany(() => Document, (doc) => doc.technician, { cascade: true })
  documents: Document[];
}

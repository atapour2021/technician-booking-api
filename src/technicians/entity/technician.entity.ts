import { User } from 'src/users/user.entity';
import {
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Document } from './document.entity';
import { ServiceArea } from './service-area.entity';
import { Skill } from './skill.entity';

@Entity()
export class Technician {
  @PrimaryGeneratedColumn()
  id: number;

  @JoinColumn()
  @OneToOne(() => User, (user) => user.id, { eager: true })
  user: User;

  @OneToMany(() => Skill, (skill) => skill.technician, { eager: true })
  skills: Skill[];

  @OneToMany(() => ServiceArea, (area) => area.technician, { eager: true })
  serviceAreas: ServiceArea[];

  @OneToMany(() => Document, (doc) => doc.technician, { eager: true })
  documents: Document[];
}

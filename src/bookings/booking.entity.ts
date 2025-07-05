import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Service } from '../services/service.entity';
import { User } from '../users/user.entity';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELED = 'canceled',
  DONE = 'done',
}

export enum PaymentStatus {
  UNPAID = 'unpaid',
  PAID = 'paid',
}

@Entity()
export class Booking {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { eager: true })
  @ApiProperty({ type: () => User })
  customer: User;

  @ManyToOne(() => Service, { eager: true })
  @ApiProperty({ type: () => Service })
  service: Service;

  @ApiProperty()
  @Column()
  scheduledDate: Date;

  @ApiProperty({ enum: BookingStatus })
  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, { eager: true, nullable: true })
  @ApiProperty({ type: () => User, required: false })
  technician: User;

  @Column({ type: 'int', nullable: true })
  @ApiProperty({ required: false })
  rating: number;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({ required: false })
  comment: string | null;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.UNPAID,
  })
  @ApiProperty({ enum: PaymentStatus })
  paymentStatus: PaymentStatus;
}

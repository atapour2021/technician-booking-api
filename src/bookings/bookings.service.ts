import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UsersService } from '../users/users.service';
import { ServicesService } from '../services/services.service';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepo: Repository<Booking>,
    private usersService: UsersService,
    private servicesService: ServicesService,
  ) {}

  async create(userId: number, dto: CreateBookingDto) {
    const user = await this.usersService.findById(userId);
    const service = await this.servicesService.findOne(dto.serviceId);
    if (!user || !service) throw new NotFoundException();

    const booking = this.bookingRepo.create({
      customer: user,
      service,
      scheduledDate: new Date(dto.scheduledDate),
    });

    return this.bookingRepo.save(booking);
  }

  findByCustomer(userId: number) {
    return this.bookingRepo.find({
      where: { customer: { id: userId } },
      order: { scheduledDate: 'DESC' },
    });
  }
}

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking, BookingStatus } from './booking.entity';
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

  async updateStatus(id: number, status: BookingStatus) {
    const booking = await this.bookingRepo.findOneBy({ id });
    if (!booking) throw new NotFoundException('Booking not found');

    booking.status = status;
    return this.bookingRepo.save(booking);
  }

  async assignTechnician(bookingId: number, technicianId: number) {
    const booking = await this.bookingRepo.findOneBy({ id: bookingId });
    if (!booking) throw new NotFoundException('Booking not found');

    const technician = await this.usersService.findById(technicianId);
    if (!technician || technician.role !== 'technician') {
      throw new BadRequestException('Technician not found or invalid');
    }

    booking.technician = technician;
    return this.bookingRepo.save(booking);
  }

  async findByTechnician(technicianId: number) {
    return this.bookingRepo.find({
      where: { technician: { id: technicianId } },
      order: { scheduledDate: 'ASC' },
    });
  }

  async technicianUpdateStatus(
    bookingId: number,
    technicianId: number,
    status: BookingStatus,
  ) {
    const booking = await this.bookingRepo.findOne({
      where: { id: bookingId },
      relations: ['technician'],
    });

    if (!booking) throw new NotFoundException('Booking not found');
    if (!booking.technician || booking.technician.id !== technicianId) {
      throw new ForbiddenException('This booking is not assigned to you');
    }

    if (![BookingStatus.DONE, BookingStatus.CANCELED].includes(status)) {
      throw new BadRequestException(
        'Technician can only set status to done or canceled',
      );
    }

    booking.status = status;
    return this.bookingRepo.save(booking);
  }

  async rateBooking(
    bookingId: number,
    userId: number,
    rating: number,
    comment?: string,
  ) {
    const booking = await this.bookingRepo.findOne({
      where: { id: bookingId },
      relations: ['customer'],
    });

    if (!booking) throw new NotFoundException('Booking not found');

    if (booking.customer.id !== userId) {
      throw new ForbiddenException('This booking does not belong to you');
    }

    if (booking.status !== BookingStatus.DONE) {
      throw new BadRequestException('You can only rate completed bookings');
    }

    if (booking.rating) {
      throw new BadRequestException('This booking has already been rated');
    }

    booking.rating = rating;
    booking.comment = comment ? comment : null;
    return this.bookingRepo.save(booking);
  }
}

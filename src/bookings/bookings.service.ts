import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking, BookingStatus, PaymentStatus } from './booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UsersService } from '../users/users.service';
import { ServicesService } from '../services/services.service';
import { FilterBookingsDto } from './dto/filter-bookings.dto';

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

  async payForBooking(
    bookingId: number,
    userId: number,
    paymentReference: string,
  ) {
    const booking = await this.bookingRepo.findOne({
      where: { id: bookingId },
      relations: ['customer'],
    });

    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.customer.id !== userId) {
      throw new ForbiddenException('This booking is not yours');
    }
    if (booking.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('Booking already paid');
    }

    // fake validation of paymentReference here if needed

    booking.paymentStatus = PaymentStatus.PAID;
    // you can also save the reference if you want
    return this.bookingRepo.save(booking);
  }

  async findById(id: number) {
    return this.bookingRepo.findOne({
      where: { id },
      relations: ['customer', 'service', 'technician'],
    });
  }

  async markAsPaid(
    bookingId: number,
    authority: string,
    refId: string,
    cardPan: string,
  ) {
    const booking = await this.bookingRepo.findOneBy({ id: bookingId });
    if (!booking) throw new NotFoundException('Booking not found');

    booking.paymentStatus = PaymentStatus.PAID;
    booking.paymentAuthority = authority;
    booking.paymentRefId = refId;
    booking.paymentCardPan = cardPan;

    return this.bookingRepo.save(booking);
  }

  async getBookingPaymentInfo(bookingId: number) {
    const booking = await this.bookingRepo.findOne({
      where: { id: bookingId },
      relations: ['customer', 'service', 'technician'],
    });

    if (!booking) throw new NotFoundException('Booking not found');

    return {
      bookingId: booking.id,
      customer: {
        id: booking.customer.id,
        name: booking.customer.fullName,
        email: booking.customer.email,
      },
      technician: booking.technician
        ? {
            id: booking.technician.id,
            name: booking.technician.fullName,
          }
        : null,
      service: {
        id: booking.service.id,
        name: booking.service.name,
        basePrice: booking.service.basePrice,
      },
      payment: {
        status: booking.paymentStatus,
        authority: booking.paymentAuthority,
        refId: booking.paymentRefId,
        cardPan: booking.paymentCardPan,
      },
    };
  }

  async getFilteredPayments(filter: FilterBookingsDto) {
    const qb = this.bookingRepo
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.customer', 'customer')
      .leftJoinAndSelect('booking.technician', 'technician')
      .leftJoinAndSelect('booking.service', 'service');

    if (filter.paymentStatus) {
      qb.andWhere('booking.paymentStatus = :status', {
        status: filter.paymentStatus,
      });
    }

    if (filter.technicianId) {
      qb.andWhere('technician.id = :techId', { techId: filter.technicianId });
    }

    if (filter.startDate) {
      qb.andWhere('booking.createdAt >= :startDate', {
        startDate: filter.startDate,
      });
    }

    if (filter.endDate) {
      qb.andWhere('booking.createdAt <= :endDate', { endDate: filter.endDate });
    }

    qb.skip(filter.skip)
      .take(filter.limit)
      .orderBy('booking.createdAt', 'DESC');

    const [items, total] = await qb.getManyAndCount();

    return {
      total,
      page: filter.page,
      limit: filter.limit,
      data: items,
    };
  }
}

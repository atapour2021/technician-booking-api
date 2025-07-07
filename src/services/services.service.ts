import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking } from 'src/bookings/booking.entity';
import { CategoryService } from 'src/category/category.service';
import { Repository } from 'typeorm';
import { CreateServiceDto } from './dto/create-service.dto';
import { Service } from './service.entity';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private serviceRepo: Repository<Service>,
    private categoryService: CategoryService,
    @InjectRepository(Booking)
    private bookingRepo: Repository<Booking>,
  ) {}

  async findAll(): Promise<Service[]> {
    return await this.serviceRepo.find();
  }

  async findOne(id: number): Promise<Service | null> {
    return await this.serviceRepo.findOneBy({ id });
  }

  async create(dto: CreateServiceDto): Promise<Service> {
    const category = await this.categoryService.findOneBy(dto.categoryId);
    if (!category) throw new NotFoundException('Category not found');

    const service = this.serviceRepo.create({ ...dto, category });
    return await this.serviceRepo.save(service);
  }

  async remove(id: number) {
    const usedInBookings = await this.bookingRepo.count({
      where: { service: { id } },
    });

    if (usedInBookings > 0) {
      throw new BadRequestException(
        'Cannot delete service. It is used in a booking.',
      );
    }

    const service = await this.serviceRepo.findOneBy({ id });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return await this.serviceRepo.remove(service);
  }
}

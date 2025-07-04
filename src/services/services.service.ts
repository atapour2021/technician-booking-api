import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './service.entity';
import { CreateServiceDto } from './dto/create-service.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private serviceRepo: Repository<Service>,
  ) {}

  findAll(): Promise<Service[]> {
    return this.serviceRepo.find();
  }

  findOne(id: number): Promise<Service | null> {
    return this.serviceRepo.findOneBy({ id });
  }

  create(dto: CreateServiceDto): Promise<Service> {
    const service = this.serviceRepo.create(dto);
    return this.serviceRepo.save(service);
  }

  async remove(id: number): Promise<void> {
    await this.serviceRepo.delete(id);
  }
}

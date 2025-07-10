import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTechnicianDto } from './dto/create-technician.dto';
import { Technician } from './entity/technician.entity';

@Injectable()
export class TechniciansService {
  constructor(
    @InjectRepository(Technician)
    private technicianRepo: Repository<Technician>,
  ) {}

  async create(dto: CreateTechnicianDto): Promise<Technician> {
    const technician = this.technicianRepo.create(dto);
    return this.technicianRepo.save(technician);
  }

  async findById(id: number): Promise<Technician | null> {
    return await this.technicianRepo.findOne({
      where: { id },
      relations: ['skills', 'serviceAreas', 'documents'],
    });
  }
}

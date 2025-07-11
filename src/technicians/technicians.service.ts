import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTechnicianDto } from './dto/create-technician.dto';
import { Technician } from './entity/technician.entity';
import { UpdateTechnicianDto } from './dto/update-technician.dto';
import { User, UserRole } from 'src/users/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TechniciansService {
  constructor(
    @InjectRepository(Technician)
    private technicianRepo: Repository<Technician>,

    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async findAll(): Promise<Technician[]> {
    return await this.technicianRepo.find();
  }

  async create(data: CreateTechnicianDto): Promise<Technician> {
    const user = this.userRepo.create(data.user);
    const hashed = await bcrypt.hash(user.password, 10);
    user.role = UserRole.TECHNICIAN;
    user.password = hashed;
    const userData = await this.userRepo.save(user);
    data.user = userData;
    const technician = this.technicianRepo.create(data);
    return await this.technicianRepo.save(technician);
  }

  async update(id: number, updateDto: UpdateTechnicianDto) {
    const technician = await this.technicianRepo.findOne({
      where: { id },
      relations: ['user', 'skills', 'serviceAreas', 'documents'],
    });

    if (!technician) {
      throw new NotFoundException('Technician not found');
    }

    if (updateDto.skills) {
      technician.skills = updateDto.skills;
    }

    if (updateDto.serviceAreas) {
      technician.serviceAreas = updateDto.serviceAreas;
    }

    if (updateDto.documents) {
      technician.documents = updateDto.documents;
    }

    Object.assign(technician, updateDto);

    return await this.technicianRepo.save(technician);
  }

  async findById(id: number): Promise<Technician | null> {
    return await this.technicianRepo.findOne({
      where: { id },
      relations: ['skills', 'serviceAreas', 'documents'],
    });
  }

  async remove(id: number): Promise<Technician | null> {
    const tech = await this.findById(id);
    if (!tech) throw new NotFoundException('Technician= not found');
    const user = tech.user;
    user.isActive = false;
    await this.userRepo.update({ id: user.id }, user);
    return await this.technicianRepo.remove(tech);
  }
}

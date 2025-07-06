import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { CategoryService } from 'src/category/category.service';
import { UpdateCategoryDto } from 'src/category/dto/update.category.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private serviceRepo: Repository<Service>,
    private categoryService: CategoryService,
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

    const categoryData = new UpdateCategoryDto();
    categoryData.description = category.description;
    categoryData.title = category.title;
    categoryData.service = service;
    await this.categoryService.update(category.id, categoryData);

    return await this.serviceRepo.save(service);
  }

  async remove(id: number): Promise<void> {
    await this.serviceRepo.delete(id);
  }
}

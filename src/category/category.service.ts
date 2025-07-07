import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './category.entity';
import { Repository } from 'typeorm';
import { CreateCategoryDtp } from './dto/create.category.dto';
import { UpdateCategoryDto } from './dto/update.category.dto';
import { Service } from 'src/services/service.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly repo: Repository<Category>,
    @InjectRepository(Service)
    private readonly serviceRepo: Repository<Service>,
  ) {}

  async create(data: CreateCategoryDtp): Promise<CreateCategoryDtp> {
    const category = this.repo.create(data);
    category.services = [];
    return await this.repo.save(category);
  }

  async findAll(): Promise<Category[]> {
    return await this.repo.find();
  }

  async findOneBy(id: number): Promise<Category | null> {
    return await this.repo.findOneBy({ id: id });
  }

  async update(id: number, data: UpdateCategoryDto) {
    const category = await this.repo.findOneBy({ id });
    if (!category) throw new NotFoundException('Category not found');

    category.title = data.title;
    category.description = data.description;
    category.services = !category.services ? [] : category.services;
    category.services = data.services;

    return await this.repo.save(category);
  }

  async remove(id: number): Promise<void> {
    const usedInServices = await this.serviceRepo.count({
      where: { category: { id } },
    });

    if (usedInServices > 0) {
      throw new BadRequestException(
        'Cannot delete category. It is used in a service.',
      );
    }

    const category = await this.repo.findOneBy({ id });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    await this.repo.remove(category);
  }
}

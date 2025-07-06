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

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly repo: Repository<Category>,
  ) {}

  async create(data: CreateCategoryDtp): Promise<CreateCategoryDtp> {
    const category = this.repo.create(data);
    return await this.repo.save(category);
  }

  async findAll(): Promise<Category[]> {
    return await this.repo.find();
  }

  async findOneBy(id: number): Promise<Category> {
    return await this.repo.findOneBy({ id: id });
  }

  async update(id: number, data: UpdateCategoryDto) {
    const category = await this.repo.findOneBy({ id });
    if (!category) throw new NotFoundException('Category not found');

    category.title = data.title;
    category.description = data.description;
    category.services = !category.services ? [] : category.services;
    category.services.push(data.service);

    return await this.repo.save(category);
  }

  async remove(id: number) {
    const category = await this.repo.findOneBy({ id });

    if (!category) throw new NotFoundException('Category not found');

    if (category.services.length > 0) {
      throw new BadRequestException();
    }
    return await this.repo.remove(category);
  }
}

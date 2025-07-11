import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { FilterUserDto } from './dto/filter.user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.userRepo.find();
  }

  findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    return await this.userRepo.findOne({ where: { id } });
  }

  async updateUser(id: number, data: Partial<User>) {
    return await this.userRepo.update({ id }, data);
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepo.create(userData);
    return await this.userRepo.save(user);
  }

  async findAllWithFilter(options: FilterUserDto) {
    const qb = this.userRepo.createQueryBuilder('user');

    if (options.role) {
      qb.andWhere('user.role = :role', { role: options.role });
    }

    if (options.search) {
      qb.andWhere('user.name ILIKE :search OR user.email ILIKE :search', {
        search: `%${options.search}%`,
      });
    }

    qb.skip((options.page - 1) * options.limit)
      .take(options.limit)
      .orderBy('user.id', 'DESC');

    const [data, total] = await qb.getManyAndCount();
    return {
      data,
      total,
      page: options.page,
      limit: options.limit,
    };
  }

  async deleteUser(id: number) {
    await this.userRepo.delete(id);
    return { success: true };
  }

  async findByPhone(phone: string): Promise<User | null> {
    return await this.userRepo.findOne({ where: { phone } });
  }

  async createUserByPhone(phone: string): Promise<User> {
    const user = this.userRepo.create({ phone });
    return await this.userRepo.save(user);
  }

  async findOrCreateByPhone(phone: string): Promise<User> {
    const existing = await this.findByPhone(phone);
    if (existing) return existing;
    return this.createUserByPhone(phone);
  }
}

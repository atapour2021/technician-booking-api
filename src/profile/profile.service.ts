import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import { join } from 'path';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(private usersService: UsersService) {}

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const updateData = new User();

    if (dto.fullName) updateData.fullName = dto.fullName;
    if (dto.password) {
      const hashed = await bcrypt.hash(dto.password, 10);
      updateData.password = hashed;
    }

    await this.usersService.updateUser(userId, updateData);
    return this.usersService.findById(userId);
  }

  async getProfileImage(id: number): Promise<string> {
    const user = await this.usersService.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.avatarUrl) {
      throw new NotFoundException('Avatar not found');
    }

    const filePath = join(__dirname, '..', '..', user.avatarUrl);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }

    return filePath;
  }

  async deleteAvatar(userId: number) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.avatarUrl) {
      const filePath = join(__dirname, '..', '..', user.avatarUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      await this.usersService.updateUser(userId, { avatarUrl: undefined });
    }
  }
}
